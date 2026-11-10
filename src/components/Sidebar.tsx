import React from 'react';
import {
  LayoutDashboard,
  BotMessageSquare,
  FileText,
  ScanText,
  Building,
  Calculator,
  Scale,
  ShieldCheck,
  Wrench,
  Settings,
  Sparkles,
  ExternalLink,
  Users,
  Smartphone,
} from 'lucide-react';
import { NavigationTab } from '../types/adminbelgique';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    category?: string;
  }> = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'assistant', label: 'Assistant IA Belge', icon: BotMessageSquare, badge: 'Gemini 3.8' },
    { id: 'generator', label: 'Générateur Documents', icon: FileText, badge: 'Modèles' },
    { id: 'analyzer', label: 'Scanner & Analyseur', icon: ScanText, badge: 'OCR/Comm.' },
    { id: 'immoboost', label: 'ImmoBoostScrap', icon: Building, badge: 'ImmoScrap' },
    { id: 'fiduciary', label: 'Fiduciaires & Fiscalité', icon: Calculator, badge: 'TVA/Inasti' },
    { id: 'jurist', label: 'JuristAssist Belge', icon: Scale },
    { id: 'anonymizer', label: 'Centre RGPD & Anonymat', icon: ShieldCheck, badge: 'Brevet' },
    { id: 'tools', label: 'Validateurs BCE & NISS', icon: Wrench },
    { id: 'users', label: 'Utilisateurs & Rôles', icon: Users, badge: 'RBAC' },
    { id: 'android', label: 'Version Android & APK', icon: Smartphone, badge: 'Natif/PWA' },
    { id: 'settings', label: 'Paramètres & Abonnements', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Plateforme AdminBelgique
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Official Belgian administrative shortcuts footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Portails Officiels Liés
        </div>
        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
          <a
            href="https://finances.belgium.be/fr/E-services/MyMinfin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <span>MyMinfin</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          <a
            href="https://kbopub.economie.fgov.be"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <span>BCE Public</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          <a
            href="https://statbel.fgov.be"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <span>Statbel Santé</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          <a
            href="https://www.socialsecurity.be"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <span>Sécurité Sociale</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Session Sécurisée</span>
          <span className="text-emerald-400 font-semibold">100% Chiffrée</span>
        </div>
      </div>
    </aside>
  );
};
