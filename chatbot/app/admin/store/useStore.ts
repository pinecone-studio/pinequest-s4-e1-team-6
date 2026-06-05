import { create } from "zustand";

interface StoreState {
  storeName: string | null;
  isLoading: boolean;
  setStoreName: (name: string) => void;
  setIsLoading: (status: boolean) => void;
}


export const useAppStore = create<StoreState>((set) => ({
  storeName: null,
  isLoading: true,
  setStoreName: (name) => set({ storeName: name, isLoading: false }),
  setIsLoading: (status) => set({ isLoading: status }),
}));