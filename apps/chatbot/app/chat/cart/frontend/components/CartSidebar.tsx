"use client";
import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaMinus, FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import LocationForm from "@/app/chat/payment/components/form";
import QPayPayment from "@/app/chat/payment/components/QPayPayment ";
import { saveOrder } from "@/app/chat/hooks/useOrders";

type AddressData = {
  city?: string;
  district?: string;
  address?: string;
  street?: string;
  phone?: string;
};

type SavedOrderResponse = {
  id?: string;
  storeId?: string;
};

export default function CartSidebar() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState("CART");

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <AnimatePresence mode="wait">
      {showLocationForm && (
        <motion.div
          key="location-step"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-[70]"
        >
          <LocationForm
            onClose={() => setShowLocationForm(false)}
            onConfirm={(data) => {
              setAddressData(data);
              setPaymentOrderId(`CART-${Date.now()}`);
              setShowLocationForm(false);
              setShowPayment(true);
            }}
          />
        </motion.div>
      )}

      {showPayment && (
        <motion.div
          key="payment-step"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-[70]"
        >
          <QPayPayment
            amount={totalPrice}
            orderId={paymentOrderId}
            onSuccess={async () => {
              const orderedItems = [...cartItems];
              const fullAddress = [
                addressData?.city,
                addressData?.district,
                addressData?.address,
                addressData?.street,
              ]
                .filter(Boolean)
                .join(", ");

              try {
                const response = await fetch("/chat/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    totalAmount: totalPrice,
                    customerPhone: addressData?.phone,
                    address: fullAddress,
                    storeId: orderedItems[0]?.storeId,
                    storeName: orderedItems[0]?.product?.storeName,
                    items: orderedItems.map((item) => ({
                      productId: item.id,
                      name: item.name,
                      image: item.image,
                      price: item.price,
                      quantity: item.quantity,
                      color: item.selectedColor,
                      selectedColor: item.selectedColor,
                      size: item.selectedSize,
                      selectedSize: item.selectedSize,
                      storeId: item.storeId,
                      storeName: item.product?.storeName,
                    })),
                  }),
                });

                if (!response.ok) {
                  throw new Error("Order save failed");
                }

                const savedOrder = (await response.json()) as SavedOrderResponse;
                saveOrder({
                  orderId: savedOrder?.id || `CART-${Date.now()}`,
                  productName:
                    orderedItems.length === 1
                      ? orderedItems[0].name
                      : `Сагсны захиалга (${orderedItems.length} бараа)`,
                  amount: totalPrice,
                  date: new Date().toLocaleString(),
                  image: orderedItems[0]?.image,
                  store_id: savedOrder?.storeId || orderedItems[0]?.storeId,
                });
                clearCart();
                window.dispatchEvent(new Event("open-orders-panel"));
              } catch (error) {
                console.error("Cart order save error:", error);
              }
              setShowPayment(false);
              setIsCartOpen(false);
            }}
            onCancel={() => setShowPayment(false)}
          />
        </motion.div>
      )}

      {isCartOpen && !showLocationForm && !showPayment && (
        <motion.div
          key="cart-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}

      {isCartOpen && !showLocationForm && !showPayment && (
        <motion.div
          key="cart-sidebar-main"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-100/10 border-l border-white shadow-2xl z-50 flex flex-col"
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Таны сагс ({cartItems.length})
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <FaTimes className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p>Сагс хоосон байна</p>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={item.cartKey || `item-${item.id || idx}`}
                  className="flex gap-4 bg-[#e3e6ec] p-3 rounded-xl border border-white/5 shadow-sm"
                >
                  <img
                    src={item.image}
                    className="w-20 h-20 object-cover rounded-lg"
                    alt={item.name}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-black font-semibold text-lg line-clamp-1">
                        {item.name}
                      </h3>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-xs font-semibold text-slate-600">
                          {[item.selectedColor, item.selectedSize]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      )}
                      <button
                        onClick={() => removeFromCart(item.cartKey || item.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-black font-bold">
                        {(item.price * item.quantity).toLocaleString()}₮
                      </span>
                      <div className="flex items-center gap-3 bg-[#7c5cff] px-2 py-1 rounded-lg border border-white/10">
                        <button
                          onClick={() =>
                            updateQuantity(item.cartKey || item.id, -1)
                          }
                          className="text-white hover:text-[#9f8cff] p-1"
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="text-white text-sm font-bold min-w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.cartKey || item.id, 1)
                          }
                          className="text-white hover:text-[#9f8cff] p-1"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-white/5 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-white">Нийт дүн:</span>
                <span className="text-[#ffffff]">
                  {totalPrice.toLocaleString()}₮
                </span>
              </div>
              <button
                onClick={() => setShowLocationForm(true)}
                className="w-full py-4 bg-gradient-to-br from-[#9f8cff] to-[#6f7bff] text-white font-black rounded-xl hover:brightness-110 transition-all text-xl shadow-[0_10px_24px_rgba(111,123,255,0.3)]"
              >
                Захиалга өгөх
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
