export type FeatureSlug = "teleport" | "black-hole" | "constellation" | "deep-space";

export type FeaturePreset = {
  slug: FeatureSlug;
  title: string;
  badge: string;
  prompt: string;
  heroTitle: string;
  heroDescription: string;
  accent: string;
  accentRing: string;
  strategy: "top" | "random" | "diverse" | "rare";
};

export type FeatureProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId: string;
  storeName: string;
  category: string;
  brand: string;
  stock: number;
  score: number;
};

export const FEATURE_PRESETS: FeaturePreset[] = [
  {
    slug: "teleport",
    title: "TREND",
    badge: "",
    prompt:
      "Яг одоо залуусын дунд хамгийн их шуугиан тарьж, хамгийн хурдан зарагдаж байгаа топ 5 барааг харуул.",
    heroTitle: "Тренд",
    heroDescription:
      "",
    accent: "from-[#9f8cff] via-[#7c5cff] to-[#56a8ff]",
    accentRing: "shadow-[0_0_30px_rgba(124,92,255,0.28)]",
    strategy: "top",
  },
  {
    slug: "black-hole",
    title: "MYSTERY BOX",
    badge: "Black hole",
    prompt:
      "Надад юу таарахыг би мэдэхийг хүсэхгүй байна. Санамсаргүй байдлаар нэгэн маш өвөрмөц барааг сонгоод надад санал болгооч.",
    heroTitle: "Гэнэтийн сэтгэл хөдлөл",
    heroDescription:
      "",
    accent: "from-[#5f74ff] via-[#7c5cff] to-[#b38cff]",
    accentRing: "shadow-[0_0_30px_rgba(95,116,255,0.28)]",
    strategy: "random",
  },
  {
    slug: "constellation",
    title: "MY STYLE",
    badge: "Одод зохицол",
    prompt:
      "Би өөрийн гэсэн өвөрмөц өнгө төрхийг бүрдүүлэхээр байна. Хоорондоо төгс зохицох хувцас, хэрэгслийн багц стиль гаргаж өгөөрэй.",
    heroTitle: "Миний стил",
    heroDescription:
      "",
    accent: "from-[#8d7dff] via-[#6f7bff] to-[#5bbcff]",
    accentRing: "shadow-[0_0_30px_rgba(111,123,255,0.28)]",
    strategy: "diverse",
  },
  {
    slug: "deep-space",
    title: "DEEP SPACE",
    badge: "Гүн сансар",
    prompt:
      "Манай дэлгүүрт байгаа хамгийн чанартай, хүмүүсийн тэр бүр мэддэггүй, цөөн тоотой ирсэн ховор бүтээгдэхүүнүүдийг шүүж харуул.",
    heroTitle: "Ховор нандин бараанууд",
    heroDescription:
      "",
    accent: "from-[#8b7bff] via-[#6773ff] to-[#4aa3ff]",
    accentRing: "shadow-[0_0_30px_rgba(74,163,255,0.24)]",
    strategy: "rare",
  },
];

export const FEATURE_PRESETS_BY_SLUG = Object.fromEntries(
  FEATURE_PRESETS.map((preset) => [preset.slug, preset]),
) as Record<FeatureSlug, FeaturePreset>;
