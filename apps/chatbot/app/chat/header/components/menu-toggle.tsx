import { Menu } from "lucide-react";

export const MenuToggle = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
  >
    <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
  </button>
);
