"use client";

import { useState } from "react";

export function useVisualSearch() {
  const [isSearching, setIsSearching] = useState(false);

  const searchByImage = async (file: File) => {
    console.log("📁 File:", file.name, file.type, file.size); 
    setIsSearching(true);
    const formData = new FormData();
    formData.append("image", file);

    console.log("📤 Sending formData...");

    try {
      const response = await fetch("/chat/api/visual-search", {
        method: "POST",
        body: formData,
      });

      console.log("📥 Response status:", response.status);

      const contentType = response.headers.get("content-type");

      if (response.ok && contentType?.includes("application/json")) {
        const data = await response.json();
        return {
          success: true,
          products: data.products || [data.bestMatch],
          product: data.bestMatch,
        };
      }

      if (contentType?.includes("application/json")) {
        const err = await response.json();
        throw new Error(err.error || "Хайлт амжилтгүй");
      }

      throw new Error("Серверийн алдаа");
    } catch (error: any) {
      console.error("Visual Search Error:", error);
      return {
        success: false,
        error: error.message,
        products: [],
        product: null,
      };
    } finally {
      setIsSearching(false);
    }
  };

  return { searchByImage, isSearching };
}
