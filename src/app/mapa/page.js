"use client";

import dynamic from "next/dynamic";
import AdminGuard from "@/components/features/auth/AdminGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Importação dinâmica para evitar erro "window is not defined" no SSR
const ProviderMap = dynamic(
  () => import("@/components/features/map/ProviderMap"),
  {
    ssr: false,
    loading: () => <p>Carregando mapa...</p>,
  },
);

export default function MapaPage() {
  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Mapa de Prestadores
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Visualize a localização e o raio de atuação (20km) dos
              profissionais cadastrados.
            </p>
          </div>

          <ProviderMap />
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
