import { supabase } from "@/lib/supabaseClient";

export const getDashboardStats = async () => {
  try {
    const [clients, providers, categories, services] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_role", "client"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_role", "provider"),
      supabase
        .from("service_categories")
        .select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
    ]);

    return {
      clients: clients.count || 0,
      providers: providers.count || 0,
      categories: categories.count || 0,
      services: services.count || 0,
    };
  } catch (error) {
    console.error("Erro no serviço de stats:", error);
    throw error;
  }
};

// Busca histórico para o gráfico
export const getHistoryStats = async (startDate, endDate) => {
  const { data, error } = await supabase.rpc("get_registrations_history", {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) throw error;
  return data;
};

// Busca últimos usuários cadastrados
export const getRecentUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, user_role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
};

// Busca top serviços
export const getTopServices = async () => {
  const { data, error } = await supabase.rpc("get_top_services");

  if (error) throw error;
  return data;
};
