"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  storeId: string;
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
        setCartItems(JSON.parse(savedCart));
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
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const addToCart = async (product: any, quantity: number = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      const price = Number(product.price) || 0;
      const image =
        product.image ||
        (product.images && product.images[0]) ||
        "/placeholder.png";

      return [
        ...prev,
        {
          id: product.id,
          productId: product.id,
          name: product.name || "Нэргүй бараа",
          productName: product.name || "Нэргүй бараа",
          price: price,
          image: image,
          productImage: image,
          quantity,
          storeId: product.storeId || "",
          product: product,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = async (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
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
