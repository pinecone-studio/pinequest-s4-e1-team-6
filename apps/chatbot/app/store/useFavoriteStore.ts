import { create } from "zustand";

interface FavoriteStore {
  savedIds: string[];
  savedProducts: any[];
  isLoading: boolean;
  toggleFavorite: (product: any) => Promise<void>;
  fetchFavorites: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  savedIds: [],
  savedProducts: [],
  isLoading: false,

  fetchFavorites: async () => {
    try {
      const res = await fetch("/chat/api/favorites");
      if (res.ok) return;
      const data = await res.json();
      set({
        savedIds: data.map((f: any) => f.productId),
        savedProducts: data.map((f: any) => f.product),
      });
    } catch (err) {}
  },
  toggleFavorite: async (product: any) => {
    const isSaved = get().savedIds.includes(product.id);

    if (isSaved) {
      set({
        savedIds: get().savedIds.filter((id) => id !== product.id),
        savedProducts: get().savedProducts.filter((p) => p.id !== product.id),
      });
    } else {
      set({
        savedIds: [...get().savedIds, product.id],
        savedProducts: [...get().savedProducts, product],
      });
    }

    try {
      await fetch("/chat/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          storeId: product.storeId,
        }),
      });
    } catch (err) {}
  },
}));
