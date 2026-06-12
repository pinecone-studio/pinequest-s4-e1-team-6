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
    <div className="bg-white/5 p-5 rounded-xl">
      <h2 className="mb-3">Top Products</h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Bar dataKey="sales" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}