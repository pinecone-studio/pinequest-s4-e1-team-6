import { notFound } from "next/navigation";
import {
  FEATURE_PRESETS_BY_SLUG,
  type FeatureSlug,
} from "../feature-presets";
import { getFeatureProducts } from "../feature-data";
import FeatureExplorerClient from "./FeatureExplorerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const featureSlug = slug as FeatureSlug;
  const preset = FEATURE_PRESETS_BY_SLUG[featureSlug];

  if (!preset) notFound();

  const products = await getFeatureProducts(featureSlug);

  return <FeatureExplorerClient preset={preset} products={products} />;
}
