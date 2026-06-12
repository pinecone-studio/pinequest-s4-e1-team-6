"use client";

export default function AIInsights({ orders }: any) {
  const total = orders.reduce((s: number, o: any) => s + o.total, 0);
  const avg = orders.length ? total / orders.length : 0;

  let trend = "Stable";
  let trendColor = "text-gray-500 dark:text-gray-400";

  if (avg > 300) {
    trend = "📈 High growth";
    trendColor = "text-green-600 dark:text-green-400";
  } else if (avg < 100) {
    trend = "📉 Low sales";
    trendColor = "text-red-500 dark:text-red-400";
  }

  return (
    <div className="bg-slate-100 dark:bg-white/5 p-4 sm:p-5 rounded-xl w-full">
      <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3">
        AI Insights
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">
            Дундаж захиалга
          </span>
          <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            ${avg.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">
            Чиглэл
          </span>
          <span className={`text-sm sm:text-base font-semibold ${trendColor}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
