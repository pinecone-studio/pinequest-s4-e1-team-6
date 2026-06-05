"use client";

export default function OrdersHeatmap({ orders }: any) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const map: any = {};

  orders.forEach((o: any) => {
    const day = new Date(o.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
    });

    if (!map[day]) map[day] = 0;

    map[day]++;
  });

  return (
    <div className="bg-white/5 p-5 rounded-xl">
      <h2 className="mb-3">Orders Heatmap</h2>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <div
            key={d}
            className="h-16 flex items-center justify-center rounded bg-indigo-700"
          >
            {map[d] || 0}
          </div>
        ))}
      </div>
    </div>
  );
}