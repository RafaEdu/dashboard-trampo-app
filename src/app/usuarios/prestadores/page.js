"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/features/auth/AdminGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Hammer } from "lucide-react";
import Link from "next/link";
import { getRecentUsersByRole } from "@/services/statsService";

export default function Prestadores() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getRecentUsersByRole("provider");
        setUsers(data);
      } catch (error) {
        console.error("Erro ao carregar prestadores:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Data desconhecida";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <Hammer size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Prestadores
            </h2>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Cadastros Recentes
            </h3>

            {loading ? (
              <p className="text-gray-500 text-sm">Carregando...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Nenhum prestador encontrado.
              </p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/usuarios/detalhes/${user.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                  >
                    <div className="mb-2 sm:mb-0 flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          {user.full_name || "Nome não informado"}{" "}
                          <span className="text-blue-600">
                            @{user.username || "sem_user"}
                          </span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Prestador
                      </span>
                      <span className="text-blue-600 hover:text-blue-700 text-xs font-semibold whitespace-nowrap">
                        Ver perfil &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
