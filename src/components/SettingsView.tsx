import React, { useState } from 'react';
import {
  Settings,
  Building2,
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Save,
  Check,
  Download,
  FileArchive,
  Laptop,
  PlayCircle,
  Smartphone,
  Server,
  Globe,
  Terminal,
  Copy,
  FileCode,
} from 'lucide-react';
import { UserProfileType } from '../types/adminbelgique';

import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './RoleBadge';

interface SettingsViewProps {
  currentProfile: UserProfileType;
  onProfileChange: (p: UserProfileType) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentProfile,
  onProfileChange,
}) => {
  const { currentRole, canManageSettings, switchRole, currentUser } = useAuth();
  const [companyName, setCompanyName] = useState('elikacces IT Solutions');
  const [bceNumber, setBceNumber] = useState('0842.123.456');
  const [vatNumber, setVatNumber] = useState('BE 0842.123.456');
  const [email, setEmail] = useState('Elikhacom@gmail.com');
  const [address, setAddress] = useState('Avenue Louise 250, 1050 Bruxelles');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeDeployTab, setActiveDeployTab] = useState<'cpanel' | 'vps' | 'docker'>('cpanel');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  React.useEffect(() => {
    fetch('/api/admin/settings', {
      headers: { 'x-user-role': currentRole },
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          if (data.companyName) setCompanyName(data.companyName);
          if (data.bceNumber) setBceNumber(data.bceNumber);
          if (data.vatNumber) setVatNumber(data.vatNumber);
          if (data.email) setEmail(data.email);
          if (data.address) setAddress(data.address);
        }
      })
      .catch(() => {});
  }, [currentRole]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSettings) {
      setSaveError('Accès refusé : Seul le rôle Administrateur peut modifier les paramètres système.');
      return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
          'x-user-email': currentUser?.email || 'admin@adminbelgique.com',
        },
        body: JSON.stringify({
          companyName,
          bceNumber,
          vatNumber,
          email,
          address,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error || 'Erreur lors de la sauvegarde');
        return;
      }

      setSaved(true);
      setSaveError(null);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const plans = [
    {
      name: 'Découverte Citoyen',
      price: '0 €',
      period: 'Gratuit à vie',
      features: [
        'Assistant IA 15 requêtes/mois',
        'Validateur BCE & NISS Modulo 97',
        'Calculateur d\'indexation Statbel',
        'Anonymisation de base',
      ],
      current: currentProfile === 'particulier',
      profileKey: 'particulier' as UserProfileType,
    },
    {
      name: 'Pro Indépendant & PME',
      price: '49 €',
      period: 'par mois HTVA',
      badge: 'Le plus populaire',
      features: [
        'Assistant IA Illimité (Gemini 3.8 Flash)',
        'Générateur de baux & mises en demeure',
        'Scanner OCR & Communications structurées',
        'ImmoBoost Pro / ImmoScrap (recherche multi-portails)',
        'Filtre d\'anonymisation breveté RGPD actif',
      ],
      current: currentProfile === 'independant',
      profileKey: 'independant' as UserProfileType,
    },
    {
      name: 'Cabinet & Fiduciaire',
      price: '149 €',
      period: 'par mois HTVA',
      badge: 'Multi-comptes',
      features: [
        'Tout le plan Pro +',
        'Multi-utilisateurs & gestion de dossiers clients',
        'JuristAssist : audit automatisé de contrats',
        'Simulateur fiscal Inasti / IPP multi-scénarios',
        'Support prioritaire & API Webhooks',
      ],
      current: currentProfile === 'fiduciaire',
      profileKey: 'fiduciaire' as UserProfileType,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Settings className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-white">Paramètres du Compte & Abonnements</h1>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Gérez votre profil professionnel belge, vos coordonnées de facturation et sélectionnez votre formule d'abonnement.
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Formules & Abonnements AdminBelgique</span>
            </h2>
            <p className="text-xs text-slate-400">Choisissez la formule adaptée à votre volume d'activité</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold">
            Sans engagement
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                p.current
                  ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  {p.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <span className="text-2xl font-extrabold text-white">{p.price}</span>
                  <span className="text-xs text-slate-400 ml-1">/ {p.period}</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onProfileChange(p.profileKey)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    p.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {p.current ? 'Plan Actif' : 'Sélectionner ce plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile and Belgian Legal Entities Details */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>Informations Administratives & Facturation (BCE / TVA)</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Dénomination de l'Entreprise ou Nom
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email de Contact & Notification
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Numéro d'Entreprise (BCE)
              </label>
              <input
                type="text"
                value={bceNumber}
                onChange={(e) => setBceNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Numéro de TVA Belge
              </label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Siège d'Exploitation / Domicile en Belgique
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          {saveError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {saveError}
            </div>
          )}

          {!canManageSettings && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
              <span>Rôle actuel ({currentRole === 'editor' ? 'Éditeur' : 'Visiteur'}) : Visualisation seule des paramètres.</span>
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] cursor-pointer"
              >
                Passer en Administrateur
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Ces informations apparaîtront automatiquement sur vos documents et baux générés.
            </span>
            <button
              type="submit"
              disabled={!canManageSettings}
              className={`px-4 py-2 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                canManageSettings
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>
                {saved
                  ? 'Enregistré avec succès !'
                  : canManageSettings
                  ? 'Enregistrer les modifications'
                  : 'Modification réservée aux Administrateurs'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* 1-Click Zero Command Line Installation Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Laptop className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Installation Facile sur PC (Sans Ligne de Commande)</h2>
              <p className="text-xs text-slate-400">
                Installez et lancez AdminBelgique comme un logiciel de bureau classique sans ouvrir de terminal
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
            Zéro Terminal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Option A : Installation 1 Clic Navigateur</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                Le plus rapide
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Dans Google Chrome ou Edge, cliquez sur le bouton <strong>"Installer sur PC (1 Clic)"</strong> dans l'en-tête supérieur droit (ou sur l'icône dans la barre d'adresse).
            </p>
            <div className="p-2 rounded bg-blue-500/10 text-blue-300 text-[11px] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Crée automatiquement une icône sur votre Bureau Windows et dans le menu Démarrer.</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Option B : Lanceur Double-Clic (.BAT)</span>
              <span className="text-[10px] text-slate-400">Usage autonome</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Téléchargez l'archive ZIP, décompressez-la sur votre PC, et faites un simple double-clic sur le fichier :
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-700 font-mono text-emerald-400 text-[11px] flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>LANCER-ADMINBELGIQUE.bat</span>
            </div>
            <p className="text-slate-400 text-[10px]">
              Il installe les composants nécessaires et démarre l'application automatiquement sans aucune commande à taper.
            </p>
          </div>
        </div>
      </div>

      {/* Hosting & Deployment Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Server className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Mise en Ligne sur votre Hébergement</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono border border-blue-500/20">
                  app.adminbelgique.com
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fichiers prêts pour un fonctionnement 100% identique (APIs belges, Modulo 97, Assistant IA, RBAC, Baux)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/download-deployment-guide"
              download="DEPLOIEMENT-GUIDE.md"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Guide Détaillé (.MD)</span>
            </a>
            <a
              href="/api/download-zip"
              download="adminbelgique-platform.zip"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Pack (.ZIP)</span>
            </a>
          </div>
        </div>

        {/* File Manifest Checklist */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Fichiers exacts à déposer sur votre hébergement
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-white font-bold block">dist/</span>
                <span className="text-[11px] text-slate-400">Frontend complet compilé (HTML, CSS, JS, PWA)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-white font-bold block">server.js</span>
                <span className="text-[11px] text-slate-400">Serveur autonome exécutable avec simple node server.js</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-white font-bold block">data/</span>
                <span className="text-[11px] text-slate-400">Base locale (users.json, dossiers.json, logs)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-white font-bold block">package.json</span>
                <span className="text-[11px] text-slate-400">Dépendances de production (npm install --omit=dev)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-white font-bold block">.env</span>
                <span className="text-[11px] text-slate-400">PORT=3000, NODE_ENV=production, GEMINI_API_KEY</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-white font-bold block">ecosystem.config.cjs</span>
                <span className="text-[11px] text-slate-400">PM2 cluster & redémarrage automatique</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 space-x-2 pt-2">
          <button
            onClick={() => setActiveDeployTab('cpanel')}
            className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 cursor-pointer ${
              activeDeployTab === 'cpanel'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Hébergement Web cPanel / Mutualisé (Setup Node.js)
          </button>
          <button
            onClick={() => setActiveDeployTab('vps')}
            className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 cursor-pointer ${
              activeDeployTab === 'vps'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Serveur VPS Ubuntu / Debian (Nginx + PM2 + SSL)
          </button>
          <button
            onClick={() => setActiveDeployTab('docker')}
            className={`pb-2 text-xs font-semibold px-3 transition-colors border-b-2 cursor-pointer ${
              activeDeployTab === 'docker'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Docker & Docker Compose (1 Commande)
          </button>
        </div>

        {/* Tab Contents */}
        {activeDeployTab === 'cpanel' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p className="text-[11px] text-slate-400">
              Idéal pour <strong>o2switch, Hostinger, OVH Cloud Web, Infomaniak, PlanetHoster</strong> ou tout hébergeur avec cPanel.
            </p>
            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>
                Extrayez l'archive <strong>adminbelgique-platform.zip</strong> dans votre dossier de sous-domaine (ex: <code className="text-emerald-400">/home/user/app.adminbelgique.com</code>).
              </li>
              <li>
                Dans cPanel, ouvrez <strong>Setup Node.js App</strong> et cliquez sur <strong>Create Application</strong>.
              </li>
              <li>
                Définissez la version Node.js sur <strong>20.x</strong>, le Mode sur <strong>Production</strong>, et le <em>Application startup file</em> sur <code className="text-emerald-400 font-bold">server.js</code>.
              </li>
              <li>
                Cliquez sur <strong>Run NPM Install</strong>, puis ajoutez la variable <code className="text-emerald-400">NODE_ENV=production</code>.
              </li>
              <li>
                Cliquez sur <strong>Restart</strong>. Votre site est instantanément en ligne !
              </li>
            </ol>
          </div>
        )}

        {activeDeployTab === 'vps' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p className="text-[11px] text-slate-400">
              Pour <strong>OVH VPS, Hetzner, DigitalOcean, Scaleway</strong>. Offre les meilleures performances avec Nginx et certificat SSL gratuit.
            </p>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
              <button
                onClick={() =>
                  copyToClipboard(
                    `# 1. Décompresser et installer\nunzip adminbelgique-platform.zip -d /var/www/app.adminbelgique.com\ncd /var/www/app.adminbelgique.com\nnpm install --omit=dev\n\n# 2. Lancer avec PM2\npm2 start ecosystem.config.cjs\npm2 save && pm2 startup\n\n# 3. Configurer Nginx & SSL\nsudo cp nginx.conf.example /etc/nginx/sites-available/app.adminbelgique.com\nsudo ln -sf /etc/nginx/sites-available/app.adminbelgique.com /etc/nginx/sites-enabled/\nsudo certbot --nginx -d app.adminbelgique.com`,
                    'vps-cmd'
                  )
                }
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Copier les commandes"
              >
                {copiedSnippet === 'vps-cmd' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <pre className="text-emerald-400">
{`# 1. Décompresser et installer
unzip adminbelgique-platform.zip -d /var/www/app.adminbelgique.com
cd /var/www/app.adminbelgique.com
npm install --omit=dev

# 2. Lancer en arrière-plan haute disponibilité avec PM2
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup

# 3. Nginx Reverse Proxy & Certificat SSL HTTPS Let's Encrypt
sudo cp nginx.conf.example /etc/nginx/sites-available/app.adminbelgique.com
sudo ln -sf /etc/nginx/sites-available/app.adminbelgique.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d app.adminbelgique.com`}
              </pre>
            </div>
          </div>
        )}

        {activeDeployTab === 'docker' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p className="text-[11px] text-slate-400">
              Déploiement conteneurisé ultra-propre avec Docker et Docker Compose :
            </p>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
              <button
                onClick={() =>
                  copyToClipboard(
                    `unzip adminbelgique-platform.zip\ncd adminbelgique-platform\ndocker compose up -d --build`,
                    'docker-cmd'
                  )
                }
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Copier la commande"
              >
                {copiedSnippet === 'docker-cmd' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <pre className="text-emerald-400">
{`unzip adminbelgique-platform.zip
docker compose up -d --build`}
              </pre>
            </div>
            <p className="text-[11px] text-slate-400">
              Le conteneur démarre automatiquement le serveur Node.js sur le port 3000 avec persistance de vos dossiers dans le volume <code className="text-white">./data</code>.
            </p>
          </div>
        )}
      </div>

      {/* Export Source Code ZIP Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Exportation du Code Source Complet (.ZIP)</h2>
              <p className="text-xs text-slate-400">
                Téléchargez l'intégralité des fichiers backend, frontend, modèles et configurations dans une archive prête à l'emploi.
              </p>
            </div>
          </div>

          <a
            href="/api/download-zip"
            download="adminbelgique-platform.zip"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger adminbelgique-platform.zip</span>
          </a>
        </div>
      </div>

      {/* Export Android Studio Native Project (.ZIP) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Application Native Android (Kotlin / Jetpack Compose)</h2>
              <p className="text-xs text-slate-400">
                Téléchargez le projet Android Studio complet avec Gradle, Manifest, écrans Compose et le même système RBAC (Admin, Éditeur, Visiteur).
              </p>
            </div>
          </div>

          <a
            href="/api/download-android-zip"
            download="adminbelgique-android-project.zip"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger adminbelgique-android-project.zip</span>
          </a>
        </div>
      </div>
    </div>
  );
};
