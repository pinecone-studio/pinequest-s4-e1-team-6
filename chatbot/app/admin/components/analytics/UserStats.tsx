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
    <div className="bg-white/5 p-4 rounded-xl">
      <h2>User Activity</h2>
      <p>Clicks: {clicks}</p>
    </div>
  );
}
