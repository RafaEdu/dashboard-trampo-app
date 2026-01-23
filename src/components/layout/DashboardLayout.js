"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Conteúdo Principal */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header Trigger */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="font-bold text-lg text-gray-800 dark:text-gray-100">
            TrampoAdmin
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Área de Página (Injeção do conteúdo) */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
