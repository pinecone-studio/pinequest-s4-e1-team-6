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
  "bnu",
  "bn",
  "baina",
  "baraa",
  "бараа",
  "байна",
  "байнуу",
  "байгаа",
  "байгаа юу",
  "bgaa",
  "bga",
  "yu",
  "uu",
  "юу",
  "уу",
  "вэ",
  "ve",
  "geed",
  "geer",
  "gheer",
  "geheer",
  "gehed",
  "mna",
  "manai",
  "delguurt",
  "delguur",
  "odoo",
  "odo",
  "nertei",
  "гэсэн",
  "нертэй",
  "нэртэй",
]);

const SEARCH_QUALITY_WORDS = new Set([
  "dajgui",
  "dajgu",
  "dajgvi",
  "gaigui",
  "gaigu",
  "goy",
  "goe",
  "saihan",
  "sain",
  "nice",
  "cool",
  "bolomjiin",
  "unetei",
  "hyamd",
  "hyamdhan",
]);

const SEARCH_TERM_ALIASES: Record<string, string[]> = {
  tsamts: ["t-shirt", "shirt", "tee"],
  tsamt: ["t-shirt", "shirt", "tee"],
  tsamtsnuud: ["t-shirt", "shirt", "tee"],
  futbalka: ["t-shirt", "shirt", "tee"],
  podvolk: ["t-shirt", "shirt", "tee"],
  huvtsas: ["clothing", "clothes", "apparel"],
  gutal: ["shoe", "shoes", "sneaker", "sneakers"],
  puuz: ["shoe", "shoes", "sneaker", "sneakers"],
  kurtka: ["jacket", "coat"],
  omd: ["pants", "jeans", "trousers"],
};

function normalizeOpenAIRole(role: IncomingMessage["role"]): OpenAIRole {
  const r = role.toLowerCase();
  if (r === "assistant") return "assistant";
  if (r === "system") return "system";
  return "user";
}

function normalizeSearchText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandSearchTerm(term: string) {
  const variants = new Set([term]);
  if (/^[a-z0-9-]+$/.test(term) && term.length > 4 && term.endsWith("n")) {
    variants.add(term.slice(0, -1));
  }
  for (const variant of Array.from(variants)) {
    for (const alias of SEARCH_TERM_ALIASES[variant] || []) {
      variants.add(alias);
    }
  }
  return Array.from(variants);
}

function extractSearchTerms(message: string) {
  return normalizeSearchText(message)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(
      (term) =>
        term.length > 1 &&
        !SEARCH_STOP_WORDS.has(term) &&
        !SEARCH_QUALITY_WORDS.has(term),
    )
    .flatMap(expandSearchTerm);
}

function metadataText(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return "";
  const sizes = Array.isArray(metadata.sizes) ? metadata.sizes.join(" ") : "";
  const colors = Array.isArray(metadata.colors)
    ? metadata.colors.join(" ")
    : "";
  return normalizeSearchText(
    [
      metadata.name,
      metadata.product_name,
      metadata.name_search,
      metadata.description,
      metadata.brand,
      metadata.brand_search,
      metadata.category,
      metadata.color,
      colors,
      metadata.size,
      sizes,
      metadata.sizeStock,
      metadata.size_stock,
    ].join(" "),
  );
}

function hasKeywordMatch(
  metadata: Record<string, unknown> | undefined,
  searchTerms: string[],
) {
  if (searchTerms.length === 0) return false;
  const haystack = metadataText(metadata);
  return searchTerms.some((term) => haystack.includes(term));
}

function isInStock(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return false;
  const status = String(metadata.status || "").toUpperCase();
  const stock = Number(metadata.stock ?? 0);

  return stock > 0 && status !== "OUT_OF_STOCK";
}

function uniqueById<T extends { id?: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = item.id || "";
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function hasUnavailableClaim(reply: string) {
  const normalizedReply = normalizeSearchText(reply);
  return [
    "алга",
    "байхгүй",
    "oldsongui",
    "oldsonгүй",
    "байхгуй",
    "bhgui",
    "bhgu",
  ].some((marker) => normalizedReply.includes(marker));
}

function markdownSafe(value: unknown) {
  return String(value || "")
    .replace(/[|\[\]\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatProductMarkdown(match: ProductMatch) {
  const metadata = match.metadata || {};
  const name = metadata.name || metadata.product_name || "Нэргүй бараа";
  const price = metadata.price || metadata.formatted_price || "0";
  const desc = metadata.description || "Тайлбар байхгүй";
  const id = match.id || metadata.id || "";
  const brand = metadata.brand || "";
  const storeName =
    metadata.store_name || metadata.storeName || "Official Store";
  const storeId = metadata.storeId || metadata.store_id || storeName;
  const img = metadata.product_image_url || metadata.image_url || "";

  return `![${markdownSafe(name)}|${markdownSafe(price)}|${markdownSafe(
    desc,
  )}|${markdownSafe(id)}|${markdownSafe(brand)}|${markdownSafe(
    storeId,
  )}|${markdownSafe(storeName)}](${img})`;
}

function buildMatchedProductReply(matches: ProductMatch[]) {
  const productLines = matches
    .slice(0, 20)
    .map(formatProductMarkdown)
    .join("\n");
  return `Тийм ээ, таны хайсан бараатай тохирох дараах бүтээгдэхүүнүүд байна:\n\n${productLines}`;
}

async function getSearchNamespaces() {
  try {
    const stats = await index.describeIndexStats();
    const dynamicNamespaces = Object.keys(stats.namespaces || {});
    return Array.from(new Set([...FALLBACK_NAMESPACES, ...dynamicNamespaces]));
  } catch (error) {
    console.error("Pinecone namespace stats error:", error);
    return FALLBACK_NAMESPACES;
  }
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
    let guardedKeywordMatches: ProductMatch[] = [];
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
      const allMatches = queryResults
        .flatMap((result) =>
          result.status === "fulfilled" ? result.value.matches || [] : [],
        )
        // Үлдэгдэл дууссан (OUT_OF_STOCK) барааг хэрэглэгчид харуулахгүй
        .filter((match) =>
          isInStock(match.metadata as Record<string, unknown> | undefined),
        );

      const keywordMatches = allMatches.filter((match) =>
        hasKeywordMatch(
          match.metadata as Record<string, unknown> | undefined,
          searchTerms,
        ),
      );
      guardedKeywordMatches = uniqueById(keywordMatches)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 20);

      const semanticMatches = allMatches
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 30);

      const topMatches = uniqueById([...keywordMatches, ...semanticMatches])
        .sort((a, b) => {
          const aKeyword = hasKeywordMatch(
            a.metadata as Record<string, unknown> | undefined,
            searchTerms,
          );
          const bKeyword = hasKeywordMatch(
            b.metadata as Record<string, unknown> | undefined,
            searchTerms,
          );
          if (aKeyword !== bKeyword) return aKeyword ? -1 : 1;
          return (b.score || 0) - (a.score || 0);
        })
        .slice(0, 80);

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
          const size = m.metadata?.size || "";
          const color = m.metadata?.color || "";
          const sizeStock =
            m.metadata?.sizeStock || m.metadata?.size_stock || "";
          const keywordMatch = hasKeywordMatch(
            m.metadata as Record<string, unknown> | undefined,
            searchTerms,
          );

          return `БҮТЭЭГДЭХҮҮН: ${name}
ҮНЭ: ${price}₮
ЗУРАГ: ${img}
ТАЙЛБАР: ${desc}
БРЕНД: ${brand}
ӨНГӨ: ${color}
РАЗМЕР: ${size}
РАЗМЕРЫН_ҮЛДЭГДЭЛ: ${sizeStock}
KEYWORD_MATCH: ${keywordMatch ? "YES" : "NO"}
ID: ${m.id}
STORE_NAME: ${storeName}
STORE_ID: ${storeId}`;
        })
        .join("\n---\n");

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
          content: `Чи бол өгөгдсөн Context (Pinecone дата) дээр тулгуурлан ажилладаг Монголын хамгийн ухаалаг "Shopping Assistant" юм. Чи ХОЁР горимд ажиллана — асуултын төрлийг эхлээд таниад дараа нь хариул.

═══ ГОРИМ ТАНИХ (INTENT DETECTION) ═══
- SEARCH горим — хэрэглэгч бараа ХАЙЖ/ҮЗЭХ гэж байвал (ж: "Nike байна уу?", "гутал харуулаач", "куртка бнуу?", "ямар бараа байна?", "өөр зүйл үзүүлээч"). → Context-оос тохирох барааг доорх Markdown форматаар жагсаа.
- CHAT горим — хэрэглэгч аль хэдийн харсан бараа эсвэл ерөнхий зүйлийн талаар АСУУЖ байвал (ж: "энэ гутал юунд зориулагдсан бэ?", "ямар хэмжээтэй вэ?", "заал дотор өмсөж болох уу?", "үнэ нь хэд вэ?", "арьс уу даавуу юу?", "ямар өнгөтэй вэ?", "энэ хоёрын ялгаа юу вэ?"). → ChatGPT шиг чөлөөтэй, дэлгэрэнгүй, найрсаг ТЕКСТЭЭР хариул. Markdown барааны карт (![...]) бүү дахин гарга.
- Эргэлзвэл: харилцааны түүх (chat history) дэх СҮҮЛД харуулсан барааг асуултын сэдэв гэж үз.

═══ CHAT ГОРИМЫН ДҮРЭМ ═══
1. Харилцааны түүхэнд аль хэдийн харуулсан барааг "байхгүй / алга" гэж ХЭЗЭЭ Ч бүү хэл. Тэр бараа дэлгүүрт байгаа нь батлагдсан зүйл.
2. Барааны ерөнхий шинжийг — юунд зориулагдсан, ямар материал, хэрхэн өмсөх, арчлах, ямар стиль/үе цагт тохирох, хэмжээний зөвлөгөө гэх мэт — ӨӨРИЙН МЭДЛЭГЭЭ ашиглан ChatGPT шиг дэлгэрэнгүй тайлбарлаж БОЛНО.
   (Жишээ: "Nike Air Max 90 бол өдөр тутмын lifestyle/спорт гутал. Air cushion улталттай тул удаан алхахад тав тухтай, заал дотор ч, гадаа ч өмсөж болно. Ихэвчлэн true-to-size, ердийн размераа аваарай.")
3. ҮНЭ, бэлэн эсэх, нөөц, дэлгүүрийн нэр зэргийг ЗӨВХӨН Context эсвэл chat history дэх БОДИТ мэдээллээр хариул — бүү зохио. (Жишээ: "Энэ Nike Air Max 90-ний үнэ 400,000₮.")
4. Хэрэв тодорхой техникийн дэлгэрэнгүй дэлгүүрийн дата дотор байхгүй бол ерөнхий мэдлэгээр хариулаад, шаардлагатай бол "дэлгүүрийн баталгаат мэдээлэл бол ..." гэж зааглаж болно. Гэхдээ үнэ/нөөцийг ХЭЗЭЭ Ч бүү зохио.
5. CHAT горимд бараа дахин жагсаахгүй, зөвхөн тухайн барааны тухай чөлөөт яриагаар хариул. Хэрэглэгч "өөр бараа үзүүлээч" гэвэл л SEARCH горим руу шилж жагса.

═══ SEARCH ГОРИМЫН ДҮРЭМ ═══
1. ЗӨВХӨН CONTEXT АШИГЛА: Context-д байхгүй БАРААГ (нэр/үнэ) хэзээ ч бүү зохио. Хэрэглэгчийн хайсан бараа байхгүй бол "Уучлаарай, манайд яг одоо [нэр] алга байна" гэж хэлээд ойролцоо/ижил төрлийн бараа санал болго.
2. KEYWORD_MATCH: YES бараа байвал хэрэглэгчийн хайсантай шууд таарсан гэсэн үг — бүгдийг эхэнд нь Markdown форматаар харуул, "байхгүй" гэж бүү хэл.
3. ЗУРГИЙН ДҮРЭМ: Зөвхөн Context-д ирсэн 'ЗУРАГ'/'image_url' линкийг ашигла. Гадны (loremflickr, google гэх мэт) линк ХЭЗЭЭ Ч бүү ашигла.
4. БАРААНЫ ТӨЛӨӨЛӨЛ: Зөвхөн гутал биш, Context дахь БҮХ төрлийн (цамц, өмд, куртка, хэрэгсэл г.м) барааг ижил түвшинд санал болго. Ерөнхий асуулт ("Юу байна?") дээр өөр өөр category-г хольж хамгийн багадаа 10 барааг жагса.
5. KEYWORD_MATCH: NO барааг зөвхөн нэмэлт санал болгоход ашигла.

═══ ХАРИЛЦААНЫ ХЭЛБЭР ═══
Найрсаг, эелдэг, туслахад бэлэн бай (✨, 😊). Хэрэглэгчийг сонголтоо тодорхой болгоход нь туслах асуулт асуу. Утгын хувьд ойролцоо байхад хангалттай (ж: "Nike" → "Nike Air Max"-ийг шууд харуул).

═══ БАРАА ХАРУУЛАХ ФОРМАТ (зөвхөн SEARCH горимд) ═══
Бараа харуулахдаа ЗААВАЛ:
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
