"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TopProductsChart({ orders }: any) {
  const map: any = {};

  orders.forEach((o: any) => {
    o.items?.forEach((item: any) => {
      const name = item.product?.name;
      if (!map[name]) map[name] = 0;
      map[name] += item.quantity;
    });
  });

  const data = Object.keys(map).map((k) => ({
    name: k,
    sales: map[k],
  }));

  return (
    <div className="bg-slate-100 dark:bg-white/5 p-4 sm:p-5 rounded-xl w-full">
      <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
        Top Products
      </h2>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              fontSize: 12,
              color: "#fff",
            }}
            cursor={{ fill: "rgba(99,102,241,0.08)" }}
          />
          <Bar
            dataKey="sales"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
