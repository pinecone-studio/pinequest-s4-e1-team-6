"use client";

import OrdersTable from "@/app/admin/components/order/OrdersTable";

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-xl mb-4">Orders</h1>

      <OrdersTable />
    </div>
  );
}
