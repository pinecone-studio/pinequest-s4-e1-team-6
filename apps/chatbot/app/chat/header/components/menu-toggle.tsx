import { Menu } from "lucide-react";

export const MenuToggle = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-black/5 dark:text-slate-200 dark:hover:bg-white/10"
  >
    <Menu className="h-5 w-5" />
  </button>
);
