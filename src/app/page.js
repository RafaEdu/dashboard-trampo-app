"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/features/auth/AdminGuard";
import StatCard from "@/components/ui/StatCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
      {/* Envolva o conteúdo com DashboardLayout */}
      <DashboardLayout>
        {/* A Navbar antiga foi removida daqui. O Layout cuida disso agora. */}

        <div className="max-w-7xl mx-auto">
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
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
