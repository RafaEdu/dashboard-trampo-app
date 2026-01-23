"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { supabase } from "@/lib/supabaseClient";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Hammer } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// Função para criar um ícone customizado usando Lucide React
const createCustomIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div className="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white">
      <Hammer size={20} />
    </div>,
  );

  return L.divIcon({
    html: iconMarkup,
    className: "custom-marker-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

export default function ProviderMap() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const { data, error } = await supabase
          .from("admin_map_providers")
          .select("*");

        if (error) throw error;
        setProviders(data || []);
      } catch (error) {
        console.error("Erro ao carregar mapa:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, []);

  // Posição padrão (Centro do Brasil ou sua região preferida)
  const defaultCenter = [-14.235, -51.9253];
  const defaultZoom = 4;

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse flex items-center justify-center text-gray-400">
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm z-0 relative">
      <MapContainer
        center={
          providers.length > 0
            ? [providers[0].lat, providers[0].lng]
            : defaultCenter
        }
        zoom={providers.length > 0 ? 10 : defaultZoom}
        style={{ height: "600px", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {providers.map((provider) => (
          <div key={provider.id}>
            {/* Raio de atuação de 20km (20.000 metros) */}
            <Circle
              center={[provider.lat, provider.lng]}
              radius={20000}
              pathOptions={{
                color: "#2563eb", // blue-600
                fillColor: "#3b82f6", // blue-500
                fillOpacity: 0.1,
                weight: 1,
              }}
            />

            {/* Marcador do Prestador */}
            <Marker
              position={[provider.lat, provider.lng]}
              icon={createCustomIcon()}
            >
              <Popup>
                <div className="flex flex-col items-center gap-2 p-1 min-w-[150px]">
                  {provider.avatar_url ? (
                    <img
                      src={provider.avatar_url}
                      alt={provider.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {provider.full_name?.[0] || "P"}
                    </div>
                  )}
                  <div className="text-center">
                    <strong className="block text-sm text-gray-800">
                      {provider.full_name}
                    </strong>
                    <span className="text-xs text-gray-500">
                      @{provider.username}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
