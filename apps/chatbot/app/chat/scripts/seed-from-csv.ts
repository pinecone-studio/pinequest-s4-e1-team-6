import 'dotenv/config';
import fs from 'fs';
import csv from 'csv-parser';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import crypto from 'crypto';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('chatbot');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY! });

async function seedFromCSV() {
  const products: any[] = [];
  const fileName = 'data/products.csv'; 
  const EXCHANGE_RATE = 3600; 

  console.log(`📖 ${fileName} файлыг уншиж байна...`);
  
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', (row: any) => {
      const fullTitle = row.product_title || row.title || "";
      const image = row.product_image_url || row.image_url;
      const url = row.product_page_url || row.product_url || ""; 

      const parsePrice = (val: any) => parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
      
      const priceUSD = parsePrice(row.discounted_price || row.price);
      const actualPriceUSD = parsePrice(row.actual_price) || priceUSD;
      
      const priceMNT = Math.round(priceUSD * EXCHANGE_RATE);
      const actualPriceMNT = Math.round(actualPriceUSD * EXCHANGE_RATE);

      const discountPercent = actualPriceMNT > priceMNT 
        ? Math.round(((actualPriceMNT - priceMNT) / actualPriceMNT) * 100) 
        : 0;

      if (fullTitle && image && image.startsWith('http')) {
        const words = fullTitle.split(' ');
        const shortName = words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');

        products.push({
          name: shortName,
          full_name: fullTitle,
          price_mnt: priceMNT,
          actual_price_mnt: actualPriceMNT,
          discount_percent: discountPercent,
          rating: parseFloat(row.ratings || row.rating) || 0,
          reviews_count: parseInt(row.no_of_ratings) || 0,
          category: row.main_category || "General",
          color: extractFeature(fullTitle, ['black', 'white', 'blue', 'red', 'silver', 'gold', 'grey', 'pink', 'green']),
          size: extractSize(fullTitle), 
          brand: row.brand || "Amazon",
          description: fullTitle,
          image_url: image,
          product_url: url, 
        });
      }
    })
    .on('end', async () => {
      console.log(`✅ ${products.length} бараа бэлэн боллоо. Pinecone руу илгээж байна...`);
      
      const BATCH_SIZE = 50;
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        try {
          const batch = products.slice(i, i + BATCH_SIZE);
          
          const texts = batch.map(p => 
            `Бараа: ${p.full_name}. Ангилал: ${p.category}. Брэнд: ${p.brand}. Үнэ: ${p.price_mnt} төгрөг. Үнэлгээ: ${p.rating}. Өнгө: ${p.color}.`.slice(0, 1000)
          );
          
          const embedRes = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: texts,
          });

          const records = batch.map((p, idx) => ({
            id: crypto.createHash('md5').update(p.full_name + (i + idx)).digest('hex'),
            values: embedRes.data[idx].embedding,
            metadata: {
              name: p.name,
              full_name: p.full_name,
              price: p.price_mnt, 
              actual_price: p.actual_price_mnt,
              discount_percent: p.discount_percent,
              rating: p.rating,
              reviews_count: p.reviews_count,
              category: p.category,
              color: p.color,
              size: p.size,
              brand: p.brand,
              description: p.description,
              image_url: p.image_url,
              product_url: p.product_url,
              currency: "MNT"
            }
          }));

          await index.upsert({records: records});
          console.log(`🚀 Багц ${Math.floor(i/BATCH_SIZE) + 1} / ${Math.ceil(products.length/BATCH_SIZE)} амжилттай.`);
          
          await new Promise(r => setTimeout(r, 200));
        } catch (err) {
          console.error(`❌ Алдаа (Batch starting at ${i}):`, err);
        }
      }
      console.log('🎯 Дууслаа!');
    });
}

function extractFeature(text: string, features: string[]): string {
  const lowerText = text.toLowerCase();
  for (const feature of features) {
    if (lowerText.includes(feature)) return feature;
  }
  return "Standard";
}

function extractSize(text: string): string {
  const sizeRegex = /(\d+(\.\d+)?-inch|\d+GB|\d+TB|S|M|L|XL|XXL)/i;
  const match = text.match(sizeRegex);
  return match ? match[0] : "Standard";
}

seedFromCSV().catch(console.error);