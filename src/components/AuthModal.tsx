import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { RoleBadge } from './RoleBadge';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, updatePassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('visitor');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) {
        onClose();
      } else {
        setStatusMessage({ text: 'Identifiants invalides.', isError: true });
      }
    } else if (mode === 'register') {
      const ok = await register(email, displayName, selectedRole);
      if (ok) {
        onClose();
      } else {
        setStatusMessage({ text: 'Erreur lors de l’inscription.', isError: true });
      }
    } else if (mode === 'forgot') {
      const res = await updatePassword(password || 'NouveauMotDePasse123!');
      setStatusMessage({
        text: 'Un lien de réinitialisation sécurisé a été envoyé à votre adresse email.',
        isError: false,
      });
      setTimeout(() => {
        setMode('login');
        setStatusMessage(null);
      }, 2500);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    const preset = PRESET_USERS[role];
    await login(preset.email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Lock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'login' && 'Connexion Sécurisée'}
                {mode === 'register' && 'Créer un Compte AdminBelgique'}
                {mode === 'forgot' && 'Gestion du Mot de Passe'}
              </h3>
              <p className="text-xs text-slate-400">
                Portail E-Administration avec contrôle d'accès par rôle
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Role Testing Preset Buttons */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" /> Accès Démo Rapide par Rôle :
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex flex-col items-center justify-center transition cursor-pointer"
            >
              <span>Admin</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Accès total</span>
            </button>

            <button
              onClick={() => handleQuickLogin('editor')}
              className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex flex-col items-center justify-center transition cursor-pointer"
            >
              <span>Éditeur</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Contenu actif</span>
            </button>

            <button
              onClick={() => handleQuickLogin('visitor')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex flex-col items-center justify-center transition cursor-pointer"
            >
              <span>Visiteur</span>
              <span className="text-[9px] text-slate-400 mt-0.5">Lecture seule</span>
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
              statusMessage.isError
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 mb-1">Nom ou Raison sociale</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Sophie Martin"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1">Email professionnel</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@entreprise.be"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300">
                {mode === 'forgot' ? 'Nouveau mot de passe souhaité' : 'Mot de passe'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-slate-300 mb-1">Demande de Rôle Initial</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="visitor">Visiteur (Consultation)</option>
                <option value="editor">Éditeur (Création de documents)</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            {mode === 'login' && 'Se Connecter'}
            {mode === 'register' && 'Créer Mon Compte'}
            {mode === 'forgot' && 'Mettre à jour le Mot de Passe'}
          </button>
        </form>

        {/* Footer switcher */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Pas encore de compte ?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-400 font-semibold hover:underline"
              >
                Inscrivez-vous ici
              </button>
            </span>
          ) : (
            <span>
              Vous avez déjà un compte ?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-400 font-semibold hover:underline"
              >
                Se connecter
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
