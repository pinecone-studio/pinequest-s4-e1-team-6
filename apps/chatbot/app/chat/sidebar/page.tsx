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
          prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c)),
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
          prev.map((c) => (c.id === id ? { ...c, title } : c)),
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
      {/* 1. MOBILE OVERLAY: Dims the background and closes sidebar on click */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          /* 2. CORE POSITIONING */
          fixed inset-y-0 left-0 z-[50] flex flex-col h-screen
          transition-all duration-300 ease-in-out
          bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-xl border-r border-black/5 dark:border-white/5
          
          /* 3. DESKTOP ADAPTATION */
          md:relative md:translate-x-0
          
          /* 4. WIDTH & SLIDE LOGIC */
          ${
            isCollapsed
              ? "-translate-x-full w-0 md:translate-x-0 md:w-16"
              : "translate-x-0 w-72"
          }
        `}
      >
        <div className="p-3">
          <div className="flex items-center justify-between px-2 py-2">
            {!isCollapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNewChat();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 text-sm text-slate-600 dark:text-slate-300"
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
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 active:scale-95"
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

        {isCollapsed && (
          <div className="mt-auto w-full px-2 pb-3 bg-inherit max-sm:hidden ">
            <div className="h-px bg-black/5 dark:bg-white/5 my-2 mx-2 max-sm:hidden" />
            <DarkMode collapsed={isCollapsed} />
            <ClerkAuth collapsed={isCollapsed} />
          </div>
        )}
        {!isCollapsed && ( <div className="mt-auto w-full px-2 pb-3 bg-inherit ">
          <div className="h-px bg-black/5 dark:bg-white/5 my-2 mx-2 max-sm:hidden" />
          <DarkMode collapsed={isCollapsed} />
          <ClerkAuth collapsed={isCollapsed} />
        </div>)}
      </aside>
    </>
  );
}
