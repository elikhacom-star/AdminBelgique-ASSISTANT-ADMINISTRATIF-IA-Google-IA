import React, { useState } from 'react';
import { ShieldCheck, Building2, Bell, User, CheckCircle2, Lock, Sparkles, ChevronDown, Download, KeyRound, Smartphone } from 'lucide-react';
import { UserProfileType } from '../types/adminbelgique';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './RoleBadge';
import { AuthModal } from './AuthModal';
import { UserRole } from '../types/auth';

interface HeaderProps {
  currentProfile: UserProfileType;
  onProfileChange: (profile: UserProfileType) => void;
  onOpenNewDossier: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToAndroid?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onProfileChange,
  onOpenNewDossier,
  onNavigateToUsers,
  onNavigateToAndroid,
}) => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white">
      {/* Top micro-banner indicating official non-governmental disclaimer compliant with Belgian regulations */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Service Privé Indépendant
          </span>
          <span className="hidden md:inline text-slate-400">
            AdminBelgique.com • Solution d'assistance administrative & IA privée (non affiliée au SPF/État belge)
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <Lock className="w-3 h-3" /> Chiffrement AES-256 & Anonymisation RGPD Active
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">Belgique (FR / NL)</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 border border-blue-400/30">
            {/* Belgian tricolor micro-tag on logo */}
            <div className="absolute -top-1 -right-1 flex h-2 w-3 rounded-xs overflow-hidden border border-black/40">
              <span className="w-1/3 bg-black"></span>
              <span className="w-1/3 bg-amber-400"></span>
              <span className="w-1/3 bg-red-600"></span>
            </div>
            <Building2 className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">
                Admin<span className="text-blue-400">Belgique</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded">
                v3.4 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Portail E-Administration & Assistant IA
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Workspace Switcher */}
          <div className="hidden lg:flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => onProfileChange('independant')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentProfile === 'independant'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Indépendant / PME
            </button>
            <button
              onClick={() => onProfileChange('fiduciaire')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentProfile === 'fiduciaire'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Fiduciaire & Cabinet
            </button>
            <button
              onClick={() => onProfileChange('particulier')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentProfile === 'particulier'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Citoyen / Particulier
            </button>
          </div>

          {/* PWA Standalone Install Button */}
          <PWAInstallButton />

          {/* Android Button */}
          {onNavigateToAndroid && (
            <button
              onClick={onNavigateToAndroid}
              className="hidden md:flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Voir la version Android & Télécharger le projet"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Version Android</span>
            </button>
          )}

          {/* Download ZIP Button */}
          <a
            href="/api/download-zip"
            download="adminbelgique-platform.zip"
            className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            title="Télécharger l'intégralité du code source sous archive .zip"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Télécharger (.ZIP)</span>
          </a>

          {/* New Dossier Button */}
          <button
            onClick={onOpenNewDossier}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Nouvelle Démarche</span>
          </button>

          {/* Role Quick Switcher Demo Pills */}
          <div className="hidden 2xl:flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-[11px]">
            <span className="text-slate-400 px-2 text-[10px] uppercase font-semibold">Simuler Rôle :</span>
            {(['admin', 'editor', 'visitor'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                  currentRole === r
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {r === 'admin' ? 'Admin' : r === 'editor' ? 'Éditeur' : 'Visiteur'}
              </button>
            ))}
          </div>

          {/* User Account & Role Badge Button */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 hover:bg-slate-800/80 p-1.5 rounded-xl transition cursor-pointer text-left"
              title="Gérer le compte ou changer de rôle"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'AB'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="truncate max-w-[130px]">{currentUser?.displayName || 'Invité'}</span>
                </div>
                <div className="mt-0.5">
                  <RoleBadge role={currentRole} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};
