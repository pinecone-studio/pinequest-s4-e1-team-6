"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import PulsatingDots from "@/lib/utils/loading/pulsating-loader";
import { ProductCarousel } from "@/app/chat/products/scrollEffect/ProductCarousel";
import OrderAddress from "../../payment/components/form";
import QPayPayment from "../../payment/components/QPayPayment ";
import OrderReceipt from "../../ZahialgaHarah/OrderReceipt";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId?: string;
  brand?: string;
  storeName?: string;
}

interface MessageListProps {
  messages: any[];
  isTyping: boolean;
  onProductClick: (product: Product) => void;
  onBuy: (name: string, price: any) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  storeName?: string;
}

const removeImageMarkdown = (content: string): string => {
  if (!content) return "";
  return content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const extractProducts = (content: string): Product[] => {
  const imgRegex = /!\[([^\]]+)\]\(([^)]+)\)/g;
  const products: Product[] = [];
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const altText = match[1];
    const imageSrc = match[2];
    const parts = altText.split("|").map((p) => p.trim());
    if (parts.length >= 2) {
      products.push({
        name: parts[0] || "Нэргүй бараа",
        price: parts[1] || "0",
        description: parts[2] || "",
        id: parts[3] || `id-${Math.random()}`,
        brand: parts[4] || "",
        storeId: parts[5] || "store-001",
        storeName: parts[6] || "Turuu's store",
        image: imageSrc,
      });
    }
  }
  return products;
};

const extractPaymentTrigger = (content: string) => {
  const match = content.match(/PAYMENT_TRIGGER:(\{[^}]+\})/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

const cleanPaymentTrigger = (content: string): string => {
  return content.replace(/PAYMENT_TRIGGER:\{[^}]+\}/g, "").trim();
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  onProductClick,
  onBuy: externalOnBuy,
  messagesEndRef,
  storeName,
}) => {
  const [addressFormProduct, setAddressFormProduct] = useState<any>(null);
  const [activePayment, setActivePayment] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleOpenOrderForm = (name: string, price: any) => {
    const allProducts = messages.flatMap((m) =>
      extractProducts(m.content || ""),
    );
    const match = allProducts.find((p) => p.name === name);

    setAddressFormProduct({
      name: name,
      price: price,
      image: match?.image || "",
      id: match?.id || `id-${Date.now()}`,
      storeName: storeName || match?.storeName,
    });
  };

  const handleAddressConfirm = () => {
    if (!addressFormProduct) return;
    const product = { ...addressFormProduct };
    setAddressFormProduct(null);

    const numericPrice =
      typeof product.price === "string"
        ? parseFloat(product.price.replace(/[^0-9.]/g, ""))
        : product.price;

    setTimeout(() => {
      setActivePayment({
        amount: numericPrice || 0,
        orderId: product.id || `ORD-${Date.now()}`,
        productName: product.name,
        image: product.image,
        storeName: storeName || product.storeName || "Манай дэлгүүр",
      });
    }, 400);
  };

  const handlePaymentSuccess = (details: any) => {
    const paidInfo = activePayment;
    setActivePayment(null);
    setReceiptData({
      productName: paidInfo.productName,
      amount: paidInfo.amount,
      orderId: paidInfo.orderId,
      date: new Date().toLocaleString(),
      image: paidInfo.image,
      transactionId: details.transactionId,
    });
  };

  return (
    <>
      <div className="max-w-3xl mx-auto pb-32 flex flex-col space-y-10 px-4">
        {messages.map((message: any, index: number) => {
          const isUser = message.role?.toLowerCase() === "user";
          const products = !isUser
            ? extractProducts(message.content || "")
            : [];
          const paymentTrigger = !isUser
            ? extractPaymentTrigger(message.content || "")
            : null;
          const cleanedContent = paymentTrigger
            ? cleanPaymentTrigger(message.content || "")
            : message.content || "";
          const rawText = removeImageMarkdown(cleanedContent);
          const hasText = rawText.length > 0;
          const displayImage = message.imagePreview || message.image;

          return (
            <motion.div
              key={`msg-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full group`}
            >
              {isUser ? (
                <div className="flex flex-col items-end gap-3 max-w-[85%]">
                  {displayImage && (
                    <img
                      src={displayImage}
                      className="w-full max-w-[280px] rounded-2xl border border-white/10"
                      alt="User"
                    />
                  )}
                  {hasText && (
                    <div className="px-5 py-3 rounded-[1.6rem] rounded-tr-md bg-blue-600 text-white shadow-lg text-sm md:text-base">
                      {rawText}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {hasText && (
                    <div className="max-w-[88%] px-6 py-4 rounded-[1.8rem] rounded-tl-md bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-100 dark:border-white/5 shadow-sm">
                      <div className="prose dark:prose-invert max-w-none text-sm md:text-[15px] leading-relaxed">
                        <ReactMarkdown
                          components={{
                            img: () => null,
                            p: ({ children }) => (
                              <p className="m-0">{children}</p>
                            ),
                          }}
                        >
                          {rawText}
                        </ReactMarkdown>
                      </div>

                      {paymentTrigger && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleOpenOrderForm(
                              paymentTrigger.name,
                              paymentTrigger.price,
                            )
                          }
                          className="mt-5 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm uppercase"
                        >
                          🛍️ Захиалах
                        </motion.button>
                      )}
                    </div>
                  )}

                  {products.length > 0 && (
                    <div className="w-full mt-2">
                      <ProductCarousel
                        products={products}
                        onBuy={handleOpenOrderForm}
                        onSelect={onProductClick}
                        history={[]}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3 py-6 px-4">
            <PulsatingDots />
          </div>
        )}
        <div ref={messagesEndRef} className="h-4 w-full" />
      </div>

      <AnimatePresence>
        {addressFormProduct && (
          <OrderAddress
            onClose={() => setAddressFormProduct(null)}
            onConfirm={handleAddressConfirm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePayment && (
          <QPayPayment
            amount={activePayment.amount}
            orderId={activePayment.orderId}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setActivePayment(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receiptData && (
          <OrderReceipt
            orderData={receiptData}
            onClose={() => setReceiptData(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
