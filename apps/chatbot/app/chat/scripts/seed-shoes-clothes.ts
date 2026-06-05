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
        const brand = row.Brand || row.brand || "";
        const model = row.Model || row.model || row.Type || row.Category || "";
        const color = row.Color || row.color || "";
        
        const name = row.product_name || row.title || row.product_title || 
                     `${brand} ${model} ${color}`.trim() || "Unknown Item";

        let rawPriceStr = String(row['Price (USD)'] || row.price || row.final_price || row.discounted_price || "0");
        
        if (rawPriceStr === "0") {
          const values = Object.values(row);
          const lastValue = String(values[values.length - 1]);
          if (!isNaN(parseFloat(lastValue))) rawPriceStr = lastValue;
        }

        let priceMNT = 0;
        const num = parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) || 0;

        if (rawPriceStr.includes('£')) {
          priceMNT = Math.round(num * RATES.GBP);
        } else {
          priceMNT = num < 1000 ? Math.round(num * RATES.USD) : num;
        }

        const image = row.product_image_url || row.image_url || row.image || row.cover_image || 
                      "https://placehold.co/600x400?text=No+Image";

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
              formatted_name: name,
              formatted_price: priceMNT,
              currency: "MNT",
              image_url: image
            }
          });
        }
      })
      .on('end', async () => {
        console.log(`✅ ${items.length} дата бэлэн. Pinecone руу илгээж байна...`);

        const BATCH_SIZE = 40;
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE);

          try {
            const texts = batch.map(p => 
              `Төрөл: ${p.metadata.type}. Нэр: ${p.full_name}. Үнэ: ${p.price_mnt}₮`.slice(0, 1000)
            );

            const embedRes = await openai.embeddings.create({
              model: 'text-embedding-3-small',
              input: texts,
            });

            const records = batch.map((p, idx) => ({
              id: crypto.createHash('md5').update(p.full_name + namespace + (i + idx)).digest('hex'),
              values: embedRes.data[idx].embedding,
              metadata: p.metadata
            }));

            const upsertWithRetry = async (recs: any, retries = 3) => {
              try {
                await index.namespace(namespace).upsert({ records: recs });
              } catch (err) {
                if (retries > 0) {
                  console.log(`⚠️ Дахин оролдож байна... (${retries})`);
                  await new Promise(r => setTimeout(r, 2000));
                  return upsertWithRetry(recs, retries - 1);
                }
                throw err;
              }
            };

            await upsertWithRetry(records);
            console.log(`🚀 ${namespace}: Багц ${Math.floor(i/BATCH_SIZE) + 1} амжилттай.`);
            await new Promise(r => setTimeout(r, 500));

          } catch (err) {
            console.error(`❌ Багц ${i} дээр алдаа:`, err);
          }
        }
        resolve(true);
      })
      .on('error', reject);
  });
}

async function runAllSeeds() {
  try {
    // await universalSeed('data/Shoe prices.csv', 'shoes', 'shoes-namespace');
    // await universalSeed('data/clothes_price_prediction_data.csv', 'clothing', 'fashion-namespace');
    await universalSeed('data/most_used_beauty_cosmetics_products_extended 2.csv', 'most_used_beauty_cosmetics', 'most_used_beauty_cosmetics-namespace');

    console.log('🎯 БҮХ ДАТА АМЖИЛТТАЙ СУУЛАА!');
  } catch (err) {
    console.error('❌ Алдаа гарлаа:', err);
  }
}

runAllSeeds();