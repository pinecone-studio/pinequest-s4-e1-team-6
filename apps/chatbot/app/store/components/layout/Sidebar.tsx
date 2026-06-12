"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Settings,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

export default function Sidebar() {
  const { user, isLoaded } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = usePathname();

  const storeName =
    (user?.publicMetadata?.storeName as string) || user?.firstName || "Store";
  const firstLetter = storeName.charAt(0).toUpperCase();

  const menu = [
    { name: "Dashboard", href: "/store", icon: LayoutDashboard },
    { name: "Products", href: "/store/products", icon: Package },
    { name: "Orders", href: "/store/orders", icon: ShoppingCart },
    { name: "Settings", href: "/store/setting", icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div>
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 mb-12 mt-2 px-2 hover:opacity-80 transition-opacity active:scale-95 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20 shrink-0">
            {isLoaded ? (
              firstLetter
            ) : (
              <div className="w-4 h-4 bg-white/20 animate-pulse rounded-full" />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-in fade-in duration-500 overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight truncate max-w-35">
                {storeName}
              </span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                Admin
              </span>
            </div>
          )}
        </Link>

        {/* Nav */}
        <nav className="space-y-1.5">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = path === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 p-3.5 rounded-xl relative transition-colors
                  ${
                    active
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/10"
                      : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
              >
                <Icon size={19} className={active ? "scale-110" : ""} />
                {!collapsed && (
                  <span className="text-sm font-medium tracking-wide">
                    {item.name}
                  </span>
                )}
                {active && (
                  <div className="absolute left-0 top-1/4 h-1/2 w-0.5 bg-indigo-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/5">
        {!collapsed && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-2xl">
            <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest" />
            <ThemeToggle />
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <ThemeToggle iconOnly />
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-[200] bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-2 shadow-lg"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Цэс нээх"
      >
        {mobileOpen ? (
          <X size={20} className="text-slate-700 dark:text-white" />
        ) : (
          <Menu size={20} className="text-slate-700 dark:text-white" />
        )}
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[150] backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar (slide in) ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-72 z-[160] p-4 flex flex-col justify-between
          bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-white/5
          text-slate-900 dark:text-white shadow-2xl
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden md:flex relative h-screen p-4 flex-col justify-between
          transition-all duration-500 ease-in-out z-60
          ${collapsed ? "w-20" : "w-64"}
          bg-white dark:bg-[#0B1120]
          border-r border-slate-200 dark:border-white/5
          text-slate-900 dark:text-white shadow-2xl`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-10 dark:bg-indigo-600 bg-white hover:bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-[#0B1120] shadow-xl z-50 transition-transform active:scale-90"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {sidebarContent}
      </aside>
    </>
  );
}
