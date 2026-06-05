import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const indexName = 'chatbot'; 
const index = pc.index(indexName);

async function purgeEverything() {
  try {
    console.log(`🔍 '${indexName}' индексийг шалгаж байна...`);

    const stats = await index.describeIndexStats();
    const namespaces = stats.namespaces ? Object.keys(stats.namespaces) : [];

    if (stats.totalRecordCount === 0) {
      console.log("ℹ️ Индекс аль хэдийн хоосон байна.");
      return;
    }

    console.log(`🗑️ Нийт ${stats.totalRecordCount} вектор олдлоо. Устгаж байна...`);

    if (namespaces.length > 0) {
      for (const ns of namespaces) {
        console.log(`🧹 Namespace: '${ns}' цэвэрлэж байна...`);
        await index.namespace(ns).deleteAll();
      }
    } else {
      await index.deleteAll();
    }

    console.log("🎯 ХҮЛЭЭНЭ ҮҮ: Устгах хүсэлт илгээгдлээ. (Шинэчлэгдэхэд 10-30 секунд орно)");
    
    setTimeout(async () => {
        const finalStats = await index.describeIndexStats();
        console.log(`📊 Үлдсэн нийт вектор: ${finalStats.totalRecordCount || 0}`);
    }, 2000);

  } catch (err) {
    console.error("❌ Алдаа гарлаа:", err);
  }
}

purgeEverything();