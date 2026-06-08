import { create } from "zustand";

type FavoriteProduct = {
  id: string;
  name?: string;
  price?: number;
  image?: string;
  description?: string;
  storeId?: string;
  images?: string[];
};

type FavoriteResponse = {
  productId: string;
  product: FavoriteProduct;
};

interface FavoriteStore {
  savedIds: string[];
  savedProducts: FavoriteProduct[];
  isLoading: boolean;
  toggleFavorite: (product: FavoriteProduct) => Promise<void>;
  fetchFavorites: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  savedIds: [],
  savedProducts: [],
  isLoading: false,

  fetchFavorites: async () => {
    try {
      const res = await fetch("/chat/api/favorites");
      if (!res.ok) return;
      const data: FavoriteResponse[] = await res.json();
      set({
        savedIds: data.map((favorite) => favorite.productId),
        savedProducts: data.map((favorite) => favorite.product),
      });
    } catch {
      // Ignore fetch errors; callers can retry on the next open.
    }
  },
  toggleFavorite: async (product) => {
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
    } catch {
      // Ignore network errors; optimistic UI already updated.
    }
  },
}));
