"use client";

import {
  Trash2,
  Edit2,
  Pin,
  PinOff,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface Chat {
  id: string;
  title: string;
  isPinned?: boolean;
}

interface ChatHistoryProps {
  history: Chat[];
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onPinChat: (id: string) => void;
  onShareChat: (id: string) => void;
  activeChatId?: string | null;
  isLoading?: boolean;
  collapsed?: boolean;
}

export const ChatHistory = ({
  history = [],
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onPinChat,
  activeChatId,
  collapsed = false,
}: ChatHistoryProps) => {
  const [deleteTarget, setDeleteTarget] = useState<Chat | null>(null);
  const [renameTarget, setRenameTarget] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isRecentOpen, setIsRecentOpen] = useState(true);

 
  const visibleHistory = useMemo(
    () => history.filter((chat) => chat.id !== pendingDeleteId),
    [history, pendingDeleteId],
  );

 
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    return history.filter((chat) =>
      chat.title?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, history]);


  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          className="bg-yellow-200 dark:bg-yellow-500/40 rounded px-0.5"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const pinnedChats = visibleHistory.filter((chat) => chat?.isPinned);
  const recentChats = visibleHistory.filter((chat) => !chat?.isPinned);

  const renderChatItem = (chat: Chat) => {
    const isActive = activeChatId === chat.id;

    return (
      <div
        key={chat.id}
        className={`
          group relative flex items-center h-9
          ${collapsed ? "justify-center px-0" : "justify-between px-4"}
          my-0.5 rounded-lg cursor-pointer transition-all duration-200
          ${isActive ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"}
        `}
      >
        <div
          onClick={() => onSelectChat(chat.id)}
          className={`flex items-center min-w-0 flex-1 h-full ${collapsed ? "justify-center" : ""}`}
        >
          {!collapsed && (
            <span
              className={`text-sm truncate ${isActive ? "font-medium text-black dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
            >
              {highlightText(chat.title || "New chat", search)}
            </span>
          )}
        </div>

        
        {!collapsed && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPinChat(chat.id);
              }}
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-400"
            > 
              {chat.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenameTarget(chat);
                setRenameValue(chat.title || "");
              }}
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-400"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(chat);
              }}
              className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500/60"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        {collapsed && isActive && (
          <div className="absolute left-0 w-1 h-5 bg-[#C5A059] rounded-r-full" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full select-none mt-2">
    
      {!collapsed && (
        <div className="px-3 mb-3 relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-black/5 dark:bg-white/5 outline-none focus:ring-1 focus:ring-[#C5A059]/30"
          />
        </div>
      )}

         <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-none">


  {pinnedChats.length > 0 && (
    <div className="mb-4">
      {!collapsed && (
        <p className="px-4 text-[10px] font-bold text-slate-400/70 mb-2 uppercase tracking-widest">
          Pinned
        </p>
      )}

      <div className="flex flex-col gap-1">
        {pinnedChats.map((chat) => (
          <div key={chat.id} className="flex items-center gap-2">
            
            
            <Pin
              size={12}
              className="rotate-45 text-[#C5A059] shrink-0 ml-2"
            />

           
            <div className="flex-1">
              {renderChatItem(chat)}
            </div>

          </div>
        ))}
      </div>
    </div>
  )}

 
  <div>
    {!collapsed && (
      <button
        onClick={() => setIsRecentOpen(!isRecentOpen)}
        className="w-full flex items-center justify-between px-4 text-[10px] font-bold text-slate-400/70 mb-2 uppercase tracking-widest"
      >
        <span>Recent</span>
        {isRecentOpen ? (
          <ChevronDown size={12} />
        ) : (
          <ChevronRight size={12} />
        )}
      </button>
    )}

    <div className={`space-y-0.5 ${isRecentOpen ? "block" : "hidden"}`}>
      {recentChats.map(renderChatItem)}
    </div>
  </div>
</div>

    
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="
        w-full max-w-sm
        bg-white dark:bg-[#121212]
        rounded-2xl
        border border-black/10 dark:border-white/10
        shadow-2xl
        p-6
        animate-in fade-in zoom-in-95
      "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Чат устгах уу?
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Та энэ
                <span className="font-bold">
                  {deleteTarget.title && `  "${deleteTarget.title}"`}
                </span>
                чатыг устгах гэж байна. Үргэлжлүүлэх үү?
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="
              flex-1 py-2 rounded-lg text-xs
              bg-black/5 dark:bg-white/5
              hover:bg-black/10 dark:hover:bg-white/10
              transition
            "
                >
                  Болих
                </button>

                <button
                  onClick={() => {
                    const id = deleteTarget.id;
                    setPendingDeleteId(id);
                    setDeleteTarget(null);

                    const timeout = setTimeout(() => {
                      onDeleteChat(id);
                      setPendingDeleteId(null);
                    }, 3000);

                    toast.error("Чат устгагдлаа", {
                      description: "3 секундын дотор буцаах боломжтой",
                      action: {
                        label: "Буцаах",
                        onClick: () => {
                          clearTimeout(timeout);
                          setPendingDeleteId(null);
                        },
                      },
                    });
                  }}
                  className="
              flex-1 py-2 rounded-lg text-xs font-semibold
              bg-red-500 hover:bg-red-600
              text-white
              transition
            "
                >
                  Устгах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {renameTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setRenameTarget(null)}
        >
          <div
            className="
        w-full max-w-sm
        bg-white dark:bg-[#121212]
        rounded-2xl
        border border-black/10 dark:border-white/10
        shadow-2xl
        p-6
        animate-in fade-in zoom-in-95
      "
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">
              Чатын нэр өөрчлөх
            </h2>

            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="
          w-full px-3 py-2 rounded-lg
          bg-black/5 dark:bg-white/5
          text-sm outline-none
          focus:ring-1 focus:ring-[#077eef]/30
          mb-4
        "
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRenameChat(renameTarget.id, renameValue);
                  setRenameTarget(null);
                  toast.success("Нэр амжилттай өөрчлөгдлөө");
                }
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="
            flex-1 py-2 rounded-lg text-xs
            bg-black/5 dark:bg-white/5
            hover:bg-black/10 dark:hover:bg-white/10
            transition
          "
              >
                Болих
              </button>

              <button
                onClick={() => {
                  onRenameChat(renameTarget.id, renameValue);
                  setRenameTarget(null);
                  toast.success("Нэр амжилттай өөрчлөгдлөө");
                }}
                className="
            flex-1 py-2 rounded-lg text-xs font-semibold
            bg-[#077eef] hover:bg-[#077eef]/90
            text-white
            transition
          "
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
