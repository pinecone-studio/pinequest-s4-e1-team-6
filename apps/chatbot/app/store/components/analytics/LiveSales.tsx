"use client";

import { useEffect, useState } from "react";

export default function LiveSales() {
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const fake = {
        id: Math.random(),
        product: "Product " + Math.floor(Math.random() * 10),
        amount: Math.floor(Math.random() * 100),
      };

      setSales((prev) => [fake, ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/5 p-5 rounded-xl">
      <h2 className="mb-3">Live Sales</h2>

      {sales.map((s) => (
        <div key={s.id} className="text-sm mb-1">
          {s.product} - ${s.amount}
        </div>
      ))}
    </div>
  );
}