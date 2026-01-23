"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/features/auth/AdminGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, User, Mail, Calendar, Shield } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setUser(data);
      }
      setLoading(false);
    }

    fetchUser();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR");
  };

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para Dashboard
          </Link>

          {loading ? (
            <div className="text-center py-10">Carregando perfil...</div>
          ) : user ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
              {/* Header do Perfil */}
              <div className="bg-blue-600 h-32 w-full relative"></div>
              <div className="px-8 pb-8">
                <div className="relative -mt-12 mb-6 flex items-end justify-between">
                  <div className="flex items-end gap-6">
                    <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-full p-1 shadow-lg">
                      <img
                        src={
                          user.avatar_url || "https://via.placeholder.com/150"
                        }
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover bg-gray-200"
                      />
                    </div>
                    <div className="mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.full_name || "Nome não informado"}
                      </h1>
                      <p className="text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize
                    ${user.user_role === "provider" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                  >
                    {user.user_role}
                  </span>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2">
                      Informações Pessoais
                    </h3>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <Mail size={18} />
                      <span>{user.email || "Email restrito"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <User size={18} />
                      <span>CPF/CNPJ: {user.cpf_cnpj || "Não informado"}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2">
                      Dados da Conta
                    </h3>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <Calendar size={18} />
                      <span>Cadastrado em: {formatDate(user.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <Shield size={18} />
                      <span>Status: {user.verification_status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-red-500">
              Usuário não encontrado.
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
