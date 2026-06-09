"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, Package, ShoppingCart, 
  ChevronLeft, ChevronRight, Settings 
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

export default function Sidebar() {
  const { user, isLoaded } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const path = usePathname();

  const storeName = (user?.publicMetadata?.storeName as string) || user?.firstName || "Store";
  const firstLetter = storeName.charAt(0).toUpperCase();

  const menu = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Settings", href: "/admin/setting", icon: Settings }, 
  ];

  return (
    <aside className={`relative h-screen p-4 flex flex-col justify-between transition-all duration-500 ease-in-out z-60
      ${collapsed ? "w-20" : "w-64"} bg-[#0B1120] border-r border-white/5 text-white shadow-2xl`}>
      
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-indigo-600 hover:bg-indigo-500 w-6 h-6 rounded-full flex items-center justify-center border border-[#0B1120] shadow-xl z-50 transition-transform active:scale-90"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div>
        <Link 
          href="/" 
          className={`flex items-center gap-3 mb-12 mt-2 px-2 hover:opacity-80 transition-opacity active:scale-95 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20 shrink-0">
             {isLoaded ? firstLetter : <div className="w-4 h-4 bg-white/20 animate-pulse rounded-full" />}
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-in fade-in duration-500 overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-white leading-tight truncate max-w-35">
                {storeName}
              </span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Admin</span>
            </div>
          )}
        </Link>

        <nav className="space-y-1.5">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = path === item.href;
            return (
              <Link key={item.name} href={item.href} 
                className={`flex items-center gap-3 p-3.5 rounded-xl relative
                ${active ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/10" : "text-gray-400"}`}>
                <Icon size={19} className={active ? "scale-110" : ""} />
                {!collapsed && <span className="text-sm font-medium tracking-wide">{item.name}</span>}
                {active && <div className="absolute left-0 top-1/4 h-1/2 w-0.5 bg-indigo-400 rounded-full" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-white/5">
        {!collapsed && (
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-2xl">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest"></span>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  );
}
