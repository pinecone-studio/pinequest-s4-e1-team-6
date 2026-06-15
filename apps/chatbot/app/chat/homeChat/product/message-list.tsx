"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";
import PulsatingDots from "@/lib/utils/loading/pulsating-loader";
import { ProductCarousel } from "@/app/chat/products/scrollEffect/ProductCarousel";
import OrderAddress from "../../payment/components/form";
import QPayPayment from "../../payment/components/QPayPayment ";
import OrderReceipt from "../../ZahialgaHarah/OrderReceipt";
import { parsePrice } from "@/lib/utils/price";

interface Product {
  id: string;
  name: string;
  price: string | number;
  image: string;
  description?: string;
  storeId?: string;
  brand?: string;
  storeName?: string;
  selectedColor?: string;
  selectedSize?: string;
  [key: string]: unknown;
}

interface MessageListProps {
  messages: any[];
  isTyping: boolean;
  onProductClick: (product: Product) => void;
  onBuy: (name: string, price: any, product?: Product) => void;
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
  const [copiedMessageKey, setCopiedMessageKey] = useState<string | null>(null);

  const handleOpenOrderForm = (name: string, price: any, product?: Product) => {
    const allProducts = messages.flatMap((m) =>
      extractProducts(m.content || ""),
    );
    const match = product || allProducts.find((p) => p.name === name);

    setAddressFormProduct({
      name: name,
      price: price,
      image: match?.image || "",
      id: match?.id || `id-${name}-${price}`,
      storeId: match?.storeId || "",
      storeName: storeName || match?.storeName,
      selectedColor: match?.selectedColor || "",
      selectedSize: match?.selectedSize || "",
    });
  };

  const handleAddressConfirm = (addressData: any) => {
    if (!addressFormProduct) return;
    const product = { ...addressFormProduct };
    setAddressFormProduct(null);

    const numericPrice = parsePrice(product.price);
    const fullAddress = [
      addressData.city,
      addressData.district,
      addressData.address,
      addressData.street,
    ]
      .filter(Boolean)
      .join(", ");

    setTimeout(() => {
      setActivePayment({
        amount: numericPrice || 0,
        orderId: product.id || `ORD-${Date.now()}`,
        productName: product.name,
        image: product.image,
        productId: product.id,
        storeId: product.storeId,
        storeName: storeName || product.storeName || "Манай дэлгүүр",
        selectedColor: product.selectedColor || "",
        selectedSize: product.selectedSize || "",
        customerPhone: addressData.phone,
        address: fullAddress,
        items: [
          {
            productId: product.id, // Pinecone record id → stock хасахад хэрэглэнэ
            id: product.id,
            name: product.name,
            price: numericPrice,
            quantity: 1,
            color: product.selectedColor || "",
            selectedColor: product.selectedColor || "",
            size: product.selectedSize || "",
            selectedSize: product.selectedSize || "",
            product_image_url: product.image || "",
            storeId: product.storeId || "",
            storeName: product.storeName || storeName || "",
          },
        ],
      });
    }, 400);
  };

  const handlePaymentSuccess = async (details: any) => {
    const paidInfo = activePayment;
    setActivePayment(null);
    try {
      await fetch("/chat/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: paidInfo.amount,
          customerPhone: paidInfo.customerPhone,
          address: paidInfo.address,
          storeId: paidInfo.storeId,
          storeName: paidInfo.storeName,
          items: [
            {
              productId: paidInfo.productId || paidInfo.orderId,
              name: paidInfo.productName,
              image: paidInfo.image,
              price: paidInfo.amount,
              quantity: 1,
              color: paidInfo.selectedColor,
              selectedColor: paidInfo.selectedColor,
              size: paidInfo.selectedSize,
              selectedSize: paidInfo.selectedSize,
              storeId: paidInfo.storeId,
              storeName: paidInfo.storeName,
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Order save error:", error);
    }
    setReceiptData({
      productName: paidInfo.productName,
      amount: paidInfo.amount,
      orderId: paidInfo.orderId,
      date: new Date().toLocaleString(),
      image: paidInfo.image,
      store_id: paidInfo.storeId,
      transactionId: details.transactionId,
    });
  };

  const handleCopyMessage = async (text: string, messageKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageKey(messageKey);
      setTimeout(() => setCopiedMessageKey(null), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
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
                    <div className="relative group/bubble w-fit">
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() =>
                          handleCopyMessage(rawText, `msg-${index}-user`)
                        }
                        className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/85 opacity-0 shadow-lg backdrop-blur-md transition-all hover:bg-black/45 group-hover/bubble:opacity-100"
                        aria-label="Copy user message"
                        title="Copy"
                      >
                        {copiedMessageKey === `msg-${index}-user` ? (
                          <Check size={15} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <div className="px-5 py-3 rounded-[1.6rem] rounded-tr-md bg-gradient-to-br from-[#9f8cff] to-[#6f7bff] text-white shadow-lg shadow-[#8f7bff]/20 text-sm md:text-base">
                        {rawText}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {hasText && (
                    <div className="relative group/bubble max-w-[88%]">
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() =>
                          handleCopyMessage(rawText, `msg-${index}-ai`)
                        }
                        className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#17162a]/90 text-white/75 opacity-0 shadow-lg backdrop-blur-md transition-all hover:bg-[#1f1d35] group-hover/bubble:opacity-100"
                        aria-label="Copy AI message"
                        title="Copy"
                      >
                        {copiedMessageKey === `msg-${index}-ai` ? (
                          <Check size={15} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <div className="px-6 py-4 rounded-[1.8rem] rounded-tl-md bg-white/85 dark:bg-[#17162a]/70 backdrop-blur-xl border border-[#c9b7ff]/50 dark:border-white/5 shadow-sm">
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
                            className="mt-5 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#9f8cff] to-[#6f7bff] text-white font-bold rounded-xl shadow-lg shadow-[#8f7bff]/25 flex items-center justify-center gap-2 text-sm uppercase"
                          >
                            🛍️ Захиалах
                          </motion.button>
                        )}
                      </div>
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
