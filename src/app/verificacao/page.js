"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/features/auth/AdminGuard";
import VerificationModal from "@/components/features/verification/VerificationModal";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";

export default function VerificacaoPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      // Busca na tabela de documentos onde o status é pending
      // E traz os dados do perfil associado
      const { data, error } = await supabase
        .from("provider_documents")
        .select(
          `
    *,
    profiles:provider_documents_profile_id_fkey_custom (full_name, cpf_cnpj, username)
  `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Erro detalhado:", JSON.stringify(error, null, 2));
      console.error("Mensagem:", error.message);
      console.error("Detalhes:", error.details);
      console.error("Dica:", error.hint);
    } finally {
      setLoading(false);
    }
  }

  // Lógica Transacional (Manual)
  const handleResolve = async (docId, profileId, newStatus) => {
    try {
      // 1. Atualiza o status do documento
      const { error: docError } = await supabase
        .from("provider_documents")
        .update({ status: newStatus })
        .eq("id", docId);

      if (docError) throw docError;

      // 2. Se for aprovado, atualiza o PERFIL do usuário também para 'verified'
      // Se for rejeitado, podemos voltar o perfil para 'rejected' ou manter 'pending'
      if (newStatus === "verified") {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ verification_status: "verified" })
          .eq("id", profileId);

        if (profileError) throw profileError;
      } else if (newStatus === "rejected") {
        await supabase
          .from("profiles")
          .update({ verification_status: "rejected" })
          .eq("id", profileId);
      }

      // 3. Atualiza a UI (Remove da lista)
      setRequests((prev) => prev.filter((r) => r.id !== docId));
    } catch (error) {
      alert("Erro ao processar: " + error.message);
      console.error(error);
    }
  };

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
          {/* Header simplificado */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Fila de Verificação
            </h1>
            <p className="text-gray-500">
              Analise documentos pendentes de prestadores de serviço.
            </p>
          </div>
        </div>

        {/* Tabela de Fila */}
        <div className="max-w-7xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Carregando fila...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <UserCheck size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Tudo limpo!
              </h3>
              <p className="text-gray-500 max-w-sm">
                Não há documentos pendentes de análise no momento.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-xs uppercase text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Data Envio</th>
                  <th className="px-6 py-4">Candidato</th>
                  <th className="px-6 py-4">Tipo Doc</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()} <br />
                      <span className="text-xs">
                        {new Date(req.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {req.profiles?.full_name || "Sem nome"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {req.profiles?.cpf_cnpj}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                        {req.document_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold uppercase flex w-fit items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        Pendente
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Analisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Renderiza o Modal se houver item selecionado */}
        {selectedRequest && (
          <VerificationModal
            document={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onResolve={handleResolve}
          />
        )}
      </DashboardLayout>
    </AdminGuard>
  );
}
