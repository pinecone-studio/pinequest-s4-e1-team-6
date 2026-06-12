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
    <div className="bg-slate-100 dark:bg-white/5 p-4 sm:p-5 rounded-xl w-full">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Live Sales
        </h2>
      </div>

      {sales.length === 0 ? (
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
          Хүлээж байна...
        </p>
      ) : (
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {sales.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm transition-all
                ${
                  i === 0
                    ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                    : "bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                }`}
            >
              <span className="font-medium truncate mr-2">{s.product}</span>
              <span className="font-bold shrink-0">${s.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
