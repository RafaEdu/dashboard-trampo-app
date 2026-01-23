import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, Check, AlertTriangle, Loader2 } from "lucide-react";

export default function VerificationModal({ document, onClose, onResolve }) {
  const [signedUrls, setSignedUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Hook para gerar URLs seguras on-the-fly
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!document) return;

      const paths = {
        front: document.doc_front_url,
        back: document.doc_back_url,
        selfie: document.selfie_url,
        holding: document.holding_doc_url,
      };

      const urls = {};

      // Itera sobre as chaves e gera URLs assinadas para o bucket 'verification-docs'
      // Atenção: Certifique-se que o nome do bucket no Storage é exatamente este
      for (const [key, path] of Object.entries(paths)) {
        if (path) {
          const { data } = await supabase.storage
            .from("verification-docs")
            .createSignedUrl(path, 60 * 60); // Link válido por 1 hora

          if (data) urls[key] = data.signedUrl;
        }
      }

      setSignedUrls(urls);
      setLoadingImages(false);
    };

    fetchSignedUrls();
  }, [document]);

  const handleAction = async (status) => {
    setProcessing(true);
    // Chama a função passada pelo pai para atualizar o banco
    await onResolve(document.id, document.profile_id, status);
    setProcessing(false);
    onClose();
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-950">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Auditoria de Identidade
            </h2>
            <p className="text-sm text-gray-500">
              Candidato:{" "}
              <span className="font-medium text-blue-600">
                {document.profiles?.full_name}
              </span>{" "}
              • CPF: {document.profiles?.cpf_cnpj}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Corpo com Grid de Imagens */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-zinc-950/50">
          {loadingImages ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lado Esquerdo: O Documento */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  📄 Documento Oficial ({document.document_type.toUpperCase()})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black rounded-lg aspect-video relative overflow-hidden group">
                    <img
                      src={signedUrls.front}
                      className="w-full h-full object-contain"
                      alt="Frente"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      Frente
                    </span>
                  </div>
                  {signedUrls.back && (
                    <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
                      <img
                        src={signedUrls.back}
                        className="w-full h-full object-contain"
                        alt="Verso"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Verso
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lado Direito: A Pessoa */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  👤 Biometria Facial
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black rounded-lg aspect-[3/4] relative overflow-hidden border-4 border-blue-500/30">
                    <img
                      src={signedUrls.selfie}
                      className="w-full h-full object-cover"
                      alt="Selfie"
                    />
                    <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
                      Selfie Atual
                    </span>
                  </div>
                  {signedUrls.holding && (
                    <div className="bg-black rounded-lg aspect-[3/4] relative overflow-hidden border-4 border-green-500/30">
                      <img
                        src={signedUrls.holding}
                        className="w-full h-full object-cover"
                        alt="Prova de Vida"
                      />
                      <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">
                        Prova de Vida
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ação */}
        <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Confira se a foto do documento bate com a selfie.
          </div>

          <div className="flex gap-4">
            <button
              disabled={processing}
              onClick={() => handleAction("rejected")}
              className="px-6 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-200"
            >
              Rejeitar Solicitação
            </button>
            <button
              disabled={processing}
              onClick={() => handleAction("verified")}
              className="px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 flex items-center gap-2 transition-all"
            >
              {processing ? <Loader2 className="animate-spin" /> : <Check />}
              Aprovar Profissional
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
