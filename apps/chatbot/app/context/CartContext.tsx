"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { parsePrice } from "@/lib/utils/price";

export interface CartItem {
  cartKey?: string;
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  storeId: string;
  selectedColor?: string;
  selectedSize?: string;
  product?: any;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalPrice: number;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  loadDBCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("guest_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const normalizedCart = Array.isArray(parsedCart)
          ? parsedCart.map((item) => ({
              ...item,
              price:
                parsePrice(item.price) ||
                parsePrice(
                  item.product?.price ??
                    item.product?.formatted_price ??
                    item.product?.formattedPrice ??
                    item.product?.metadata?.price ??
                    item.product?.metadata?.formatted_price,
                ),
            }))
          : [];
        setCartItems(normalizedCart);
      } catch (e) {
        console.error("Cart parse error", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("guest_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("guest_cart");
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if ((item.cartKey || item.id) === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const addToCart = async (product: any, quantity: number = 1) => {
    setCartItems((prev) => {
      const rawVariants =
        product.metadata?.colorSizeStock ||
        product.metadata?.color_size_stock ||
        product.colorSizeStock ||
        product.color_size_stock;
      let defaultVariant = { color: "", size: "" };

      try {
        const variants =
          typeof rawVariants === "string" ? JSON.parse(rawVariants) : rawVariants;
        if (Array.isArray(variants)) {
          const availableVariant =
            variants.find((variant) => Number(variant?.stock) > 0) ||
            variants[0];
          defaultVariant = {
            color: String(availableVariant?.color || ""),
            size: String(availableVariant?.size || ""),
          };
        }
      } catch {}

      const price = parsePrice(
        product.price ??
          product.formatted_price ??
          product.formattedPrice ??
          product.metadata?.price ??
          product.metadata?.formatted_price,
      );
      const selectedColor =
        product.selectedColor || defaultVariant.color || product.color || "";
      const selectedSize =
        product.selectedSize || defaultVariant.size || product.size || "";
      const cartKey = `${product.id}-${selectedColor}-${selectedSize}`;
      const existingItem = prev.find(
        (item) => (item.cartKey || item.id) === cartKey,
      );
      if (existingItem) {
        return prev.map((item) =>
          (item.cartKey || item.id) === cartKey
            ? {
                ...item,
                price: item.price > 0 ? item.price : price,
                quantity: item.quantity + quantity,
              }
            : item,
        );
      }

      const image =
        product.image ||
        (product.images && product.images[0]) ||
        "/placeholder.png";

      return [
        ...prev,
        {
          cartKey,
          id: product.id,
          productId: product.id,
          name: product.name || "Нэргүй бараа",
          productName: product.name || "Нэргүй бараа",
          price: price,
          image: image,
          productImage: image,
          quantity,
          storeId: product.storeId || "",
          selectedColor,
          selectedSize,
          product: product,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = async (id: string) => {
    setCartItems((prev) =>
      prev.filter((item) => (item.cartKey || item.id) !== id),
    );
  };

  const loadDBCart = async () => {
    try {
      const res = await fetch("/chat/api/cart");
      const data = await res.json();

      if (data && data.items) {
        const formattedItems: CartItem[] = data.items.map((item: any) => ({
          id: item.productId,
          productId: item.productId,
          name: item.product.name,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || "/placeholder.png",
          productImage: item.product.images?.[0] || "/placeholder.png",
          storeId: item.product.storeId,
          product: item.product,
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error("DB cart load error", error);
    }
  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        clearCart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        setIsCartOpen,
        loadDBCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
