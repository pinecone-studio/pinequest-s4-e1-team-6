"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";
type ChatMessage = { role: ChatRole; content: string; imagePreview?: string };
type SidebarChatItem = { id: string; title: string };
type HistorySession = {
  id: string;
  title: string | null;
  messages: { role: ChatRole; content: string; imagePreview?: string | null }[];
};

const GUEST_CHATS_KEY = "guest_chats";
const GUEST_HISTORY_KEY = "guest_history";
const GUEST_ACTIVE_KEY = "guest_active_chat";

export const useChatLogic = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Record<string, ChatMessage[]>>({});
  const [sidebarHistory, setSidebarHistory] = useState<SidebarChatItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveGuestData = useCallback(
    (
      chats: Record<string, ChatMessage[]>,
      history: SidebarChatItem[],
      activeId: string | null,
    ) => {
      try {
        localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(chats));
        localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(history));
        if (activeId) localStorage.setItem(GUEST_ACTIVE_KEY, activeId);
      } catch (e) {}
    },
    [],
  );

  const loadGuestData = useCallback(() => {
    try {
      const chats = localStorage.getItem(GUEST_CHATS_KEY);
      const history = localStorage.getItem(GUEST_HISTORY_KEY);
      const activeId = localStorage.getItem(GUEST_ACTIVE_KEY);
      if (chats) setAllChats(JSON.parse(chats));
      if (history) setSidebarHistory(JSON.parse(history));
      if (activeId) setActiveChatIdState(activeId);
    } catch (e) {}
  }, []);

  const fetchUserHistory = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    try {
      setIsLoading(true);
      const res = await fetch("/chat/api/history", { cache: "no-store" });
      if (!res.ok) {
        setSidebarHistory([]);
        setAllChats({});
        return;
      }
      const sessions: HistorySession[] = await res.json();
      const history = sessions.map((s) => ({
        id: s.id,
        title: s.title || s.messages?.[0]?.content?.slice(0, 20) || "Шинэ чат",
      }));
      const chatsMap: Record<string, ChatMessage[]> = {};
      sessions.forEach((s) => {
        chatsMap[s.id] = (s.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          imagePreview: m.imagePreview ?? undefined,
        }));
      });
      setSidebarHistory(history);
      setAllChats(chatsMap);
    } catch (e) {
      console.error("fetchUserHistory error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const syncUser = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      await fetch("/chat/api/sync-user", { method: "POST" });
    } catch (e) {}
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      syncUser();
      fetchUserHistory();

      localStorage.removeItem(GUEST_CHATS_KEY);
      localStorage.removeItem(GUEST_HISTORY_KEY);
      localStorage.removeItem(GUEST_ACTIVE_KEY);
    } else {
      loadGuestData();
    }
  }, [isLoaded, isSignedIn, syncUser, fetchUserHistory, loadGuestData]);

  const createSession = useCallback(async (title: string) => {
    const res = await fetch("/chat/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, []);

  const loadChat = useCallback(
    async (chatId: string | null) => {
      if (!chatId) {
        setActiveChatIdState(null);
        return;
      }
      setActiveChatIdState(chatId);

      if (chatId.startsWith("guest_")) {
        if (!isSignedIn) localStorage.setItem(GUEST_ACTIVE_KEY, chatId);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/chat/api/session/${chatId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load");
        const session = await res.json();
        const uniqueMessages: ChatMessage[] = [];
        const seen = new Set();
        (session.messages || []).forEach((m: any) => {
          const identifier = `${m.role}-${m.content}`;
          if (!seen.has(identifier)) {
            seen.add(identifier);
            uniqueMessages.push({
              role: m.role,
              content: m.content,
              imagePreview: m.imagePreview ?? undefined,
            });
          }
        });
        setAllChats((prev) => ({ ...prev, [chatId]: uniqueMessages }));
      } catch (e) {
        console.error("loadChat error:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [isSignedIn],
  );

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isTyping) return;
      setIsTyping(true);
      let chatId = activeChatId;

      try {
        if (!chatId) {
          const title = message.slice(0, 40) || "Шинэ чат";
          const session = await createSession(title);
          chatId = session.id;
          setActiveChatIdState(chatId);
          setSidebarHistory((prev) => {
            const updated = [{ id: session.id, title }, ...prev];

            if (!isSignedIn)
              localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(updated));
            return updated;
          });
          setAllChats((prev) => ({ ...prev, [chatId!]: [] }));
        }

        const userMessage: ChatMessage = { role: "USER", content: message };
        setAllChats((prev) => ({
          ...prev,
          [chatId!]: [...(prev[chatId!] || []), userMessage],
        }));

        const res = await fetch("/chat/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...(allChats[chatId!] || []),
              { role: "user", content: message },
            ],
            chatId,
            userId: user?.id,
          }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const aiMessage: ChatMessage = {
          role: "ASSISTANT",
          content: data.reply,
        };

        setAllChats((prev) => {
          const updated = {
            ...prev,
            [chatId!]: [...(prev[chatId!] || []), aiMessage],
          };

          if (!isSignedIn) {
            localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(updated));
            localStorage.setItem(GUEST_ACTIVE_KEY, chatId!);
          }
          return updated;
        });
      } catch (e) {
        console.error("sendMessage error:", e);
      } finally {
        setIsTyping(false);
      }
    },
    [activeChatId, allChats, createSession, user?.id, isTyping, isSignedIn],
  );

  const generateTitleFromProducts = (products: any[], fallback?: string) => {
    if (products?.length > 0) {
      const names = products
        .slice(0, 2)
        .map((p) => (p.metadata || p).name)
        .filter(Boolean);
      if (names.length === 1) return names[0];
      if (names.length > 1) return `${names[0]} +${products.length - 1}`;
      return fallback || "New Chat";
    }
    return fallback || "New Chat";
  };

  // const addVisualResult = useCallback(
  //   async (userMsg: any, products: any[]) => {
  //     let chatId = activeChatId;

  //     if (!chatId) {
  //       const title = generateTitleFromProducts(
  //         products,
  //         userMsg.content?.slice(0, 40),
  //       );
  //       try {
  //         const session = await createSession(title);
  //         chatId = session.id;
  //         setActiveChatIdState(chatId);
  //         setSidebarHistory((prev) => {
  //           const updated = [{ id: session.id, title }, ...prev];
  //           if (!isSignedIn)
  //             localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(updated));
  //           return updated;
  //         });
  //         setAllChats((prev) => ({ ...prev, [chatId!]: [] }));
  //       } catch (e) {
  //         return;
  //       }
  //     }

  //     const newUserMsg: ChatMessage = {
  //       role: "USER",
  //       content: userMsg.content || "Зургаар хайж байна...",
  //       imagePreview: userMsg.imagePreview,
  //     };

  //     const productLines = (products || [])
  //       .map((p: any) => {
  //         const m = p.metadata || p;
  //         const productId =
  //           p.id || m.id || m.product_id || `${m.store_id}_${Date.now()}`;
  //         const storeId = p.store_id || m.store_id || m.storeId || "";
  //         const desc = (p.description || m.description || "").replace(
  //           /[|]/g,
  //           "",
  //         );
  //         return `![${p.name || m.name}|${p.price || m.price}|${desc}|${productId}|${storeId}](...)`;
  //       })
  //       .join("\n");

  //     const newAiMsg: ChatMessage = {
  //       role: "ASSISTANT",
  //       content:
  //         products.length > 0
  //           ? `Зургаас ${products.length} тохирох бараа олдлоо!\n\n${productLines}`
  //           : "Уучлаарай, тохирох бараа олдсонгүй.",
  //     };

  //     setAllChats((prev) => {
  //       const updated = {
  //         ...prev,
  //         [chatId!]: [...(prev[chatId!] || []), newUserMsg, newAiMsg],
  //       };

  //       if (!isSignedIn) {
  //         localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(updated));
  //         localStorage.setItem(GUEST_ACTIVE_KEY, chatId!);
  //       }
  //       return updated;
  //     });

  //     if (!isSignedIn || chatId?.startsWith("guest_")) return;

  //     try {
  //       await fetch("/chat/api/chat/save", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           chatId,
  //           title: generateTitleFromProducts(
  //             products,
  //             userMsg.content?.slice(0, 40),
  //           ),
  //           messages: [
  //             {
  //               role: "USER",
  //               content: newUserMsg.content,
  //               imagePreview: newUserMsg.imagePreview,
  //             },
  //             { role: "ASSISTANT", content: newAiMsg.content },
  //           ],
  //         }),
  //       });
  //     } catch (e) {
  //       console.error("Save error:", e);
  //     }
  //   },
  //   [activeChatId, createSession, isSignedIn],
  // );
  const addVisualResult = useCallback(
    async (userMsg: any, products: any[]) => {
      let chatId = activeChatId;

      if (!chatId) {
        const title = generateTitleFromProducts(
          products,
          userMsg.content?.slice(0, 40),
        );
        try {
          const session = await createSession(title);
          chatId = session.id;
          setActiveChatIdState(chatId);
          setSidebarHistory((prev) => {
            const updated = [{ id: session.id, title }, ...prev];
            if (!isSignedIn)
              localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(updated));
            return updated;
          });
          setAllChats((prev) => ({ ...prev, [chatId!]: [] }));
        } catch (e) {
          return;
        }
      }

      const newUserMsg: ChatMessage = {
        role: "USER",
        content: userMsg.content || "Зургаар хайж байна...",
        imagePreview: userMsg.imagePreview,
      };

      const productLines = (products || [])
        .map((p: any) => {
          const m = p.metadata || p;
          const productId = p.id || m.id || "";
          const storeId = p.store_id || m.store_id || m.storeId || "";
          const name = p.name || m.name || "Нэргүй";
          const price = p.price || m.price || "0";
          const desc = (p.description || m.description || "").replace(
            /[|]/g,
            "",
          );
          const imgUrl =
            p.image ||
            p.image_url ||
            m.image ||
            m.image_url ||
            m.product_image_url ||
            m.imageUrl ||
            "";

          return `![${name}|${price}|${desc}|${productId}|${storeId}](${imgUrl})`;
        })
        .join("\n");

      const newAiMsg: ChatMessage = {
        role: "ASSISTANT",
        content:
          products.length > 0
            ? `Зургаас ${products.length} тохирох бараа олдлоо!\n\n${productLines}`
            : "Уучлаарай, тохирох бараа олдсонгүй.",
      };

      setAllChats((prev) => {
        const updated = {
          ...prev,
          [chatId!]: [...(prev[chatId!] || []), newUserMsg, newAiMsg],
        };
        if (!isSignedIn) {
          localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(updated));
          localStorage.setItem(GUEST_ACTIVE_KEY, chatId!);
        }
        return updated;
      });

      if (!isSignedIn || chatId?.startsWith("guest_")) return;

      try {
        await fetch("/chat/api/chat/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            title: generateTitleFromProducts(
              products,
              userMsg.content?.slice(0, 40),
            ),
            messages: [
              {
                role: "USER",
                content: newUserMsg.content,
                imagePreview: newUserMsg.imagePreview,
              },
              { role: "ASSISTANT", content: newAiMsg.content },
            ],
          }),
        });
      } catch (e) {
        console.error("Save error:", e);
      }
    },
    [activeChatId, createSession, isSignedIn],
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      setSidebarHistory((prev) => {
        const updated = prev.filter((c) => c.id !== chatId);
        if (activeChatId === chatId)
          setActiveChatIdState(updated[0]?.id || null);
        if (!isSignedIn)
          localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });
      setAllChats((prev) => {
        const n = { ...prev };
        delete n[chatId];

        if (!isSignedIn)
          localStorage.setItem(GUEST_CHATS_KEY, JSON.stringify(n));
        return n;
      });

      if (!isSignedIn || chatId.startsWith("guest_")) return;

      try {
        await fetch(`/chat/api/session/${chatId}`, { method: "DELETE" });
      } catch (e) {
        console.error("deleteChat error:", e);
        await fetchUserHistory();
      }
    },
    [activeChatId, fetchUserHistory, isSignedIn],
  );

  const startNewChat = useCallback(() => {
    setActiveChatIdState(null);
    if (!isSignedIn) localStorage.removeItem(GUEST_ACTIVE_KEY);
  }, [isSignedIn]);

  return {
    activeChatId,
    setActiveChatId: loadChat,
    allChats,
    sidebarHistory,
    isTyping,
    setIsTyping,
    isLoading,
    isStreaming: false,
    streamingContent: "",
    sendMessage,
    startNewChat,
    refetchHistory: fetchUserHistory,
    deleteChat,
    addVisualResult,
    isSignedIn,
  };
};
