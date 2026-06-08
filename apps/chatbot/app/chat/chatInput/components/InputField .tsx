export const InputField = ({
  value,
  onChange,
  onKeyDown,
  disabled,
  isProcessing,
}: any) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={onKeyDown}
    className="flex-1 bg-transparent py-3 px-5 outline-none text-sm text-slate-800 placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/45"
    placeholder={
      isProcessing ? "Дууг хөрвүүлж байна..." : "Юу худалдаж авмаар байна?"
    }
    disabled={disabled}
  />
);
