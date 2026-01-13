"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Lock,
  Loader2,
  ArrowLeft,
  KeyRound,
  Mail,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Estados de controle de fluxo
  const [view, setView] = useState("login"); // login, forgot_password, verify_code, new_password

  // Estados dos formulários
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- Funções Auxiliares ---

  const checkAdminStatus = async (userId) => {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      throw new Error(
        "Acesso negado. Apenas administradores podem entrar aqui."
      );
    }
    return true;
  };

  // --- Handlers de Ação ---

  // 1. Login Tradicional
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!session) throw new Error("Sessão não iniciada.");

      await checkAdminStatus(session.user.id);

      router.push("/");
    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.message || "Ocorreu um erro ao tentar entrar.");
      setLoading(false);
    }
  };

  // 2. Enviar Código de Recuperação (ALTERADO)
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Mudança aqui: Usando resetPasswordForEmail em vez de signInWithOtp
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      setSuccessMessage("Código de recuperação enviado! Verifique seu e-mail.");
      setView("verify_code");
    } catch (err) {
      setError(err.message || "Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Verificar Código (ALTERADO)
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "recovery", // Mudança aqui: O tipo agora é 'recovery'
      });

      if (error) throw error;
      if (!session) throw new Error("Falha na verificação.");

      // Mesmo sendo recuperação, verificamos se é admin por segurança
      await checkAdminStatus(session.user.id);

      setView("new_password");
    } catch (err) {
      setError(err.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Salvar Nova Senha
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      router.push("/");
    } catch (err) {
      setError(err.message || "Erro ao atualizar senha.");
      setLoading(false);
    }
  };

  // --- Renderização (Igual ao anterior) ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950 transition-colors">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-transparent dark:border-zinc-800">
        <div className="flex flex-col items-center relative">
          {view !== "login" && (
            <button
              onClick={() => {
                setView("login");
                setError(null);
                setSuccessMessage(null);
              }}
              className="absolute left-0 top-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            {view === "login" && (
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            )}
            {view === "forgot_password" && (
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            )}
            {view === "verify_code" && (
              <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            )}
            {view === "new_password" && (
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {view === "login" && "Admin Trampo"}
            {view === "forgot_password" && "Recuperar Senha"}
            {view === "verify_code" && "Verificar Código"}
            {view === "new_password" && "Nova Senha"}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
            {view === "login" && "Entre com suas credenciais de gestor"}
            {view === "forgot_password" &&
              "Digite seu e-mail para receber o código de troca de senha"}
            {view === "verify_code" && `Digite o código enviado para ${email}`}
            {view === "new_password" && "Defina sua nova senha de acesso"}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
            {successMessage}
          </div>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                placeholder="admin@trampo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setView("forgot_password")}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Entrar no Painel"
              )}
            </button>
          </form>
        )}

        {view === "forgot_password" && (
          <form onSubmit={handleSendResetCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                placeholder="admin@trampo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Enviar Código"
              )}
            </button>
          </form>
        )}

        {view === "verify_code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Código de Verificação
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 tracking-widest text-center text-lg"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verificar Código"
              )}
            </button>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={handleSendResetCode}
                className="text-xs text-gray-500 underline"
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}

        {view === "new_password" && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nova Senha
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                placeholder="••••••••"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Salvar Nova Senha e Entrar"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
