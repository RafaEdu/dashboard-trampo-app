"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  Plus,
  Trash2,
  FolderOpen,
  FileText,
  Pencil,
  X,
  Save,
  Loader2,
} from "lucide-react";

export default function ServicesManager() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Estados de Criação
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  // Estado de Edição (Controla o Modal)
  // Formato: { type: 'category' | 'service', data: { id, name, description } }
  const [editingItem, setEditingItem] = useState(null);

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

  // --- CRUD: CRIAR ---
  async function addCategory(e) {
    e.preventDefault();
    if (!newCatName) return;
    setLoading(true);

    const { error } = await supabase
      .from("service_categories")
      .insert([{ name: newCatName, description: newCatDesc }]);

    if (error) alert(error.message);
    else {
      setNewCatName("");
      setNewCatDesc("");
      fetchCategories();
    }
    setLoading(false);
  }

  async function addService(e) {
    e.preventDefault();
    if (!newServiceName || !selectedCategory) return;
    setLoading(true);

    const { error } = await supabase.from("services").insert([
      {
        name: newServiceName,
        description: newServiceDesc,
        category_id: selectedCategory.id,
      },
    ]);

    if (error) alert(error.message);
    else {
      setNewServiceName("");
      setNewServiceDesc("");
      fetchServices(selectedCategory.id);
    }
    setLoading(false);
  }

  // --- CRUD: DELETAR ---
  async function deleteCategory(id) {
    if (!confirm("Tem certeza? Isso pode apagar serviços vinculados.")) return;
    const { error } = await supabase
      .from("service_categories")
      .delete()
      .eq("id", id);
    if (error) alert("Erro: " + error.message);
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

  // --- CRUD: ATUALIZAR (EDITAR) ---
  function openEditModal(type, item) {
    setEditingItem({
      type, // 'category' ou 'service'
      data: { ...item }, // Copia os dados para não alterar a lista visualmente antes de salvar
    });
  }

  async function handleUpdate() {
    if (!editingItem) return;
    setLoading(true);

    const table =
      editingItem.type === "category" ? "service_categories" : "services";

    const { error } = await supabase
      .from(table)
      .update({
        name: editingItem.data.name,
        description: editingItem.data.description,
      })
      .eq("id", editingItem.data.id);

    if (error) {
      alert("Erro ao atualizar: " + error.message);
    } else {
      // Sucesso! Atualiza as listas
      if (editingItem.type === "category") {
        fetchCategories();
        // Se a categoria editada for a selecionada atualmente, atualiza o título na direita
        if (selectedCategory?.id === editingItem.data.id) {
          setSelectedCategory({ ...selectedCategory, ...editingItem.data });
        }
      } else {
        fetchServices(selectedCategory.id);
      }
      setEditingItem(null); // Fecha o modal
    }
    setLoading(false);
  }

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Gerenciar Catálogo
              </h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <FolderOpen className="w-5 h-5 text-orange-500" />
                    Categorias
                  </h2>
                  <form
                    onSubmit={addCategory}
                    className="flex flex-col gap-3 mb-6 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-700"
                  >
                    <input
                      className="w-full border border-gray-300 dark:border-zinc-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="Nome da Categoria..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                    />
                    <input
                      className="w-full border border-gray-300 dark:border-zinc-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="Descrição breve..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                    />
                    <button
                      disabled={loading}
                      className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium flex justify-center items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Criar Categoria
                    </button>
                  </form>

                  {/* Lista de Categorias */}
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-3 rounded cursor-pointer border transition-all group ${
                          selectedCategory?.id === cat.id
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span
                              className={`font-medium block ${
                                selectedCategory?.id === cat.id
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {cat.name}
                            </span>
                            {cat.description && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block line-clamp-2">
                                {cat.description}
                              </span>
                            )}
                          </div>

                          {/* Ações (Editar e Deletar) */}
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal("category", cat);
                              }}
                              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCategory(cat.id);
                              }}
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                              title="Deletar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- COLUNA DA DIREITA: SERVIÇOS --- */}
              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 h-full min-h-[500px]">
                  {!selectedCategory ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 p-10">
                      <FolderOpen className="w-20 h-20 mb-4 opacity-10" />
                      <p className="text-lg">Selecione uma categoria ao lado</p>
                      <p className="text-sm opacity-70">
                        para visualizar ou adicionar serviços
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                              Categoria
                            </span>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                              {selectedCategory.name}
                            </h2>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedCategory.description ||
                              "Sem descrição definida"}
                          </p>
                        </div>
                      </div>

                      {/* Form Novo Serviço */}
                      <form
                        onSubmit={addService}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-8 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-100 dark:border-zinc-700"
                      >
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
                            Nome do Serviço
                          </label>
                          <input
                            className="w-full border border-gray-300 dark:border-zinc-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
                            placeholder="Ex: Instalação de Ar..."
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-6">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
                            Descrição Detalhada
                          </label>
                          <input
                            className="w-full border border-gray-300 dark:border-zinc-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
                            placeholder="Ex: Instalação completa com suporte..."
                            value={newServiceDesc}
                            onChange={(e) => setNewServiceDesc(e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2 flex items-end">
                          <button
                            disabled={loading}
                            className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 font-medium flex justify-center items-center gap-2 transition-colors h-[38px]"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        </div>
                      </form>

                      {/* Lista de Serviços */}
                      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>{services.length} serviços cadastrados</span>
                      </div>

                      {services.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 dark:bg-zinc-800/30 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
                          <p className="text-gray-500 dark:text-gray-400">
                            Nenhum serviço cadastrado nesta categoria.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {services.map((service) => (
                            <div
                              key={service.id}
                              className="group flex justify-between items-center p-4 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-all bg-white dark:bg-zinc-800"
                            >
                              <div>
                                <span className="text-gray-900 dark:text-gray-100 font-medium text-base block">
                                  {service.name}
                                </span>
                                {service.description && (
                                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">
                                    {service.description}
                                  </span>
                                )}
                              </div>

                              {/* Ações Serviço */}
                              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    openEditModal("service", service)
                                  }
                                  className="text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  title="Editar serviço"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteService(service.id)}
                                  className="text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Remover serviço"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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

          {/* --- MODAL DE EDIÇÃO (CARD FLUTUANTE) --- */}
          {editingItem && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 transform transition-all scale-100">
                {/* Header do Modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-blue-600" />
                    Editar{" "}
                    {editingItem.type === "category" ? "Categoria" : "Serviço"}
                  </h3>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Corpo do Modal */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome
                    </label>
                    <input
                      className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={editingItem.data.name}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <textarea
                      className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-24 resize-none"
                      value={editingItem.data.description || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: {
                            ...editingItem.data,
                            description: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Footer do Modal */}
                <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
