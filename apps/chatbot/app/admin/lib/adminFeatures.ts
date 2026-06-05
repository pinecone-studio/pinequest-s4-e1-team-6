import {
  Search,
  Users,
  BarChart2,
  Download,
  FlaskConical,
  Upload,
  AlertTriangle,
  Percent,
  Key,
  Zap,
  RefreshCw,
  Share2,
  DollarSign,
  Package,
  QrCode,
  TrendingUp,
} from "lucide-react";

type AdminFeatureCategory =
  | "AI Tools"
  | "Analytics"
  | "Finance"
  | "Integration"
  | "Inventory"
  | "Marketing"
  | "Orders"
  | "Products"
  | "Reports"
  | "Tools";

export interface AdminFeature {
  slug: string;
  title: string;
  description: string;
  category: AdminFeatureCategory;
  icon: typeof Search;
  isAvailable: boolean;
}

export const ADMIN_FEATURES: AdminFeature[] = [
  {
    slug: "top-search-terms",
    title: "Top Search Terms",
    description: "Хэрэглэгчдийн хамгийн их хайсан бараа, түлхүүр үг, тренд сүлжээ",
    category: "Analytics",
    icon: Search,
    isAvailable: false,
  },
  {
    slug: "retention-rate",
    title: "Customer Retention",
    description: "Буцаж ирсэн хэрэглэгч, retention rate, дундаж захиалга/хүн",
    category: "Analytics",
    icon: Users,
    isAvailable: false,
  },
  {
    slug: "product-matrix",
    title: "Product Popularity Matrix",
    description: "Бараа бүрийн борлуулалт, орлого, түгээлтийг визуал хүснэгтээр харах",
    category: "Analytics",
    icon: BarChart2,
    isAvailable: false,
  },
  {
    slug: "export-reports",
    title: "Export All Reports",
    description: "Excel (.xlsx), PDF форматаар бүтэн тайлан авах",
    category: "Reports",
    icon: Download,
    isAvailable: false,
  },
  {
    slug: "ai-sandbox",
    title: "AI Prompt Sandbox",
    description: "System prompt өөрчилж, AI туслахын ажиллагаа туршиж үзэх",
    category: "AI Tools",
    icon: FlaskConical,
    isAvailable: false,
  },
  {
    slug: "bulk-upload",
    title: "Bulk Product Upload",
    description: "Excel файлаар олон бараа нэгэн дор оруулах",
    category: "Products",
    icon: Upload,
    isAvailable: false,
  },
  {
    slug: "low-stock-alerts",
    title: "Low Stock Alerts",
    description: "Нөөц дуусаж байгаа бараа анхааруулах системүүд",
    category: "Inventory",
    icon: AlertTriangle,
    isAvailable: false,
  },
  {
    slug: "coupon-engine",
    title: "Coupon Code Engine",
    description: "Хөнгөлөлтийн код үүсгэх, удирдах, дутуутай эсэхийг үзэх",
    category: "Marketing",
    icon: Percent,
    isAvailable: false,
  },
  {
    slug: "api-keys",
    title: "API Key Management",
    description: "API түлхүүр үүсгэх, идэвхжүүлэх, устгах",
    category: "Integration",
    icon: Key,
    isAvailable: false,
  },
  {
    slug: "flash-sale",
    title: "Flash Sale Timer",
    description: "Эргүүлсэн борлуулалт үүсгэх, цаг хянах",
    category: "Marketing",
    icon: Zap,
    isAvailable: false,
  },
  {
    slug: "ab-testing",
    title: "A/B Testing for Products",
    description: "Бараа хоёрын үзүүлэлт, click rate-ыг харьцуулах",
    category: "Analytics",
    icon: TrendingUp,
    isAvailable: false,
  },
  {
    slug: "social-post",
    title: "Social Media Auto-Post",
    description: "Facebook, Instagram, Twitter-т автоматаар постлох загвар",
    category: "Marketing",
    icon: Share2,
    isAvailable: false,
  },
  {
    slug: "refund-manager",
    title: "Refund Manager",
    description: "Захиалга буцаалтын хүсэлт, статус удирдах",
    category: "Orders",
    icon: RefreshCw,
    isAvailable: true,
  },
  {
    slug: "tax-settings",
    title: "Tax Settings",
    description: "НӨАТ, түүхий татвар, хяргалагч тохиргоо",
    category: "Finance",
    icon: DollarSign,
    isAvailable: false,
  },
  {
    slug: "product-bundling",
    title: "Product Bundling",
    description: "Бараа хэд хэдийг нэг багцаар зэрэгцүүлэх, хөнгөлөлт нэмэх",
    category: "Products",
    icon: Package,
    isAvailable: false,
  },
  {
    slug: "qr-generator",
    title: "QR/Barcode Generator",
    description: "Бараа бүрийн QR код үүсгэх, татах",
    category: "Tools",
    icon: QrCode,
    isAvailable: false,
  },
];

export type AdminFeatureSlug = typeof ADMIN_FEATURES[number]["slug"];

export const AVAILABLE_ADMIN_FEATURES = ADMIN_FEATURES.filter(
  (feature) => feature.isAvailable
);

export const ADMIN_FEATURES_BY_SLUG = Object.fromEntries(
  ADMIN_FEATURES.map((feature) => [feature.slug, feature])
) as Record<AdminFeatureSlug, AdminFeature>;
