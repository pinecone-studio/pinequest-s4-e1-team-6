"use client";

export default function OrdersHeatmap({ orders }: any) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const map: any = {};
  orders.forEach((o: any) => {
    const day = new Date(o.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
    });
    if (!map[day]) map[day] = 0;
    map[day]++;
  });

  const max = Math.max(...days.map((d) => map[d] || 0), 1);

  function getIntensity(count: number) {
    const ratio = count / max;
    if (ratio === 0)
      return "bg-indigo-500/10 dark:bg-indigo-500/10 text-gray-400 dark:text-gray-600";
    if (ratio < 0.3)
      return "bg-indigo-500/30 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300";
    if (ratio < 0.6)
      return "bg-indigo-500/55 dark:bg-indigo-500/40 text-indigo-800 dark:text-indigo-200";
    if (ratio < 0.85)
      return "bg-indigo-600/75 dark:bg-indigo-600/65 text-white";
    return "bg-indigo-600 dark:bg-indigo-500 text-white";
  }

  return (
    <div className="bg-slate-100 dark:bg-white/5 p-4 sm:p-5 rounded-xl w-full">
      <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
        Orders Heatmap
      </h2>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d) => {
          const count = map[d] || 0;
          return (
            <div
              key={d}
              className="flex flex-col items-center gap-1 sm:gap-1.5"
            >
              {/* Bar */}
              <div
                className={`w-full rounded-lg flex items-center justify-center font-bold transition-all
                  text-[10px] sm:text-xs
                  h-10 sm:h-14 md:h-16
                  ${getIntensity(count)}`}
              >
                {count}
              </div>
              {/* Day label */}
              <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
                {d}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
