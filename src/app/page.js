"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";
import StatCard from "@/components/StatCard";
import { Users, Briefcase, Layers, Hammer } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState({
    clients: 0,
    providers: 0,
    categories: 0,
    services: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const { count: clientsCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_role", "client");
      const { count: providersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_role", "provider");
      const { count: catCount } = await supabase
        .from("service_categories")
        .select("*", { count: "exact", head: true });
      const { count: servCount } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true });

      setStats({
        clients: clientsCount || 0,
        providers: providersCount || 0,
        categories: catCount || 0,
        services: servCount || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      {/* Fundo adaptável */}
      <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
        {/* Navbar */}
        <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-500">
            Trampo Admin
          </h1>
          <div className="flex gap-4">
            <Link
              href="/servicos"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Gerenciar Catálogo
            </Link>
            <Link
              href="/verificacao"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-2"
            >
              Verificações
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-red-600 dark:text-red-400 font-medium hover:text-red-800 dark:hover:text-red-300 transition-colors"
            >
              Sair
            </button>
          </div>
        </nav>

        <div className="p-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Visão Geral
          </h2>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Prestadores Ativos"
              value={loading ? "..." : stats.providers}
              icon={Hammer}
              color="blue"
              description="Profissionais cadastrados"
            />
            <StatCard
              title="Contratantes"
              value={loading ? "..." : stats.clients}
              icon={Users}
              color="purple"
              description="Clientes buscando serviços"
            />
            <StatCard
              title="Categorias"
              value={loading ? "..." : stats.categories}
              icon={Layers}
              color="orange"
            />
            <StatCard
              title="Serviços Oferecidos"
              value={loading ? "..." : stats.services}
              icon={Briefcase}
              color="green"
            />
          </div>

          {/* Área de Ação Rápida */}
          <div className="bg-blue-600 dark:bg-blue-700 rounded-xl p-8 text-white flex justify-between items-center shadow-lg">
            <div>
              <h3 className="text-xl font-bold">
                Precisa expandir o catálogo?
              </h3>
              <p className="text-blue-100 mt-1">
                Adicione novas categorias e serviços para atrair mais
                profissionais.
              </p>
            </div>
            <Link
              href="/servicos"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Gerenciar Serviços
            </Link>
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
