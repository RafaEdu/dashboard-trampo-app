"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient.js";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    // Conectando ao mesmo banco do seu app!
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("name");

    if (error) console.error("Erro ao buscar:", error);
    else setCategories(data || []);

    setLoading(false);
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Dashboard Trampo
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Categorias Cadastradas</h2>

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="p-3 border border-gray-100 rounded hover:bg-gray-50 flex justify-between"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-400">
                    ID: {category.id}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
