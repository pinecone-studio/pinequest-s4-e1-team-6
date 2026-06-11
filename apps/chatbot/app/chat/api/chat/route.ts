import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { index } from "@/lib/api/pinecone";
import { prisma } from "@/lib/prisma";
import { getStoreNamespaces } from "@/lib/search/get-store-namespaces";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  timeout: 30000,
});

type IncomingMessage = {
  role: "USER" | "ASSISTANT" | "SYSTEM" | "user" | "assistant" | "system";
  content: string;
};

type OpenAIRole = "user" | "assistant" | "system";

type ProductMatch = {
  id?: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

const FALLBACK_NAMESPACES = [
  "Turuu's store",
  "sadadasda",
  "sephora",
  "ETRNTY",
  "Tugss store",
];

const SEARCH_STOP_WORDS = new Set([
  "bnuu",
  "bn",
  "baina",
  "baraa",
  "бараа",
  "байна",
  "байнуу",
  "байгаа",
  "байгаа юу",
  "bgaa",
  "yu",
  "uu",
  "юу",
  "уу",
  "вэ",
  "ve",
  "gehed",
  "гэсэн",
  "нертэй",
  "нэртэй",
]);

function normalizeOpenAIRole(role: IncomingMessage["role"]): OpenAIRole {
  const r = role.toLowerCase();
  if (r === "assistant") return "assistant";
  if (r === "system") return "system";
  return "user";
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesNormalizedText(source: string, target: string) {
  return normalizeSearchText(source).includes(normalizeSearchText(target));
}

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    const body = await req.json();

    const messages = body?.messages as IncomingMessage[] | undefined;
    const chatId = body?.chatId as string | undefined;
    const fallbackUserId = body?.userId as string | undefined;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    const lastUserMessage = messages[messages.length - 1]?.content?.trim();
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "Last message content is required" },
        { status: 400 },
      );
    }

    let context = "";
    let requestedBrand = "";
    let requestedCategory = "";
    try {
      const searchTerms = extractSearchTerms(lastUserMessage);
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: lastUserMessage,
      });

      const namespaces = await getSearchNamespaces();

      const queryPromises = namespaces.map((ns) =>
        index.namespace(ns).query({
          vector: embedding.data[0].embedding,
          topK: 100,
          includeMetadata: true,
        }),
      );

      const queryResults = await Promise.allSettled(queryPromises);
      const allMatches = queryResults.flatMap((result) =>
        result.status === "fulfilled" ? result.value.matches || [] : [],
      );

      let topMatches = allMatches
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 20);

      const availableBrands = Array.from(
        new Set(
          allMatches
            .map((match) => String(match.metadata?.brand || "").trim())
            .filter(Boolean),
        ),
      );

      const availableCategories = Array.from(
        new Set(
          allMatches
            .map((match) =>
              String(
                match.metadata?.category ||
                  match.metadata?.product_type ||
                  match.metadata?.main_category ||
                  "",
              ).trim(),
            )
            .filter(Boolean),
        ),
      );

      const matchedBrand = availableBrands.find((brand) =>
        includesNormalizedText(lastUserMessage, brand),
      );

      const matchedCategory = availableCategories.find((category) =>
        includesNormalizedText(lastUserMessage, category),
      );

      if (matchedBrand || matchedCategory) {
        requestedBrand = matchedBrand || "";
        requestedCategory = matchedCategory || "";
        const filteredMatches = topMatches.filter((match) => {
          const matchBrand = String(match.metadata?.brand || "").trim();
          const matchCategory = String(
            match.metadata?.category ||
              match.metadata?.product_type ||
              match.metadata?.main_category ||
              "",
          ).trim();
          const matchName = String(
            match.metadata?.name || match.metadata?.product_name || "",
          ).trim();

          const brandOk = matchedBrand
            ? includesNormalizedText(matchBrand, matchedBrand) ||
              includesNormalizedText(matchName, matchedBrand)
            : true;
          const categoryOk = matchedCategory
            ? includesNormalizedText(matchCategory, matchedCategory)
            : true;

          return brandOk && categoryOk;
        });

        if (filteredMatches.length > 0) {
          topMatches = filteredMatches;
        }
      }

      // context = topMatches
      //   .map((m) => {
      //     const name = m.metadata?.name || m.metadata?.product_name || "Нэргүй бараа";
      //     const price = m.metadata?.price || m.metadata?.formatted_price || "0";
      //     const img = m.metadata?.product_image_url || m.metadata?.image_url || "";
      //     const desc = m.metadata?.description || "Тайлбар байхгүй";
      //     const storeName = m.metadata?.store_name || "Official Store";

      //     return `БҮТЭЭГДЭХҮҮН: ${name}
      //     ҮНЭ: ${price}₮
      //     ЗУРАГ: ${img}
      //     ТАЙЛБАР: ${desc}
      //     ID: ${m.id}
      //     STORE_NAME: ${storeName}
      //     STORE_ID: ${m.metadata?.store_id || "store-001"}`;
      //   })
      //   .join("\n---\n");

      context = topMatches
        .map((m) => {
          const name =
            m.metadata?.name || m.metadata?.product_name || "Нэргүй бараа";
          const price = m.metadata?.price || "0";
          const img =
            m.metadata?.product_image_url || m.metadata?.image_url || "";
          const desc = m.metadata?.description || "Тайлбар байхгүй";
          const storeName =
            m.metadata?.store_name || m.metadata?.storeName || "Official Store";
          const storeId = m.metadata?.storeId || m.metadata?.store_id || "";
          const brand = m.metadata?.brand || "";
          const category =
            m.metadata?.category ||
            m.metadata?.product_type ||
            m.metadata?.main_category ||
            "";

          return `БҮТЭЭГДЭХҮҮН: ${name}
ҮНЭ: ${price}₮
ЗУРАГ: ${img}
ТАЙЛБАР: ${desc}
БРЕНД: ${brand}
CATEGORY: ${category}
ID: ${m.id}
STORE_NAME: ${storeName}
STORE_ID: ${storeId}`;
        })
        .join("\n---\n");

      if (requestedBrand || requestedCategory) {
        context = `ХАИЛТЫН ШҮҮЛТ:
REQUESTED_BRAND: ${requestedBrand || "NONE"}
REQUESTED_CATEGORY: ${requestedCategory || "NONE"}

${context}`;
      }

      console.log("Олдсон барааны тоо:", topMatches.length);
      console.log("Keyword match барааны тоо:", keywordMatches.length);
    } catch (err) {
      console.error("Vector Search Error:", err);
    }

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Чи бол өгөгдсөн Context (Pinecone дата) дээр үндэслэн ажилладаг Монголын хамгийн ухаалаг "Shopping Assistant" юм.
          
      --- ЧУХАЛ: ХАТУУ ХЯЗГААРЛАЛТ (CRITICAL RULES) ---
      1. ЗӨВХӨН CONTEXT АШИГЛА: Өгөгдсөн Context дотор байхгүй барааг хэзээ ч бүү зохио. Хэрэв Context дотор хэрэглэгчийн хайсан бараа байхгүй бол "Уучлаарай, манайд яг одоо [барааны нэр] алга байна" гэж хариул.
      1.1. Хэрэв REQUESTED_BRAND эсвэл REQUESTED_CATEGORY бөглөгдсөн бөгөөд Context дотор 1+ тохирох бараа байвал "байхгүй байна" гэж ХЭЗЭЭ Ч битгий хэл. Шууд тухайн тохирох бараануудыг харуул.
      2. ХӨНДЛӨНГИЙН МЭДЛЭГ ХОРИГЛОХ: Өөрийн сургагдсан мэдээллийн санд байгаа ерөнхий мэдлэгээ ашиглан бараа санал болгохыг ХАТУУ ХОРИГЛОНО.
      3. ЗУРГИЙН ДҮРЭМ: Зөвхөн Context дотор ирсэн 'image_url' эсвэл 'ЗУРАГ' линкийг ашигла. Хэрэв Context-д зураг байхгүй бол зургийн хэсгийг хоосон орхи эсвэл "Зураггүй бараа" гэж тэмдэглэ. ХЭЗЭЭ Ч гадны (loremflickr, google гэх мэт) линк бүү ашигла.
      4. TEMPERATURE CHECK: Чи маш бодит (grounded) байх ёстой. Барааны нэр, үнэ, тайлбар бүгд Context-той 100% таарах ёстой.
      
      --- САНАЛ БОЛГОХ ЛОГИК (PROACTIVE SELLING) ---
      1. Хэрэв хэрэглэгчийн хайсан яг тэр брэнд эсвэл бараа Context-д БАЙХГҮЙ бол Context-оос дараах дарааллаар санал болго:
         - Ижил төрлийн (Category) өөр брэндийн бараа.
         - Context дотор байгаа хамгийн эрэлттэй эсвэл ойролцоо брэндүүд.
         - Жишээ хариулт: "Уучлаарай, яг одоо [Брэнд] байхгүй байна. Гэхдээ манайд ижил төрлийн маш чанартай [Context-д байгаа өөр бараа] байгаа, та сонирхох уу?"
      2. Хэрэглэгч ерөнхий зүйл асуувал Context-д байгаа бүх төрлөөс төлөөлөл болгож хамгийн багадаа 10 барааг (эсвэл олдох бүх барааг) жагсааж харуул.
      3. Хэрэв хэрэглэгч тодорхой брэнд эсвэл category нэрлэвэл зөвхөн тэр брэнд/category-той холбоотой барааг харуул. Өөр unrelated бараа, өөр category хольж оруулахыг хориглоно.
      4. Хэрэв хэрэглэгч brand/category тодорхойлоогүй бол л өргөн хүрээний холимог санал болго.

      --- БАРААНЫ ТӨЛӨӨЛӨЛ (PRODUCT DIVERSITY) ---
      1. Чи ЗӨВХӨН ГУТАЛ биш, Context дотор байгаа БҮХ төрлийн барааг (цамц, өмд, куртка, хэрэгсэл гэх мэт) ижил түвшинд санал болгох ёстой. 
      2. Хэрэглэгч ерөнхий зүйл асуувал (жишээ нь: "Юу байна?") Context-д байгаа өөр өөр төрлийн (category) бараануудыг хольж харуул. Нэг төрлөөр (жишээ нь зөвхөн пүүзээр) хариултыг бүү хязгаарла.
      3. Гэхдээ хэрэглэгчийн асуулт тодорхой брэнд/category агуулж байвал зөвхөн тэр чиглэлтэй тохирох бараануудыг харуул. Жишээ нь "Nike" гэж асуувал Nike-той холбоогүй цамц, бусад брэндийн барааг бүү оруул.

      --- БАЙХГҮЙ БАРААГ ОРЛУУЛАХ ---
      1. Хэрэв хэрэглэгчийн хайсан бараа эсвэл брэнд Context дотор ОРТ БАЙХГҮЙ бол "Уучлаарай, яг таны хайсан [нэр] манайд байхгүй байна. Гэхдээ манай дэлгүүрт байгаа дараах бараанууд танд таалагдаж магадгүй:" гээд Context-д байгаа ОЙРОЛЦОО бүх барааг төрлөөр эсвэл өөр төрлийн шилдэг бараануудыг санал болго. 

      ЧУХАЛ: Хэрэглэгчийн хүсэлтэд нийцэх бараа олон байвал хариултыг бүү богиносго. Боломжит бүх барааг Markdown форматаар жагсааж харуул.

      --- ХАРИЛЦААНЫ ХЭЛБЕР ---
      1. Найрсаг, эелдэг, туслахад бэлэн бай (✨, 😊).
      2. Хэрэглэгчийг сонголтоо тодорхой болгоход нь туслах асуулт асуу.
      3. УЯН ХАТАН ХАЙЛТ: Хэрэглэгч "Nike" гэж асуухад Context дотор "Nike Air Max" байвал үүнийг шууд харуул. Утгын хувьд ойролцоо байхад хангалттай.
      
    

--- БАРАА ХАРУУЛАХ ФОРМАТ (MARKDOWN) ---
Бараа харуулахдаа ЗААВАЛ дараах форматыг ашигла:
![Нэр|Үнэ|Тайлбар|ID|Бренд|STORE_ID|STORE_NAME](Зургийн_URL)

Жишээ:
![Nike Air Max|150000|Гүйлтийн гутал|prod_1748291234|Nike|cm9abc123|Turuu's store](https://image.url)

ЧУХАЛ:
- Тусгаарлагч нь ЗААВАЛ | (pipe)
- parts[5] = STORE_ID (Context дахь STORE_ID-г заавал бич)
- parts[6] = STORE_NAME (Context дахь STORE_NAME-г заавал бич)
- STORE_ID хоосон бол STORE_NAME-г давтаж бич

═══ ТӨЛБӨРИЙН ЛОГИК ═══
PAYMENT_TRIGGER:{"id":"id","name":"name","price":price}

═══ CONTEXT (ӨГӨГДӨЛ) ═══
${context}`,
        },
        ...messages.map((m) => ({
          role: normalizeOpenAIRole(m.role),
          content: m.content,
        })),
      ],
      temperature: 0.6,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
      max_tokens: 2500,
    });

    let aiReply =
      chatResponse.choices[0]?.message?.content?.trim() || "Хариу олдсонгүй.";

    if (guardedKeywordMatches.length > 0 && hasUnavailableClaim(aiReply)) {
      aiReply = buildMatchedProductReply(guardedKeywordMatches);
    }

    const effectiveUserId = clerkUserId || fallbackUserId;
    if (effectiveUserId && chatId && !chatId.startsWith("guest_")) {
      try {
        const dbUser = await prisma.user.upsert({
          where: { clerkUserId: effectiveUserId },
          update: {},
          create: {
            clerkUserId: effectiveUserId,
            email: `${effectiveUserId}@internal.user`,
            password: "CLERK_MANAGED",
            name: "User",
          },
        });

        const session = await prisma.chatSession.upsert({
          where: { id: String(chatId) },
          update: { updatedAt: new Date(), userId: dbUser.id },
          create: {
            id: String(chatId),
            userId: dbUser.id,
            title: lastUserMessage.slice(0, 40),
          },
        });

        await prisma.chatMessage.createMany({
          data: [
            {
              chatSessionId: session.id,
              role: "USER",
              content: lastUserMessage,
            },
            { chatSessionId: session.id, role: "ASSISTANT", content: aiReply },
          ],
        });
      } catch (dbError) {
        console.error("PRISMA_SAVE_ERROR:", dbError);
      }
    }

    return NextResponse.json({ reply: aiReply });
  } catch (error: unknown) {
    console.error("API_GLOBAL_ERROR:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Error", details },
      { status: 500 },
    );
  }
}
