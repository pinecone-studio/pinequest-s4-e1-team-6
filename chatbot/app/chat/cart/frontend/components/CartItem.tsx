"use client";

import { useCart } from "@/app/context/CartContext";
import { useState } from "react";

export default function CartItem({ item, refresh }: any) {
  const [quantity, setQuantity] = useState(item.quantity);
  
  const updateQuantity = async (value: number) => {
    setQuantity(value);

    await fetch(`/api/cart/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: value,
      }),
    });

    refresh();
  };

  const removeItem = async () => {
    await fetch(`/api/cart/${item.id}`, {
      method: "DELETE",
    });

    refresh();
  };

 return (
    <div className="flex items-center gap-4 bg-[#161616] p-4 rounded-2xl border border-white/5 shadow-lg group">
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
        <img 
          src={item.product.images[0] || "/placeholder.png"} 
          alt={item.product.name} 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold truncate">{item.product.name}</h3>
        <p className="text-[#C5A059] font-black text-sm">{item.price.toLocaleString()} ₮</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center bg-black rounded-lg border border-white/10 p-1">
          <button 
            onClick={() => updateQuantity(Math.max(1, quantity - 1))}
            className="px-2 text-[#C5A059] hover:text-white"
          >
            -
          </button>
          <span className="px-2 text-white text-sm font-bold w-8 text-center">{quantity}</span>
          <button 
            onClick={() => updateQuantity(quantity + 1)}
            className="px-2 text-[#C5A059] hover:text-white"
          >
            +
          </button>
        </div>
        
        <button onClick={removeItem} className="text-xs text-red-500/60 hover:text-red-500 transition-colors uppercase font-bold tracking-tighter">
          Remove
        </button>
      </div>
    </div>
  );
}