"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/features/auth/AdminGuard";
import StatCard from "@/components/ui/StatCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Briefcase, Layers, Hammer, Calendar } from "lucide-react";
import Link from "next/link";
import {
  getDashboardStats,
  getHistoryStats,
  getRecentUsers,
  getTopServices,
} from "@/services/statsService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Home() {
  // Stats Cards
  const [stats, setStats] = useState({
    clients: 0,
    providers: 0,
    categories: 0,
    services: 0,
  });

  // Data for Chart & Tables
  const [historyData, setHistoryData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topServices, setTopServices] = useState([]);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0], // Últimos 30 dias
    end: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [dateRange]);

  async function loadAllData() {
    try {
      setLoading(true);
      // Carrega tudo em paralelo
      const [statsData, history, recent, services] = await Promise.all([
        getDashboardStats(),
        getHistoryStats(dateRange.start, dateRange.end),
        getRecentUsers(),
        getTopServices(),
      ]);

      setStats(statsData);
      setHistoryData(history);
      setRecentUsers(recent);
      setTopServices(services);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data desconhecida";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header & Filtros */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Visão Geral
            </h2>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-sm">
              <Calendar size={18} className="text-gray-500" />
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="bg-transparent text-sm outline-none text-gray-600 dark:text-gray-300"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="bg-transparent text-sm outline-none text-gray-600 dark:text-gray-300"
              />
            </div>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Gráfico de Histórico */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Histórico de Cadastros
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient
                      id="colorProvider"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorClient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="registration_date"
                    tickFormatter={(str) =>
                      new Date(str).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    }
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="provider_count"
                    name="Prestadores"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorProvider)"
                  />
                  <Area
                    type="monotone"
                    dataKey="client_count"
                    name="Clientes"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorClient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid Inferior: Lista Recentes e Top Serviços */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lista de Novos Usuários */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Usuários Recentes
              </h3>
              <div className="space-y-4">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Nenhum usuário recente.
                  </p>
                ) : (
                  recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-sm"
                    >
                      <div className="mb-2 sm:mb-0">
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          Novo usuário{" "}
                          <span className="text-blue-600">
                            @{user.username || "sem_user"}
                          </span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          Tipo:{" "}
                          <span className="uppercase font-semibold">
                            {user.user_role}
                          </span>{" "}
                          • {formatDate(user.created_at)}
                        </p>
                      </div>
                      <Link
                        href={`/usuarios/detalhes/${user.id}`}
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold whitespace-nowrap"
                      >
                        Saiba mais →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tabela de Top Serviços */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Top Serviços Ofertados
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Serviço</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3 text-center">Ofertas</th>
                      <th className="px-4 py-3 rounded-tr-lg text-center">
                        Booked
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topServices.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-4 text-center text-gray-500"
                        >
                          Nenhum serviço encontrado.
                        </td>
                      </tr>
                    ) : (
                      topServices.map((service, idx) => (
                        <tr
                          key={idx}
                          className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {service.service_name}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {service.category_name}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-blue-600">
                            {service.total_offers}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">
                            {service.booked_count}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
