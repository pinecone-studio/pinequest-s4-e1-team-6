"use client";

import OrdersTable from "@/app/store/components/order/OrdersTable";
import { useAppStore } from "../store/useStore";

export default function OrdersPage() {
  const storeName = useAppStore((state) => state.storeName);

  return (
    <div>
      <h1 className="text-xl mb-4">Orders</h1>

      <OrdersTable storeName={storeName || undefined} />
    </div>
  );
}
