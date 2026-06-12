
import { Toaster } from "sonner";
import Sidebar from "./components/layout/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0D0D0D] overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0D0D0D]/50 backdrop-blur-md z-30">
          <h2 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em]">
            Overview
          </h2>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Admin Control</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <Toaster richColors position="top-center" />
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}