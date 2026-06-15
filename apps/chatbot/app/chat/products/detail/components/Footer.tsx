import { CreditCard, ShoppingBag } from "lucide-react";
import { useState } from "react";

export const Footer = ({ 
  product, 
  quantity, 
  numericPrice, 
  isAdding, 
  onBuy, 
  handleAddCart 
}: { 
  product: any; 
  quantity: number;
  numericPrice: number;
  isAdding: boolean;
  onBuy: (name: string, price: any, product?: any) => void;
  handleAddCart: () => void;
}) => {
  const [step, setStep] = useState<'detail' | 'form'>('detail');
  return (
    <div className="p-8 border-t border-white/10 bg-[#0b1024]/85 backdrop-blur-2xl space-y-4">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-slate-300 text-sm">Нийт дүн:</span>
        <span className="text-2xl font-black bg-gradient-to-r from-[#b7a6ff] to-[#8b7bff] bg-clip-text text-transparent">
          {(numericPrice * quantity).toLocaleString()}₮
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => onBuy(product.name, product.price, product)}
          className="w-full bg-white text-black font-black py-4.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-slate-200 active:scale-95 shadow-lg shadow-white/5"
        >
          <CreditCard size={20} />
          ШУУД ХУДАЛДАН АВАХ
        </button>

        <button
          onClick={handleAddCart}
          disabled={isAdding}
          className="w-full bg-gradient-to-br from-[#9f8cff] to-[#6f7bff] text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-[0_14px_28px_rgba(111,123,255,0.30)]"
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingBag size={20} />
              САГСАНД НЭМЭХ
            </>
          )}
        </button>
      </div>
    </div>
  );
};
