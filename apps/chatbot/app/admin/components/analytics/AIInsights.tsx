"use client";

export default function AIInsights({ orders }: any) {
  const total = orders.reduce((s: number, o: any) => s + o.total, 0);

  const avg = orders.length ? total / orders.length : 0;

  let trend = "Stable";

  if (avg > 300) trend = "📈 High growth";
  else if (avg < 100) trend = "📉 Low sales";

  return (
    <div className="bg-white/5 p-4 rounded-xl">
      <h2 className="mb-2">AI Insights</h2>
      <p>Average Order: ${avg.toFixed(1)}</p>
      <p>Trend: {trend}</p>
    </div>
  );
}
