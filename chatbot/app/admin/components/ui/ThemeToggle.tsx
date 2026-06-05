"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  // LOAD FROM STORAGE
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle(
        "dark",
        saved === "dark"
      );
    }
  }, []);

  // TOGGLE FUNCTION
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark"
    );
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-full bg-gray-700 p-2 rounded text-sm"
    >
      {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </button>
  );
}