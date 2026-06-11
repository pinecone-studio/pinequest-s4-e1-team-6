"use client";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatLogic } from "./chat/hooks/useChatLogic";
import { SparklesCore } from "@/lib/utils/chat-animation/sparkles";
import { useScrollEffect } from "./chat/hooks/useScrollEffect";
import { MessageList } from "./chat/homeChat/product/message-list";
import { WelcomeSection } from "./chat/homeChat/robot-text/welcome-section";
import Sidebar from "./chat/sidebar/page";
import Header from "./chat/header/page";
import ChatInput from "./chat/chatInput/page";
import { AnimatePresence } from "framer-motion";
import QPayPayment from "./chat/payment/components/QPayPayment ";
import OrderAddress from "./chat/payment/components/form";
import OrdersButton from "./chat/ZahialgaHarah/OrdersButton";
import { parsePrice } from "@/lib/utils/price";

type SelectedProduct = {
  id?: string;
  name?: string;
  title?: string;
  price: string | number;
  image?: string;
  thumbnail?: string;
};

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");
  const { user, isLoaded } = useUser();
  const {
    activeChatId,
    setActiveChatId,
    allChats,
    sidebarHistory,
    isTyping,
    sendMessage,
    isLoading,
    addVisualResult,
    isStreaming,
    deleteChat: handleDeleteChat,
  } = useChatLogic();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [orderStep, setOrderStep] = useState<"NONE" | "ADDRESS" | "PAYMENT">(
    "NONE",
  );
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string>("ORD-guest");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledPromptRef = useRef<string | null>(null);
  const currentChatMessages = activeChatId ? allChats[activeChatId] || [] : [];
  const selectedProductPrice = parsePrice(selectedProduct?.price);

  useScrollEffect(messagesEndRef, [currentChatMessages, isTyping]);

  useEffect(() => {
    if (!initialPrompt) return;
    if (handledPromptRef.current === initialPrompt) return;
    handledPromptRef.current = initialPrompt;
    sendMessage(initialPrompt);
  }, [initialPrompt, sendMessage]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleOrderInitiate = (name: string, price: string | number) => {
    setSelectedProduct({ name, price });
    setPendingOrderId(`ORD-${Date.now()}`);
    setOrderStep("ADDRESS");
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#7d82ff] transition-colors duration-300 dark:bg-[#0B1020]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-[-8rem] h-[32rem] w-[32rem] rounded-full bg-[#93a0ff]/45 blur-3xl animate-float-slow dark:bg-[#6c7bff]/25" />
        <div className="absolute top-12 right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[#a7b7ff]/35 blur-3xl animate-float-medium dark:bg-[#4aa3ff]/20" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-[#c0c7ff]/35 blur-3xl animate-float-fast dark:bg-[#7c6dff]/22" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,#a9b2ff_0%,#8c94ff_30%,#7d82ff_62%,#8ec2ff_100%)] opacity-95 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_34%),linear-gradient(135deg,#111827_0%,#1f2a60_38%,#0f172a_100%)] dark:opacity-100" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_42%,rgba(255,255,255,0.18)_43%,rgba(255,255,255,0)_58%,rgba(255,255,255,0.08)_100%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_42%,rgba(255,255,255,0.08)_43%,rgba(255,255,255,0)_58%,rgba(255,255,255,0.03)_100%)]" />
      </div>
      <Sidebar
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        collapsed={isCollapsed}
        history={sidebarHistory || []}
        onNewChat={() => setActiveChatId(null)}
        onSelectChat={(id) => setActiveChatId(id)}
        isLoading={isLoading}
        onDeleteChat={handleDeleteChat}
        activeChatId={activeChatId}
      />

      <div className="flex-1 flex flex-col w-full min-w-0 h-screen relative z-10 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <OrdersButton />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={30}
            className="w-full h-full"
          />
        </div>

        <main className="flex-1 overflow-y-auto bg-transparent p-4 relative z-20 custom-scrollbar">
          {currentChatMessages.length === 0 ? (
            <div className="min-h-full flex flex-col justify-center">
              <WelcomeSection
                onSelect={(q) => sendMessage(q)}
                onOpenFeature={(slug) => router.push(`/chat/explore/${slug}`)}
                userName={isLoaded ? user?.firstName : null}
              />
            </div>
          ) : (
            <MessageList
              messages={currentChatMessages}
              isTyping={isTyping}
              onProductClick={() => {}}
              onBuy={handleOrderInitiate}
              messagesEndRef={messagesEndRef}
            />
          )}
        </main>
        <AnimatePresence>
          {orderStep === "ADDRESS" && (
            <OrderAddress
              onClose={() => setOrderStep("NONE")}
              onConfirm={() => {
                console.log(
                  "Address confirmed, moving to payment. Price:",
                  selectedProduct?.price,
                );
                setOrderStep("PAYMENT");
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {orderStep === "PAYMENT" && selectedProduct && (
            <QPayPayment
              amount={selectedProductPrice}
              orderId={selectedProduct.id || pendingOrderId}
              onSuccess={() => {
                setOrderStep("NONE");
              }}
              onCancel={() => setOrderStep("NONE")}
            />
          )}
        </AnimatePresence>

        {currentChatMessages.length === 0 ? (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto w-full">
              <ChatInput
                onSendMessage={sendMessage}
                onVisualResult={addVisualResult}
                history={currentChatMessages}
                isTyping={isTyping || isStreaming}
              />
            </div>
          </div>
        ) : (
          <div className="relative z-30 border-t border-black/5 dark:border-white/10">
            <ChatInput
              onSendMessage={sendMessage}
              onVisualResult={addVisualResult}
              history={currentChatMessages}
              isTyping={isTyping || isStreaming}
            />
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(2rem, -1.25rem, 0) scale(1.08);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-1.5rem, 1rem, 0) scale(1.06);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(1rem, 1.25rem, 0) scale(1.04);
          }
        }
        .animate-float-slow {
          animation: float-slow 16s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 12s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
