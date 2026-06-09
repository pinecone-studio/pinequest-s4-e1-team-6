import { index } from "@/lib/api/pinecone";
import { prisma } from "@/lib/prisma";

const FALLBACK_NAMESPACES = [
  "Turuu's store",
  "sadadasda",
  "sephora",
  "ETRNTY",
  "Tugss store",
];

export async function getStoreNamespaces() {
  const namespaces = new Set<string>();

  try {
    const stats = await index.describeIndexStats();
    const pineconeNamespaces = stats.namespaces ?? {};
    for (const name of Object.keys(pineconeNamespaces)) {
      const trimmed = name.trim();
      if (trimmed) namespaces.add(trimmed);
    }
  } catch (error) {
    console.error("Pinecone namespace lookup failed:", error);
  }

  try {
    const stores = await prisma.store.findMany({
      select: { name: true },
    });

    for (const store of stores) {
      const name = store.name?.trim();
      if (name) namespaces.add(name);
    }
  } catch (error) {
    console.error("Prisma store lookup failed:", error);
  }

  for (const fallback of FALLBACK_NAMESPACES) {
    namespaces.add(fallback);
  }

  return Array.from(namespaces);
}
