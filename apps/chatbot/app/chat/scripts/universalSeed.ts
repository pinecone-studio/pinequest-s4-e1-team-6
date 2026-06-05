import 'dotenv/config';
import fs from 'fs';
import csv from 'csv-parser';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import crypto from 'crypto';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('chatbot');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY! });


const RATES = {
  USD: 3600,
  GBP: 4500,
  MNT: 1
};

async function universalSeed(fileName: string, type: string, namespace: string) {
  const items: any[] = [];
  
  console.log(`📖 ${fileName} уншиж байна...`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(fileName)
      .pipe(csv())
      .on('data', (row: any) => {
  
        const name = row.product_name || row.title || row.product_title || row.product_name || "Unknown Item";

        let rawPriceStr = String(row.price || row.final_price || row.discounted_price || row['Price (USD)'] || "0");
        let priceMNT = 0;

        if (rawPriceStr.includes('£')) {
          priceMNT = Math.round(parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) * RATES.GBP);
        } else if (rawPriceStr.includes('$') || fileName.toLowerCase().includes('amazon')) {
          priceMNT = Math.round(parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) * RATES.USD);
        } else {
          const num = parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) || 0;
          priceMNT = num < 1000 ? Math.round(num * RATES.USD) : num; 
        }


        const image = row.product_image_url || row.image_url || row.image || row.cover_image || "";

        if (name && name !== "Unknown Item") {
          items.push({
            name: name.slice(0, 60),
            full_name: name,
            price_mnt: priceMNT,
            image_url: image,
            category: row.category || row.product_type || row.main_category || type,
            metadata: {
              ...row,
              type: type,
              formatted_price: priceMNT,
              currency: "MNT"
            }
          });
        }
      })
      .on('end', async () => {
        console.log(`✅ ${items.length} дата бэлэн. Pinecone руу илгээж байна...`);


        const BATCH_SIZE = 50;
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE);

          const texts = batch.map(p => 
            `Төрөл: ${p.metadata.type}. Нэр: ${p.full_name}. Тайлбар: ${p.metadata.description || p.full_name}. Үнэ: ${p.price_mnt}₮`.slice(0, 1000)
          );

          const embedRes = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: texts,
          });

          const records = batch.map((p, idx) => ({
            id: crypto.createHash('md5').update(p.full_name + namespace + idx).digest('hex'),
            values: embedRes.data[idx].embedding,
            metadata: p.metadata
          }));


          await index.namespace(namespace).upsert({records:records});
          console.log(`🚀 ${namespace}: Багц ${Math.floor(i/BATCH_SIZE) + 1} амжилттай.`);
        }
        resolve(true);
      })
      .on('error', reject);
  });

}


async function runAllSeeds() {
  try {

  await universalSeed('data/books.csv', 'book', 'books-namespace');
  await universalSeed('data/skincare_products_clean.csv', 'beauty', 'beauty-namespace');
  await universalSeed('data/flipkard.csv', 'general', 'electronics-namespace');

    console.log('🎯 БҮХ ДАТА АМЖИЛТТАЙ СУУЛАА!');
  } catch (err) {
    console.error('❌ Алдаа гарлаа:', err);
  }
}

runAllSeeds();