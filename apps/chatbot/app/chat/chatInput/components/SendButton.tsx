import { Send, Square } from "lucide-react";

interface SendButtonProps {
  onClick: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const SendButton = ({
  onClick,
  onStop,
  disabled,
  isLoading,
}: SendButtonProps) => (
  <button
    onClick={isLoading ? onStop : onClick}
    disabled={isLoading ? false : disabled}
    className="p-3 bg-gradient-to-br from-[#9f8cff] to-[#6f7bff] text-white rounded-xl hover:brightness-105 transition-colors disabled:opacity-50"
    aria-label={isLoading ? "Stop generating" : "Send message"}
  >
    {isLoading ? <Square size={18} fill="currentColor" /> : <Send size={20} />}
  </button>
);
