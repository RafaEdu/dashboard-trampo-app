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
