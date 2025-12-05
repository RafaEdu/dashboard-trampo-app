"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  Users,
  Menu,
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const menuItems = [
    {
      title: "Visão Geral",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Gerenciar Catálogo",
      href: "/servicos",
      icon: Briefcase,
    },
    {
      title: "Verificações",
      href: "/verificacao",
      icon: UserCheck,
      badge: true,
    },
    {
      title: "Usuários",
      icon: Users,
      submenu: [
        { title: "Prestadores", href: "/usuarios/prestadores" },
        { title: "Clientes", href: "/usuarios/clientes" },
      ],
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: Settings,
    },
  ];

  const toggleSubmenu = (title) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Overlay para Mobile */}
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header da Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-500">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              T
            </div>
            TrampoAdmin
          </div>
        </div>

        {/* Lista de Navegação */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)] custom-scrollbar">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu Principal
          </p>

          {menuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                // Lógica de Submenu (Accordion)
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      openSubmenu === item.title
                        ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {item.title}
                    </div>
                    {openSubmenu === item.title ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {/* Itens do Submenu */}
                  <div
                    className={`pl-10 space-y-1 overflow-hidden transition-all duration-300 ${
                      openSubmenu === item.title ? "max-h-40 mt-1" : "max-h-0"
                    }`}
                  >
                    {item.submenu.map((sub, subIndex) => (
                      <Link
                        key={subIndex}
                        href={sub.href}
                        className="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                // Item de Menu Normal
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)} // Fecha no mobile ao clicar
                  className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.title}
                  </div>
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer da Sidebar (Logout) */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
}
