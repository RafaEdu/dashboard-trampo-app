"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";
import { Plus, Trash2, FolderOpen } from "lucide-react";

export default function ServicesManager() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [newCatName, setNewCatName] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchServices(selectedCategory.id);
    } else {
      setServices([]);
    }
  }, [selectedCategory]);

  async function fetchCategories() {
    const { data } = await supabase
      .from("service_categories")
      .select("*")
      .order("name");
    setCategories(data || []);
  }

  async function fetchServices(categoryId) {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("category_id", categoryId)
      .order("name");
    setServices(data || []);
  }

  async function addCategory(e) {
    e.preventDefault();
    if (!newCatName) return;
    setLoading(true);

    const { error } = await supabase
      .from("service_categories")
      .insert([{ name: newCatName }]);

    if (error) alert(error.message);
    else {
      setNewCatName("");
      fetchCategories();
    }
    setLoading(false);
  }

  async function addService(e) {
    e.preventDefault();
    if (!newServiceName || !selectedCategory) return;
    setLoading(true);

    const { error } = await supabase
      .from("services")
      .insert([{ name: newServiceName, category_id: selectedCategory.id }]);

    if (error) alert(error.message);
    else {
      setNewServiceName("");
      fetchServices(selectedCategory.id);
    }
    setLoading(false);
  }

  async function deleteCategory(id) {
    if (!confirm("Tem certeza? Isso pode apagar serviços vinculados.")) return;
    const { error } = await supabase
      .from("service_categories")
      .delete()
      .eq("id", id);
    if (error)
      alert("Erro ao deletar (verifique se existem serviços vinculados)");
    else {
      fetchCategories();
      if (selectedCategory?.id === id) setSelectedCategory(null);
    }
  }

  async function deleteService(id) {
    if (!confirm("Apagar este serviço?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error && selectedCategory) fetchServices(selectedCategory.id);
  }

  return (
    <AdminGuard>
      {/* Fundo Principal adaptável */}
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gerenciar Catálogo
            </h1>
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ← Voltar para Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* COLUNA DA ESQUERDA: CATEGORIAS */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <FolderOpen className="w-5 h-5 text-orange-500" />
                  Categorias
                </h2>

                {/* Form Nova Categoria */}
                <form onSubmit={addCategory} className="flex gap-2 mb-6">
                  <input
                    className="flex-1 border border-gray-300 dark:border-zinc-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Nova Categoria..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                  <button
                    disabled={loading}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </form>

                {/* Lista de Categorias */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-3 rounded cursor-pointer flex justify-between items-center border transition-colors ${
                        selectedCategory?.id === cat.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300"
                          : "bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          selectedCategory?.id === cat.id
                            ? ""
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {cat.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(cat.id);
                        }}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUNA DA DIREITA: SERVIÇOS */}
            <div className="md:col-span-8">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 h-full">
                {!selectedCategory ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 p-10">
                    <FolderOpen className="w-16 h-16 mb-4 opacity-20" />
                    <p>Selecione uma categoria ao lado para ver os serviços</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                          {selectedCategory.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Gerenciando serviços desta categoria
                        </p>
                      </div>
                    </div>

                    {/* Form Novo Serviço */}
                    <form
                      onSubmit={addService}
                      className="flex gap-2 mb-6 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-100 dark:border-zinc-700"
                    >
                      <input
                        className="flex-1 border border-gray-300 dark:border-zinc-600 rounded px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:border-green-500 focus:outline-none bg-white dark:bg-zinc-800"
                        placeholder={`Novo serviço em ${selectedCategory.name}...`}
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                      />
                      <button
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Adicionar
                      </button>
                    </form>

                    {/* Lista de Serviços */}
                    {services.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-10 bg-gray-50 dark:bg-zinc-800/30 rounded border border-dashed border-gray-200 dark:border-zinc-700">
                        Nenhum serviço cadastrado nesta categoria.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className="flex justify-between items-center p-3 border border-gray-200 dark:border-zinc-700 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-800"
                          >
                            <span className="text-gray-700 dark:text-gray-200 font-medium">
                              {service.name}
                            </span>
                            <button
                              onClick={() => deleteService(service.id)}
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
