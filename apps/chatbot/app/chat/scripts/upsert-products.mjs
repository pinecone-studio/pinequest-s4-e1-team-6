import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY 
});
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_KEY 
});

const indexName = process.env.PINECONE_NAME || "chatbot";
const products = [
  {
    "id": "mn-001",
    "product_name": "Говь Кашмир - Сонгодог ноолууран ороолт",
    "formatted_price": 145000,
    "description": "100% цэвэр ноолуураар хийсэн, маш зөөлөн бөгөөд дулаахан сонгодог загварын ороолт. Олон өнгөний сонголттой, люкс зэрэглэлийн бүтээгдэхүүн.",
    "category": "cashmere",
    "image_keywords": "luxury cashmere scarf"
  },
  {
    "id": "mn-002",
    "product_name": "Lhamour - Сүүтэй гар аргаар хийсэн саван",
    "formatted_price": 12500,
    "description": "Монгол үнээний сүүтэй, арьс чийгшүүлж зөөлрүүлэх үйлчилгээтэй байгалийн гаралтай саван. Химийн нэмэлтгүй.",
    "category": "beauty",
    "image_keywords": "natural handmade soap milk"
  },
  {
    "id": "mn-003",
    "product_name": "АПУ - Сүүн засаг сүү 0.5л",
    "formatted_price": 4200,
    "description": "Ариутгасан, шинэхэн үнээний сүү. Тетарпак савлагаатай тул хадгалалтын горим сайн.",
    "category": "food",
    "image_keywords": "milk carton box"
  },
  {
    "id": "mn-004",
    "product_name": "Unitel - Smart Box",
    "formatted_price": 185000,
    "description": "Гэртээ өндөр хурдны интернэт болон Юнивишн үзэх боломжтой Android үйлдлийн системтэй ухаалаг төхөөрөмж.",
    "category": "tech",
    "image_keywords": "android tv box"
  },
  {
    "id": "mn-005",
    "product_name": "Талх Чихэр - Атар талх",
    "formatted_price": 2600,
    "description": "Монголчуудын хамгийн дуртай, уламжлалт аргаар барьсан зүсээгүй хар талх. Шинэхэн, зөөлөн.",
    "category": "food",
    "image_keywords": "round dark bread loaf"
  },
  {
    "id": "mn-006",
    "product_name": "Goyo - Ноолууран бээлий",
    "formatted_price": 55000,
    "description": "Өвлийн хүйтэнд дулаахан, хуруутай сонгодог загварын ноолууран бээлий. Хөнгөн бөгөөд зөөлөн.",
    "category": "cashmere",
    "image_keywords": "cashmere gloves"
  },
  {
    "id": "mn-007",
    "product_name": "Apple iPhone 15 Pro Max",
    "formatted_price": 5200000,
    "description": "256GB багтаамжтай, Титан их бие болон хамгийн хүчирхэг камер бүхий Apple-ийн шилдэг ухаалаг утас.",
    "category": "tech",
    "image_keywords": "iphone 15 pro max titanium"
  },
  {
    "id": "mn-008",
    "product_name": "Goo Brand - Чацарганатай нүүрний тос",
    "formatted_price": 28500,
    "description": "Монгол чацарганы тосоор баяжуулсан, арьс нөхөн төлжүүлэх болон гүн чийгшүүлэх үйлчилгээтэй нүүрний тос.",
    "category": "beauty",
    "image_keywords": "sea buckthorn face cream"
  },
  {
    "id": "mn-009",
    "product_name": "Хаан Бууз - Хөлдөөсөн бууз (Үхрийн мах)",
    "formatted_price": 24000,
    "description": "1кг савлагаатай, гар аргаар чимхсэн мэт амттай, дээд зэргийн үхрийн махтай хөлдөөсөн бууз.",
    "category": "food",
    "image_keywords": "steamed dumplings meat"
  },
  {
    "id": "mn-010",
    "product_name": "Samsung Galaxy S24 Ultra",
    "formatted_price": 4850000,
    "description": "AI функц болон S-Pen-ээр тоноглогдсон, хамгийн сүүлийн үеийн Android үйлдлийн системтэй флагман утас.",
    "category": "tech",
    "image_keywords": "samsung galaxy s24 ultra"
  },
  {
    "id": "mn-011",
    "product_name": "Витафит - Алимны жүүс 1л",
    "formatted_price": 3800,
    "description": "Байгалийн цэвэр алимны хандтай, витаминаар баялаг амтат жүүс. Хийжүүлээгүй.",
    "category": "food",
    "image_keywords": "apple juice box"
  },
  {
    "id": "mn-012",
    "product_name": "Bodios - Сарлагийн хөөврөн оймс",
    "formatted_price": 18000,
    "description": "Маш дулаахан, чийг татдаггүй, байгалийн сарлагийн хөөврөөр хийсэн эмчилгээний зориулалттай оймс.",
    "category": "cashmere",
    "image_keywords": "wool socks"
  },
  {
    "id": "mn-013",
    "product_name": "Sony WH-1000XM5",
    "formatted_price": 1350000,
    "description": "Дуу чимээ тусгаарлагчтай (ANC), утасгүй дээд зэрэглэлийн чихэвч. Батарей 30 цаг барина.",
    "category": "tech",
    "image_keywords": "sony wh-1000xm5 headphones"
  },
  {
    "id": "mn-014",
    "product_name": "Миний Сүү - Зөөхий 25%",
    "formatted_price": 5400,
    "description": "Өтгөн, амтлаг зөөхий. Зутан шөл болон салатанд хэрэглэхэд тохиромжтой байгалийн гаралтай.",
    "category": "food",
    "image_keywords": "sour cream bowl"
  },
  {
    "id": "mn-015",
    "product_name": "Lhamour - Чацарганы үрийн тос",
    "formatted_price": 35000,
    "description": "100% байгалийн цэвэр чацарганы тос. Арьсны үрэвсэл намдаах болон тэжээл өгөх үйлчилгээтэй.",
    "category": "beauty",
    "image_keywords": "sea buckthorn oil bottle"
  },
  {
    "id": "mn-016",
    "product_name": "Nintendo Switch OLED",
    "formatted_price": 1450000,
    "description": "Гэр бүлээрээ болон найзуудтайгаа тоглоход зориулсан 7 инчийн OLED дэлгэцтэй тоглоомын консол.",
    "category": "tech",
    "image_keywords": "nintendo switch oled"
  },
  {
    "id": "mn-017",
    "product_name": "Алтан Тариа - Дээд гурил 2кг",
    "formatted_price": 7200,
    "description": "Бүх төрлийн гурилан бүтээгдэхүүн хийхэд зориулагдсан дээд зэргийн улаан буудайн гурил.",
    "category": "food",
    "image_keywords": "flour bag"
  },
  {
    "id": "mn-018",
    "product_name": "Evseg - Ноолууран кардиган",
    "formatted_price": 320000,
    "description": "Загварлаг, зөөлөн, өдөр тутам өмсөхөд эвтэйхэн 100% ноолууран кардиган. Эмэгтэй загвар.",
    "category": "cashmere",
    "image_keywords": "cashmere cardigan sweater"
  },
  {
    "id": "mn-019",
    "product_name": "Logitech G Pro X Superlight 2",
    "formatted_price": 580000,
    "description": "Мэргэжлийн геймерүүдэд зориулсан хэт хөнгөн утасгүй тоглоомын хулгана. LIGHTSPEED технологитой.",
    "category": "tech",
    "image_keywords": "gaming mouse wireless"
  },
  {
    "id": "mn-020",
    "product_name": "Мах Импекс - Бөөрөнхий хиам",
    "formatted_price": 11500,
    "description": "Уламжлалт технологиор утсан, өглөөний цайнд хамгийн тохиромжтой үхрийн махан хиам.",
    "category": "food",
    "image_keywords": "salami sausage"
  },
  {
    "id": "mn-021",
    "product_name": "Golden Gobi - Шоколадны цуглуулга",
    "formatted_price": 35000,
    "description": "Монгол агуулга бүхий гоёмсог савлагаатай амтат шоколадны цуглуулга. Бэлэгт хамгийн тохиромжтой.",
    "category": "food",
    "image_keywords": "chocolate box gift"
  },
  {
    "id": "mn-022",
    "product_name": "Xiaomi Mi Band 8",
    "formatted_price": 145000,
    "description": "Эрүүл мэнд болон спортын идэвх хэмжигч, 150 гаруй спортын горимтой ухаалаг бугуйвч.",
    "category": "tech",
    "image_keywords": "xiaomi mi band 8"
  },
  {
    "id": "mn-023",
    "product_name": "Монкрем - Биеийн сүүн шингэн",
    "formatted_price": 14500,
    "description": "Арьсыг гүн чийгшүүлж, зөөлрүүлэх үйлчилгээтэй үндэсний үйлдвэрийн ургамлын хандтай сүүн шингэн.",
    "category": "beauty",
    "image_keywords": "body lotion bottle"
  },
  {
    "id": "mn-024",
    "product_name": "Түмэн Шувуут - Өндөг 10ш",
    "formatted_price": 5500,
    "description": "Шинэхэн, чанартай тахианы өндөг. Өдөр бүр шувууны аж ахуйгаас шууд нийлүүлэгддэг.",
    "category": "food",
    "image_keywords": "chicken eggs"
  },
  {
    "id": "mn-025",
    "product_name": "Keychron K2 V2 Keyboard",
    "formatted_price": 380000,
    "description": "Программист болон оффисын ажилчдад зориулсан Bluetooth механик гар. Mac/Windows дэмждэг.",
    "category": "tech",
    "image_keywords": "mechanical keyboard keychron"
  },
  {
    "id": "mn-026",
    "product_name": "Khan Cashmere - Ноолууран малгай",
    "formatted_price": 75000,
    "description": "Өвлийн хүйтэнд дулаахан, зөөлөн нэхээстэй, загварлаг ноолууран малгай. Unisex загвар.",
    "category": "cashmere",
    "image_keywords": "cashmere beanie hat"
  },
  {
    "id": "mn-027",
    "product_name": "Увс Чацаргана - Сироп 0.5л",
    "formatted_price": 18500,
    "description": "Витамин С-гээр баялаг, дархлаа дэмжих үйлчилгээтэй байгалийн цэвэр чацарганы өтгөрүүлсэн сироп.",
    "category": "food",
    "image_keywords": "sea buckthorn syrup"
  },
  {
    "id": "mn-028",
    "product_name": "Marshall Emberton II",
    "formatted_price": 680000,
    "description": "Сонгодог рок загвартай, маш хүчирхэг дуугаралттай, 30 цаг цэнэг барих зөөврийн спикер.",
    "category": "tech",
    "image_keywords": "marshall emberton speaker"
  },
  {
    "id": "mn-029",
    "product_name": "Goo Brand - Нүүрний маск (Багц)",
    "formatted_price": 12000,
    "description": "Арьсны алжаал тайлах, гүн цэвэрлэх үйлчилгээтэй 3 өөр төрлийн маскны багц.",
    "category": "beauty",
    "image_keywords": "facial sheet mask"
  },
  {
    "id": "mn-030",
    "product_name": "Тэнгэр - Наранцэцгийн тос 1л",
    "formatted_price": 8500,
    "description": "Цэвэршүүлсэн, хоол хийх болон хуурахад зориулсан дээд зэргийн ургамлын тос.",
    "category": "food",
    "image_keywords": "sunflower oil bottle"
  },
  {
    "id": "mn-031",
    "product_name": "GoPro Hero 12 Black",
    "formatted_price": 1650000,
    "description": "Аялал болон спортын бичлэг хийхэд зориулсан 5.3K чадалтай, усны хамгаалалттай экшн камер.",
    "category": "tech",
    "image_keywords": "gopro hero 12"
  },
  {
    "id": "mn-032",
    "product_name": "Говь - Эрэгтэй ноолууран өмд",
    "formatted_price": 280000,
    "description": "Гэртээ өмсөхөд маш эвтэйхэн, сул загварын зөөлөн ноолууран өмд. Lounge wear төрөл.",
    "category": "cashmere",
    "image_keywords": "cashmere sweatpants"
  },
  {
    "id": "mn-033",
    "product_name": "АПУ - Цэвэр ус Бонкуа 0.5л",
    "formatted_price": 1200,
    "description": "Эрдэсжүүлсэн цэвэр ус. Сэргээх болон чийгшүүлэх үйлчилгээтэй.",
    "category": "food",
    "image_keywords": "water bottle mineral"
  },
  {
    "id": "mn-034",
    "product_name": "Kindle Paperwhite 5",
    "formatted_price": 580000,
    "description": "Цахим ном уншихад зориулагдсан 6.8 инчийн нүд ядраахгүй дэлгэцтэй төхөөрөмж. Усны хамгаалалттай.",
    "category": "tech",
    "image_keywords": "kindle paperwhite"
  },
  {
    "id": "mn-035",
    "product_name": "Lhamour - Уруулын бальзам",
    "formatted_price": 8500,
    "description": "Зөгийн лав болон байгалийн тостой, уруул хамгаалах бальзам. Хагарахаас сэргийлнэ.",
    "category": "beauty",
    "image_keywords": "natural lip balm"
  },
  {
    "id": "mn-036",
    "product_name": "Талх Чихэр - Мишээл боов",
    "formatted_price": 4500,
    "description": "Цайнд дүрэхэд хамгийн тохиромжтой, зөөлөн амттай Монгол уламжлалт боов.",
    "category": "food",
    "image_keywords": "shortbread cookies"
  },
  {
    "id": "mn-037",
    "product_name": "Asus ROG Zephyrus G14",
    "formatted_price": 5800000,
    "description": "RTX 4060 график карт бүхий хүчирхэг, авсаархан 14 инчийн гейминг зөөврийн компьютер.",
    "category": "tech",
    "image_keywords": "rog zephyrus g14 laptop"
  },
  {
    "id": "mn-038",
    "product_name": "Goyo - Ноолууран нөмрөг",
    "formatted_price": 450000,
    "description": "Гоёмсог загвартай, эмэгтэйлэг, тансаг зэрэглэлийн ноолууран нөмрөг (poncho).",
    "category": "cashmere",
    "image_keywords": "cashmere poncho women"
  },
  {
    "id": "mn-039",
    "product_name": "Өгөөж - Боорцог 500гр",
    "formatted_price": 3800,
    "description": "Гар аргаар хийсэн мэт амттай, Монгол уламжлалт хайрсан боорцог.",
    "category": "food",
    "image_keywords": "fried dough snacks"
  },
  {
    "id": "mn-040",
    "product_name": "Insta360 X3",
    "formatted_price": 1850000,
    "description": "360 градус бичлэг хийх боломжтой, контент бүтээгчдэд зориулсан хамгийн шилдэг экшн камер.",
    "category": "tech",
    "image_keywords": "insta360 x3 camera"
  },
  {
    "id": "mn-041",
    "product_name": "Lhamour - Биеийн скраб",
    "formatted_price": 28000,
    "description": "Кофены үртэй, арьс гуужуулах болон гүн цэвэрлэх үйлчилгээтэй байгалийн биеийн скраб.",
    "category": "beauty",
    "image_keywords": "coffee body scrub"
  },
  {
    "id": "mn-042",
    "product_name": "Golden Gobi - Хар шоколад 70%",
    "formatted_price": 6500,
    "description": "70% какао агуулсан, антиоксидантаар баялаг, эрүүл мэндэд тустай Монгол шоколад.",
    "category": "food",
    "image_keywords": "dark chocolate bar"
  },
  {
    "id": "mn-043",
    "product_name": "WD My Passport 2TB",
    "formatted_price": 320000,
    "description": "Өгөгдөл хадгалахад зориулагдсан зөөврийн хатуу диск. Нууц үгээр хамгаалах боломжтой.",
    "category": "tech",
    "image_keywords": "external hard drive"
  },
  {
    "id": "mn-044",
    "product_name": "Говь - Эмэгтэй ноолууран пальто",
    "formatted_price": 1250000,
    "description": "Тансаг зэрэглэлийн, гар оёдолтой, 100% ноолууран эмэгтэй пальто. Намар, өвлийн загвар.",
    "category": "cashmere",
    "image_keywords": "cashmere coat women"
  },
  {
    "id": "mn-045",
    "product_name": "Оргил - Ургамлын цай",
    "formatted_price": 5500,
    "description": "Байгалийн зэрлэг ургамлуудын хандтай, алжаал тайлах болон дархлаа дэмжих цай.",
    "category": "food",
    "image_keywords": "herbal tea cups"
  },
  {
    "id": "mn-046",
    "product_name": "Anker 737 Power Bank",
    "formatted_price": 480000,
    "description": "24,000mAh багтаамжтай, 140W хурдан цэнэглэдэг зөөврийн компьютер цэнэглэх чадалтай батерей.",
    "category": "tech",
    "image_keywords": "anker 737 power bank"
  },
  {
    "id": "mn-047",
    "product_name": "Lhamour - Гар ариутгагч",
    "formatted_price": 6500,
    "description": "Арьс хуурайшуулахгүй эфирийн тостой гар ариутгах шингэн. Бактерийг 99% устгана.",
    "category": "beauty",
    "image_keywords": "hand sanitizer bottle"
  },
  {
    "id": "mn-048",
    "product_name": "Coca Cola 1.25л",
    "formatted_price": 3200,
    "description": "Дэлхийн алдартай сэргээгч амттай хийжүүлсэн ундаа. Хөргөж хэрэглэхэд тохиромжтой.",
    "category": "food",
    "image_keywords": "coca cola bottle"
  },
  {
    "id": "mn-049",
    "product_name": "Razer DeathAdder V3 Pro",
    "formatted_price": 420000,
    "description": "Эргономик загвартай, 63 грамм жинтэй утасгүй гейминг хулгана. Мэргэжлийн түвшний.",
    "category": "tech",
    "image_keywords": "razer deathadder v3 pro"
  },
  {
    "id": "mn-050",
    "product_name": "Goo Brand - Биеийн тос",
    "formatted_price": 18000,
    "description": "Арьсыг гүн тэжээлээр хангах, нөхөн төлжүүлэх үйлчилгээтэй байгалийн гаралтай биеийн тос.",
    "category": "beauty",
    "image_keywords": "body butter cream"
  }
] ;

async function main() {
  const index = pc.index(indexName);
  const vectors = [];

  console.log(`🚀 ${products.length} барааг боловсруулж эхэллээ...`);

  for (const product of products) {
    try {
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: `${product.product_name}. ${product.description}`,
      });

      vectors.push({
        id: product.id,
        values: embeddingRes.data[0].embedding,
        metadata: {
          product_name: product.product_name,
          formatted_price: product.formatted_price,
          description: product.description,
          category: product.category,
          image_url: `https://pixabay.com/images/search/${encodeURIComponent(product.image_keywords.replace(',', ' '))}/`
        }
      });

      console.log(`📡 Бэлэн боллоо: ${product.product_name}`);
    } catch (error) {
      console.error(`❌ Алдаа (${product.id}):`, error.message);
    }
  }

  if (vectors.length > 0) {
    await index.upsert(vectors);
    console.log(`🏁 Нийт ${vectors.length} барааг Pinecone руу амжилттай хадгаллаа.`);
  }
}