import { notFound } from "next/navigation";
import AdminFeaturePlaceholder from "../../components/modules/AdminFeaturePlaceholder";
import { ADMIN_FEATURES_BY_SLUG } from "../../lib/adminFeatures";

interface AdminFeatureModulePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AdminFeatureModulePage({
  params,
}: AdminFeatureModulePageProps) {
  const { slug } = await params;
  const feature = ADMIN_FEATURES_BY_SLUG[slug as keyof typeof ADMIN_FEATURES_BY_SLUG];

  if (!feature) {
    notFound();
  }

  return <AdminFeaturePlaceholder feature={feature} />;
}
