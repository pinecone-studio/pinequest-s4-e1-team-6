import { FiEdit } from "react-icons/fi";

export const NewChatBtn = ({
  onClick,
  collapsed,
}: {
  onClick: () => void;
  collapsed: boolean;
}) => {
  return (
    <div className="px-2 py-2">
      <div className="relative group flex justify-center">
        {/* BUTTON */}
        <button
          onClick={onClick}
          className={`
    flex items-center rounded-xl p-2
    transition-all duration-300 ease-out
    hover:bg-black/5 dark:hover:bg-white/10
    active:scale-95
    ${collapsed ? "justify-center w-full" : "gap-2 px-3 w-full"}
  `}
        >
          {/* ICON */}
          <FiEdit
            className="
      text-lg
      text-slate-500 dark:text-slate-400
      transition-all duration-300 ease-out
      group-hover:text-black dark:group-hover:text-white
      group-hover:scale-110 group-hover:rotate-6
    "
          />

          {/* TEXT */}
          {!collapsed && (
            <span
              className="
        text-sm whitespace-nowrap
        text-slate-500 dark:text-slate-400
        transition-all duration-300 ease-out
        group-hover:text-black dark:group-hover:text-white
        group-hover:translate-x-0.5
      "
            >
              New chat
            </span>
          )}
        </button>

        {/* 🔥 PREMIUM TOOLTIP */}
        {collapsed && (
          <div
            className="
    pointer-events-none
    absolute left-full ml-3 top-1/2 -translate-y-1/2
    px-3 py-1.5 rounded-md text-xs font-medium
    bg-black/80 text-white dark:bg-white dark:text-black
    backdrop-blur-md shadow-lg

    opacity-0 translate-x-[-8px] scale-95
    group-hover:opacity-100 
    group-hover:translate-x-0 
    group-hover:scale-100

    transition-all duration-300 ease-out
    whitespace-nowrap z-[999]
  "
          >
            New chat
          </div>
        )}
      </div>
    </div>
  );
};
