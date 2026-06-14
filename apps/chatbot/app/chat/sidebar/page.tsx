"use client";

import { NewChatBtn, ChatHistory } from "./components";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ClerkAuth, DarkMode } from "../header/components";
import { PanelLeft, SquarePen } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  history: any[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isLoading?: boolean;
  activeChatId?: string | null;
  toggleSidebar: () => void;
  collapsed: boolean;
}

export default function Sidebar({
  isCollapsed,
  history: initialHistory,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isLoading,
  activeChatId,
  toggleSidebar,
}: SidebarProps) {
  const [history, setHistory] = useState(initialHistory);

  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  const handlePin = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pin" }),
      });
      if (res.ok) {
        setHistory((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
        );
      }
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  const handleRename = async (id: string, title: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", title }),
      });
      if (res.ok) {
        setHistory((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c))
        );
      }
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const res = await fetch(`/chat/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" }),
      });
      if (res.ok) {
        const url = `${window.location.origin}/share/chat/${id}`;
        await navigator.clipboard.writeText(url);
        alert("Хуваалцах линк хуулагдлаа!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[45] md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[50] flex flex-col h-screen
          transition-all duration-300 ease-in-out

          /* Liquid glass */
          bg-white/20 dark:bg-white/[0.06]
          backdrop-blur-2xl
          border-r border-white/45 dark:border-white/15
          shadow-[1px_0_0_rgba(255,255,255,0.6)_inset,4px_0_32px_rgba(31,38,135,0.08)]
          dark:shadow-[1px_0_0_rgba(255,255,255,0.1)_inset,4px_0_32px_rgba(0,0,0,0.3)]

          md:relative md:translate-x-0

          ${
            isCollapsed
              ? "-translate-x-full w-0 md:translate-x-0 md:w-16"
              : "translate-x-0 w-72"
          }
        `}
      >
        {/* Top bar */}
        <div className="p-3">
          <div className="flex items-center justify-between px-2 py-2">
            {!isCollapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNewChat();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl
                  bg-white/30 dark:bg-white/10
                  border border-white/60 dark:border-white/15
                  backdrop-blur-md
                  shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]
                  hover:bg-white/50 dark:hover:bg-white/20
                  hover:-translate-y-px active:scale-95
                  transition-all duration-200
                  text-sm text-slate-700 dark:text-slate-300"
              >
                <SquarePen size={18} />
                <span>New chat</span>
              </button>
            )}

            <div
              className={`relative group ${isCollapsed ? "mx-auto" : "ml-auto"}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar();
                }}
                className="p-2 rounded-xl
                  bg-white/30 dark:bg-white/10
                  border border-white/60 dark:border-white/15
                  backdrop-blur-md
                  shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]
                  hover:bg-white/50 dark:hover:bg-white/20
                  hover:-translate-y-px active:scale-95
                  transition-all duration-200
                  text-slate-700 dark:text-slate-300"
              >
                <PanelLeft size={18} />
              </button>

              {isCollapsed && (
                <div className="hidden md:block pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs opacity-0 invisible translate-x-[-6px] group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-200 z-[9999] whitespace-nowrap shadow-xl">
                  Open menu
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-hidden">
          <ChatHistory
            collapsed={isCollapsed}
            history={history}
            onSelectChat={(id) => {
              onSelectChat(id);
              if (window.innerWidth < 768) toggleSidebar();
            }}
            onPinChat={handlePin}
            onRenameChat={handleRename}
            onShareChat={handleShare}
            onDeleteChat={onDeleteChat}
            isLoading={isLoading}
            activeChatId={activeChatId}
          />
        </div>

        {/* Footer */}
        <div
          className={`mt-auto w-full px-2 pb-3 ${isCollapsed ? "max-sm:hidden" : ""}`}
        >
          <div className="h-px bg-white/40 dark:bg-white/10 my-2 mx-2 max-sm:hidden" />
          <DarkMode collapsed={isCollapsed} />
          <ClerkAuth collapsed={isCollapsed} />
        </div>
      </aside>
    </>
  );
}