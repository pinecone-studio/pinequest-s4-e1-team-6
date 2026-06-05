"use client";

import { useEffect, useState } from "react";
import TopProductsChart from "@/app/admin/components/analytics/TopProductsChart";
import OrdersHeatmap from "@/app/admin/components/analytics/OrdersHeatmap";
import LiveSales from "@/app/admin/components/analytics/LiveSales";

import ExportCSV from "@/app/admin/components/analytics/ExportCSV";
import AIInsights from "@/app/admin/components/analytics/AIInsights";
import UserStats from "@/app/admin/components/analytics/UserStats";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [days, setDays] = useState(7);

  const fetchData = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
    const data = await res.json();

    const now = new Date();

    const filtered = data.filter((o: any) => {
      const diff =
        (now.getTime() - new Date(o.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);

      return diff <= days;
    });

    setOrders(filtered);
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <div className="flex gap-3">
          {/* <select
            className="bg-gray-800 p-2 rounded"
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select> */}

          <ExportCSV orders={orders} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur p-4 rounded-xl">
          Total Orders: {orders.length}
        </div>

        <div className="bg-white/5 backdrop-blur p-4 rounded-xl">
          Revenue: ${totalRevenue}
        </div>

        <div className="bg-white/5 backdrop-blur p-4 rounded-xl">
          Avg Order: $
          {orders.length ? (totalRevenue / orders.length).toFixed(1) : 0}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AIInsights orders={orders} />
        <UserStats />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TopProductsChart orders={orders} />
        <OrdersHeatmap orders={orders} />
      </div>

      <LiveSales />
    </div>
  );
}
