import { Send } from "lucide-react";

export const SendButton = ({ onClick, disabled, isLoading }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-3 bg-gradient-to-br from-[#9f8cff] to-[#6f7bff] text-white rounded-xl hover:brightness-105 transition-colors disabled:opacity-50"
  >
    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
  </button>
);
