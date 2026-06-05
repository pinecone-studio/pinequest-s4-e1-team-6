import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { index } from "@/lib/api/pinecone";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  timeout: 30000,
});

type IncomingMessage = {
  role: "USER" | "ASSISTANT" | "SYSTEM" | "user" | "assistant" | "system";
  content: string;
};

function normalizeOpenAIRole(
  role: IncomingMessage["role"],
): "user" | "assistant" | "system" {
  const r = role.toLowerCase();
  if (r === "user" || r === "assistant" || r === "system") return r as any;
  return "user";
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

    // --- VECTOR SEARCH ---
    let context = "";
    try {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: lastUserMessage,
      });

      const namespaces = [
        "Turuu's store",
        "sadadasda",
        "sephora",
        "ETRNTY",
        "Tugss store",
      ];

      const queryPromises = namespaces.map((ns) =>
        index.namespace(ns).query({
          vector: embedding.data[0].embedding,
          topK: 20,
          includeMetadata: true,
        }),
      );

      const queryResults = await Promise.all(queryPromises);
      const allMatches = queryResults.flatMap((res) => res.matches || []);

      const topMatches = allMatches
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 20);

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

          return `БҮТЭЭГДЭХҮҮН: ${name}
ҮНЭ: ${price}₮
ЗУРАГ: ${img}
ТАЙЛБАР: ${desc}
БРЕНД: ${brand}
ID: ${m.id}
STORE_NAME: ${storeName}
STORE_ID: ${storeId}`;
        })
        .join("\n---\n");

      console.log("Олдсон барааны тоо:", topMatches.length);
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
      2. ХӨНДЛӨНГИЙН МЭДЛЭГ ХОРИГЛОХ: Өөрийн сургагдсан мэдээллийн санд байгаа ерөнхий мэдлэгээ ашиглан бараа санал болгохыг ХАТУУ ХОРИГЛОНО.
      3. ЗУРГИЙН ДҮРЭМ: Зөвхөн Context дотор ирсэн 'image_url' эсвэл 'ЗУРАГ' линкийг ашигла. Хэрэв Context-д зураг байхгүй бол зургийн хэсгийг хоосон орхи эсвэл "Зураггүй бараа" гэж тэмдэглэ. ХЭЗЭЭ Ч гадны (loremflickr, google гэх мэт) линк бүү ашигла.
      4. TEMPERATURE CHECK: Чи маш бодит (grounded) байх ёстой. Барааны нэр, үнэ, тайлбар бүгд Context-той 100% таарах ёстой.
      
      --- САНАЛ БОЛГОХ ЛОГИК (PROACTIVE SELLING) ---
      1. Хэрэв хэрэглэгчийн хайсан яг тэр брэнд эсвэл бараа Context-д БАЙХГҮЙ бол Context-оос дараах дарааллаар санал болго:
         - Ижил төрлийн (Category) өөр брэндийн бараа.
         - Context дотор байгаа хамгийн эрэлттэй эсвэл ойролцоо брэндүүд.
         - Жишээ хариулт: "Уучлаарай, яг одоо [Брэнд] байхгүй байна. Гэхдээ манайд ижил төрлийн маш чанартай [Context-д байгаа өөр бараа] байгаа, та сонирхох уу?"
      2. Хэрэглэгч ерөнхий зүйл асуувал Context-д байгаа бүх төрлөөс төлөөлөл болгож хамгийн багадаа 10 барааг (эсвэл олдох бүх барааг) жагсааж харуул.

      --- БАРААНЫ ТӨЛӨӨЛӨЛ (PRODUCT DIVERSITY) ---
      1. Чи ЗӨВХӨН ГУТАЛ биш, Context дотор байгаа БҮХ төрлийн барааг (цамц, өмд, куртка, хэрэгсэл гэх мэт) ижил түвшинд санал болгох ёстой. 
      2. Хэрэглэгч ерөнхий зүйл асуувал (жишээ нь: "Юу байна?") Context-д байгаа өөр өөр төрлийн (category) бараануудыг хольж харуул. Нэг төрлөөр (жишээ нь зөвхөн пүүзээр) хариултыг бүү хязгаарла.

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

ЧУХАЛ ДҮРЭМ:
- Тусгаарлагч нь ЗААВАЛ | (pipe) байх ёстой
- parts[5] = STORE_ID — Context дахь STORE_ID-г ЗААВАЛ бичнэ
- parts[6] = STORE_NAME — Context дахь STORE_NAME-г ЗААВАЛ бичнэ  
- STORE_ID хоосон байвал STORE_NAME-г давтаж бичнэ
 
      --- ТӨЛБӨРИЙН ЛОГИК ---
      PAYMENT_TRIGGER:{"id":"id","name":"name","price":price}
 
      --- CONTEXT (ӨГӨГДӨЛ) ---
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

    const aiReply =
      chatResponse.choices[0]?.message?.content?.trim() || "Хариу олдсонгүй.";

    // --- DB SAVE (PRISMA) ---
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
  } catch (error: any) {
    console.error("API_GLOBAL_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Error", details: error.message },
      { status: 500 },
    );
  }
}
