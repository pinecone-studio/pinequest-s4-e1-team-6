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
  onBuy: (name: string, price: any) => void;
  handleAddCart: () => void;
}) => {
  const [step, setStep] = useState<'detail' | 'form'>('detail');
  return (
    <div className="p-8 border-t border-white/5 bg-white/10 space-y-4">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-black text-sm">Нийт дүн:</span>
        <span className="text-xl font-bold text-blue-400">
          {(numericPrice * quantity).toLocaleString()}₮
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => onBuy(product.name, product.price)}
          className="w-full bg-white text-black font-black py-4.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-slate-200 active:scale-95 shadow-lg shadow-white/5"
        >
          <CreditCard size={20} />
          ШУУД ХУДАЛДАН АВАХ
        </button>

        <button
          onClick={handleAddCart}
          disabled={isAdding}
          className="w-full bg-[#077eef] hover:bg-[#077eef]/80 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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