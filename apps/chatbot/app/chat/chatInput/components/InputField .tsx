import { KeyboardEvent } from "react";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  isProcessing?: boolean;
  placeholder?: string;
}

export const InputField = ({
  value,
  onChange,
  onKeyDown,
  disabled,
  isProcessing,
  placeholder,
}: InputFieldProps) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={onKeyDown}
    className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none text-[15px] text-slate-800 placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/45 md:px-5 md:text-sm"
    placeholder={
      placeholder ||
      (isProcessing ? "Дууг хөрвүүлж байна..." : "Юу худалдаж авмаар байна?")
    }
    disabled={disabled}
  />
);
