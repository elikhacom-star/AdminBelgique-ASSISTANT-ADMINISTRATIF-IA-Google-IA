import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Building,
  Calendar,
  FileCheck2,
  ScanText,
  Calculator,
  HardDrive,
  Download,
  Smartphone,
} from 'lucide-react';
import { NavigationTab, UserProfileType } from '../types/adminbelgique';
import { UPCOMING_FISCAL_DEADLINES } from '../data/belgianData';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './RoleBadge';

interface DashboardViewProps {
  onSelectTab: (tab: NavigationTab) => void;
  userProfile: UserProfileType;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectTab, userProfile }) => {
  const { currentRole, currentUser } = useAuth();
  const [dossiers, setDossiers] = useState<any[]>([
    {
      id: 'DOS-2026-88',
      title: 'Contrat de Bail Résidence Principale - Ixelles',
      category: 'Immobilier / Région Bruxelles',
      date: '06/11/2026',
      status: 'Conforme & Enregistrable',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      action: 'Télécharger PDF',
    },
    {
      id: 'DOS-2026-87',
      title: 'Mise en Demeure de Paiement Facture Impayée',
      category: 'Recouvrement B2B',
      date: '04/11/2026',
      status: 'Notifié au Débiteur',
      statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      action: 'Suivi Échéance 14j',
    },
    {
      id: 'DOS-2026-85',
      title: 'Analyse Avertissement-Extrait de Rôle SPF Finances',
      category: 'Fiscalité IPP 2025/2024',
      date: '02/11/2026',
      status: 'Communication Validée',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      action: 'Voir Recours',
    },
    {
      id: 'DOS-2026-81',
      title: 'Indexation Loyer Statbel - Appartement Liège',
      category: 'Statbel Indice Santé',
      date: '28/10/2026',
      status: 'Courrier Prêt (+52.99 €)',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      action: 'Imprimer',
    },
  ]);

  useEffect(() => {
    fetch('/api/dossiers')
      .then((res) => res.json())
      .then((data) => {
        if (data.dossiers && data.dossiers.length > 0) {
          setDossiers(data.dossiers);
        }
      })
      .catch((err) => console.log('Offline/Local mode active'));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Moteur d'Intelligence Administrative Belge v3.4</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Rôle actif :</span>
              <RoleBadge role={currentRole} />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Bienvenue sur votre espace <span className="text-blue-400">AdminBelgique</span>
          </h1>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Centralisez vos démarches administratives, gérez vos obligations SPF Finances et ONSS, générez des documents conformes au droit belge et protégez vos données avec notre anonymisation brevetée conforme RGPD.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectTab('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Consulter l'Assistant IA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectTab('analyzer')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <ScanText className="w-3.5 h-3.5 text-blue-400" />
              <span>Analyser un Courrier Administratif</span>
            </button>
            <button
              onClick={() => onSelectTab('generator')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Générer un Document Belge</span>
            </button>
            <button
              onClick={() => onSelectTab('android')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tester la Version Android (Mobile)</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Dossiers Actifs</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">24</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            <span>100% conformes aux lois belges</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Prochaine Échéance Fiscale</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">20 Déc.</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            <span>Acompte ISOC / TVA trimestrielle</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Documents Générés</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">142</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-400">
            <TrendingUp className="w-3 h-3" />
            <span>Mises en demeure, baux, PV</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Anonymisation RGPD</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">Active</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <span>Masquage NISS & BCE certifié</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Deadlines and Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Dossiers and Quick Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Access Modules Cards */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Modules Principaux AdminBelgique</h2>
              <span className="text-xs text-slate-400">Accès rapide</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => onSelectTab('immoboost')}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                    <Building className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300">
                    ImmoBoost Pro
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Immobilier & Rentabilité Belge
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Recherche multiplateforme (Immoweb/Zimmo), calcul de rendement, droits 12.5% et indexation Statbel.
                </p>
              </div>

              <div
                onClick={() => onSelectTab('fiduciary')}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                    Fiduciaires AI
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  Fiscalité & Simulateur Inasti / IPP
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Simulateur de revenu net d'indépendant, audit de factures avec TVA BE et calendrier fiscal.
                </p>
              </div>

              <div
                onClick={() => onSelectTab('generator')}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                    Documents
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Générateur de Contrats & Baux
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Baux conformes aux lois régionales, mises en demeure juridiques et PV d'assemblée générale SRL.
                </p>
              </div>

              <div
                onClick={() => onSelectTab('tools')}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                    Algorithmes
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  Validateur BCE & NISS Modulo 97
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Vérification en temps réel de numéros d'entreprise et de registre national selon l'algorithme officiel.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Administrative Dossiers Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Derniers Dossiers & Démarches</h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                    <HardDrive className="w-3 h-3" /> Stockage Local Autonome
                  </span>
                </div>
                <p className="text-xs text-slate-400">Historique sauvegardé directement sur votre machine</p>
              </div>
              <a
                href="/api/backup"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer flex items-center gap-1"
                title="Exporter une sauvegarde complète JSON"
              >
                <Download className="w-3 h-3" />
                <span>Sauvegarde JSON</span>
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-medium">Référence & Intitulé</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Catégorie</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dossiers.map((dossier) => (
                    <tr key={dossier.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-slate-200">{dossier.title}</div>
                        <div className="text-[10px] text-slate-400">{dossier.id}</div>
                      </td>
                      <td className="py-3 text-slate-400 hidden sm:table-cell">{dossier.category}</td>
                      <td className="py-3 text-slate-300">{dossier.date}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${dossier.statusColor}`}
                        >
                          {dossier.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onSelectTab('generator')}
                          className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                        >
                          {dossier.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Fiscal Deadlines Calendar & Official Belgian Notice */}
        <div className="space-y-6">
          {/* Calendar of Upcoming Belgian Deadlines */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Échéancier Fiscal Belge</h2>
              </div>
              <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                Calendrier SPF/ONSS
              </span>
            </div>

            <div className="space-y-3">
              {UPCOMING_FISCAL_DEADLINES.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-400">
                        {item.authority} • {item.category}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-200 mt-0.5">{item.title}</h3>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                        item.status === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.dueDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">{item.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectTab('fiduciary')}
              className="w-full mt-4 py-2 text-center text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
            >
              Consulter l'agenda fiscal complet →
            </button>
          </div>

          {/* Legal / Institutional Compliance Notice */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Garantie de Sécurité & Non-Affiliation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              AdminBelgique est une plateforme technologique privée d'aide à la gestion administrative (éditée par elikacces IT Solutions). Elle opère de manière indépendante des autorités gouvernementales belges.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400">Conformité RGPD / APD</span>
              <span className="text-slate-400">Chiffrement AES-256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
