import { Send } from "lucide-react";

export const SendButton = ({ onClick, disabled, isLoading }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-3 bg-[#077eef] text-white rounded-xl hover:bg-[#077eef]/90 transition-colors disabled:opacity-50"
  >
    {isLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Send size={20} />}
  </button>
);