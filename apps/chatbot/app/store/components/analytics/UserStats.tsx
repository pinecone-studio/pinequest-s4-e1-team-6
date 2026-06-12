"use client";

import { useEffect, useState } from "react";

export default function UserStats() {
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const handleClick = () => {
      setClicks((c) => c + 1);
    };

    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="bg-slate-100 dark:bg-white/5 p-4 sm:p-5 rounded-xl w-full">
      <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-2 sm:mb-3">
        User Activity
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        Clicks: {clicks}
      </p>
    </div>
  );
}
