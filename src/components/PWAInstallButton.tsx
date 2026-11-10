import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  MonitorDown,
  X,
  Check,
  Smartphone,
  ExternalLink,
  Laptop,
  PlayCircle,
  HelpCircle,
  Download,
} from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {isInstalled ? (
        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Check className="w-3 h-3" /> App PC Autonome
        </span>
      ) : (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          title="Installer l'application sur votre PC sans ligne de commande"
        >
          <MonitorDown className="w-3.5 h-3.5 text-amber-300" />
          <span>Installer sur PC (1 Clic)</span>
        </button>
      )}

      {/* Guided Modal for 1-Click Zero Command Line Installation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Laptop className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Installation Facile sur PC (Sans Ligne de Commande)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Deux options automatiques pour utiliser AdminBelgique comme un logiciel autonome
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Option 1: Direct PWA Install in Chrome / Edge */}
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>Installation Directe Navigateur (Le plus simple)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    1 Clic • Recommandé
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed text-[11px] pl-8">
                  Dans <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong> :
                </p>

                <div className="pl-8 space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>
                      Regardez tout à droite de votre barre d'adresse : cliquez sur la petite icône d'ordinateur{' '}
                      <strong>"Installer l'application"</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>
                      Ou cliquez sur les 3 points du menu du navigateur &gt; <strong>"Installer AdminBelgique"</strong>.
                    </span>
                  </div>
                </div>

                <div className="pl-8 pt-1">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      L'icône <strong>AdminBelgique</strong> s'ajoute immédiatement sur votre <strong>Bureau Windows</strong> et dans le <strong>menu Démarrer</strong> !
                    </span>
                  </div>
                </div>
              </div>

              {/* Option 2: Double-click Launcher File */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>Double-Clic Automatique (Fichier .BAT pour Windows)</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Pour usage hors-ligne</span>
                </div>

                <p className="text-slate-300 leading-relaxed text-[11px] pl-8">
                  Si vous téléchargez l'archive complète du projet :
                </p>

                <div className="pl-8 space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <span>Décompressez le dossier zip.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">2.</span>
                    <span>
                      Faites un simple <strong>double-clic sur le fichier :</strong>
                      <span className="ml-1 font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                        LANCER-ADMINBELGIQUE.bat
                      </span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">3.</span>
                    <span>
                      Le script s'occupe de tout automatiquement et ouvre l'application dans votre navigateur sans que vous n'ayez à taper la moindre ligne de commande !
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <a
                href="/api/download-zip"
                download="adminbelgique-platform.zip"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger le pack avec le fichier .BAT</span>
              </a>

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
