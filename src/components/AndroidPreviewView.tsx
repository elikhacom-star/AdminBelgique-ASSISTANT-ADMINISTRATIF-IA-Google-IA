import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Shield,
  FileText,
  Settings,
  Users,
  Home,
  Wifi,
  Battery,
  Signal,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lock,
  UserCheck,
  UserX,
  Trash2,
  PlayCircle,
  FileCode,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ROLE_DEFINITIONS } from '../types/auth';
import { RoleBadge } from './RoleBadge';

export const AndroidPreviewView: React.FC = () => {
  const { currentRole, switchRole, canManageUsers, canCreateContent, canManageSettings } = useAuth();
  const [mobileTab, setMobileTab] = useState<'home' | 'rbac' | 'docs' | 'settings'>('home');
  const [visitorError, setVisitorError] = useState<string | null>(null);

  // Simulated mobile mock state
  const [mobileUsers, setMobileUsers] = useState([
    { uid: 'admin-001', name: 'Marc Vandewalle', email: 'admin@adminbelgique.com', role: 'admin' as UserRole, status: 'active' },
    { uid: 'editor-002', name: 'Sophie De Smet', email: 'redaction@adminbelgique.com', role: 'editor' as UserRole, status: 'active' },
    { uid: 'visitor-003', name: 'Lucas Peeters', email: 'visiteur.demo@gmail.com', role: 'visitor' as UserRole, status: 'active' },
  ]);

  const [docGenerated, setDocGenerated] = useState(false);

  const handleMobileGenerate = () => {
    if (!canCreateContent) {
      setVisitorError("Accès refusé sur Android : Le rôle Visiteur ne peut pas générer de document officiel. Basculez en Éditeur ou Administrateur.");
      return;
    }
    setVisitorError(null);
    setDocGenerated(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white">
                Version Android Native (Kotlin / Jetpack Compose & PWA)
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Application mobile complète avec système de rôles et permissions (RBAC) conforme aux normes Material 3 d'Android 15.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/download-android-zip"
              download="adminbelgique-android-project.zip"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger Projet Android Studio (.ZIP)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Mobile Phone Emulator + Architecture & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Android Device Shell */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-xs font-semibold text-slate-400">
              Simulateur Interactif Android 15 (Pixel 9 Pro)
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="relative w-[360px] h-[720px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-800 ring-1 ring-slate-700/50 flex flex-col justify-between">
            {/* Phone Top Notch / Speaker & Camera */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full flex items-center justify-center z-30">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800"></div>
            </div>

            {/* Inner Screen */}
            <div className="w-full h-full bg-slate-900 rounded-[34px] overflow-hidden flex flex-col text-white font-sans text-xs relative select-none">
              {/* Android Status Bar */}
              <div className="pt-2 px-5 pb-1 flex justify-between items-center text-[11px] text-slate-300 bg-slate-950/80 z-20">
                <span className="font-semibold">09:41</span>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3 text-slate-300" />
                  <span className="text-[10px] font-bold">5G</span>
                  <Wifi className="w-3 h-3 text-slate-300" />
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Android Top App Bar */}
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="font-bold text-sm tracking-tight text-white">AdminBelgique</span>
                </div>
                <RoleBadge role={currentRole} />
              </div>

              {/* Mobile Screen Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[11px]">
                {/* TAB 1: HOME */}
                {mobileTab === 'home' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/60 to-slate-800 border border-blue-500/20">
                      <div className="text-[10px] uppercase font-bold text-blue-400">Application Android Native</div>
                      <div className="text-sm font-bold text-white mt-0.5">E-Administration Belge</div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        Session active : <strong className="text-white">{ROLE_DEFINITIONS[currentRole].label}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <div className="text-slate-400 text-[10px]">Dossiers Belges</div>
                        <div className="text-base font-bold text-white mt-0.5">24 Actifs</div>
                        <div className="text-[9px] text-emerald-400 font-semibold">100% Conformes</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <div className="text-slate-400 text-[10px]">Échéance Fiscale</div>
                        <div className="text-base font-bold text-amber-400 mt-0.5">20 Déc.</div>
                        <div className="text-[9px] text-slate-400">TVA / ISOC SPF</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                      <div className="font-bold text-white text-xs">Test Rapide des Permissions</div>
                      <div className="text-[10px] text-slate-400">
                        Cliquez ci-dessous pour voir l'interface Android s'adapter en direct :
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => switchRole('admin')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            currentRole === 'admin' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          Admin
                        </button>
                        <button
                          onClick={() => switchRole('editor')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            currentRole === 'editor' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          Éditeur
                        </button>
                        <button
                          onClick={() => switchRole('visitor')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            currentRole === 'visitor' ? 'bg-slate-600 text-white' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          Visiteur
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: RBAC & USERS */}
                {mobileTab === 'rbac' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Gestion RBAC Android</span>
                      <RoleBadge role={currentRole} />
                    </div>

                    {!canManageUsers && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 space-y-1">
                        <div className="font-bold">Mode Consultation (Restreint)</div>
                        <p>Seul le rôle Administrateur peut modifier les rôles ou suspendre des comptes.</p>
                        <button
                          onClick={() => switchRole('admin')}
                          className="mt-1 px-2 py-1 bg-amber-600 text-white rounded text-[9px] font-bold cursor-pointer"
                        >
                          Débloquer en Admin
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      {mobileUsers.map((u) => (
                        <div key={u.uid} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-[11px]">{u.name}</div>
                            <div className="text-[9px] text-slate-400">{u.email}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <RoleBadge role={u.role} />
                            {canManageUsers && (
                              <button
                                onClick={() => {
                                  const next: UserRole = u.role === 'admin' ? 'editor' : u.role === 'editor' ? 'visitor' : 'admin';
                                  setMobileUsers((prev) =>
                                    prev.map((item) => (item.uid === u.uid ? { ...item, role: next } : item))
                                  );
                                }}
                                className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[9px] cursor-pointer"
                                title="Changer de rôle"
                              >
                                ⇄
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: DOCUMENTS */}
                {mobileTab === 'docs' && (
                  <div className="space-y-3">
                    <div className="font-bold text-xs text-white">Générateur Juridique Mobile</div>

                    {visitorError && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 space-y-1">
                        <div>{visitorError}</div>
                        <button
                          onClick={() => {
                            switchRole('editor');
                            setVisitorError(null);
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[9px] font-bold cursor-pointer"
                        >
                          Passer en Éditeur
                        </button>
                      </div>
                    )}

                    {!canCreateContent && !visitorError && (
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-slate-400">
                        Rôle Visiteur : Vous visualisez les modèles. L'action de génération requiert le rôle Éditeur/Admin.
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] space-y-1">
                        <span className="text-slate-400">Modèle sélectionné</span>
                        <div className="font-bold text-white text-[11px]">Mise en Demeure de Paiement (Livre XIX CDE)</div>
                        <div className="text-[9px] text-slate-400">Montant principal : 1.500,00 € • Délai 14j</div>
                      </div>

                      <button
                        onClick={handleMobileGenerate}
                        className={`w-full py-2.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                          canCreateContent
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                            : 'bg-slate-800 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {canCreateContent ? 'Générer sur Android' : 'Générer (Requiert rôle Éditeur/Admin)'}
                      </button>

                      {docGenerated && (
                        <div className="p-2.5 rounded-xl bg-white text-slate-900 text-[9px] font-mono leading-relaxed shadow space-y-1">
                          <div className="font-bold text-[10px] text-slate-900 border-b pb-1">
                            MISE EN DEMEURE OFFICIELLE (Droit Belge)
                          </div>
                          <div>Réf : FACT-2026-089 • Délai 14 jours</div>
                          <div>Montant : 1.500,00 € + 40,00 € indemnité forfaitaire</div>
                          <div className="text-[8px] text-emerald-700 font-bold pt-1">
                            ✓ Document certifié généré avec succès
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: SETTINGS */}
                {mobileTab === 'settings' && (
                  <div className="space-y-3">
                    <div className="font-bold text-xs text-white">Paramètres Société (BCE / TVA)</div>

                    {!canManageSettings && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 space-y-1">
                        <div className="font-bold">Modification Restreinte</div>
                        <p>Seul l'Administrateur peut modifier le numéro BCE ou le siège de l'entreprise.</p>
                        <button
                          onClick={() => switchRole('admin')}
                          className="mt-1 px-2 py-1 bg-amber-600 text-white rounded text-[9px] font-bold cursor-pointer"
                        >
                          Passer en Administrateur
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 text-[10px]">
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                        <div className="text-slate-400">Dénomination</div>
                        <div className="font-bold text-white">elikacces IT Solutions SPRL</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                        <div className="text-slate-400">Numéro BCE</div>
                        <div className="font-mono font-bold text-white">0842.123.456</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                        <div className="text-slate-400">TVA Belge</div>
                        <div className="font-mono font-bold text-white">BE 0842.123.456</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Android Bottom Navigation Bar (Material 3) */}
              <div className="p-1.5 bg-slate-950 border-t border-slate-800 flex justify-around items-center text-[10px] z-10">
                <button
                  onClick={() => setMobileTab('home')}
                  className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                    mobileTab === 'home' ? 'text-blue-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <Home className="w-4 h-4 mb-0.5" />
                  <span>Accueil</span>
                </button>
                <button
                  onClick={() => setMobileTab('rbac')}
                  className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                    mobileTab === 'rbac' ? 'text-blue-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <Users className="w-4 h-4 mb-0.5" />
                  <span>RBAC</span>
                </button>
                <button
                  onClick={() => setMobileTab('docs')}
                  className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                    mobileTab === 'docs' ? 'text-blue-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <FileText className="w-4 h-4 mb-0.5" />
                  <span>Docs</span>
                </button>
                <button
                  onClick={() => setMobileTab('settings')}
                  className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                    mobileTab === 'settings' ? 'text-blue-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <Settings className="w-4 h-4 mb-0.5" />
                  <span>Réglages</span>
                </button>
              </div>

              {/* Android System Navigation Gesture Bar */}
              <div className="pb-2 pt-1 bg-slate-950 flex justify-center">
                <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Android Guide, Architecture & Download Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Native Android Architecture Details */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-400" />
              <span>Architecture Kotlin & Jetpack Compose Incluse</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Le projet Android inclus dans l'archive utilise l'architecture moderne recommandée par Google :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Modèle de Rôles Kotlin</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  <code>UserRole.kt</code> avec les enums <code>ADMIN</code>, <code>EDITOR</code>, <code>VISITOR</code> et matrice de permissions stricte.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Jetpack Compose & Material 3</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Écrans natifs réactifs : <code>UserManagementScreen</code>, <code>DocumentGeneratorScreen</code>, <code>DashboardScreen</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Client Retrofit Sécurisé</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Injecte automatiquement l'en-tête <code>x-user-role</code> et synchronise les journaux d'audit et utilisateurs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>Firebase Android SDK</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Compatible Firebase Auth et Firestore Rules vérifiées pour les 3 rôles.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: 2 Options to Run & Install on Android */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-emerald-400" />
              <span>Comment Installer et Exécuter sur Android</span>
            </h2>

            <div className="space-y-4">
              {/* Option A: PWA 1-Click install on Android Phone */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Option 1 : Installation WebAPK Immédiate (1 Clic sur Smartphone)
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded">
                    Recommandé • Zéro Outil
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sur n'importe quel smartphone Android (Samsung, Xiaomi, Pixel), ouvrez l'adresse dans Chrome :
                </p>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-blue-400">
                  https://app.adminbelgique.com
                </div>
                <p className="text-[11px] text-slate-400">
                  Cliquez sur <strong>"Installer l'application"</strong> ou dans le menu Chrome → <strong>"Ajouter à l'écran d'accueil"</strong>. <em>Google Play Services sur votre téléphone crée et signe automatiquement un paquet APK natif (WebAPK)</em>, avec son icône d'application, ses notifications et son exécution autonome.
                </p>
              </div>

              {/* Option B: Direct Cloud APK Generator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Option 2 : Générer l'APK Directement en Ligne (PWABuilder)
                  </span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 font-bold px-2 py-0.5 rounded">
                    Fichier .APK Prêt
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Vous souhaitez obtenir un fichier <code>.apk</code> téléchargeable sans installer Android Studio ? Utilisez le générateur cloud officiel (développé par Microsoft et Google) :
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                  <li>Rendez-vous sur <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-semibold">PWABuilder.com</a>.</li>
                  <li>Collez l'URL de votre application : <code>https://app.adminbelgique.com</code>.</li>
                  <li>Cliquez sur <strong>"Package for Android"</strong> puis <strong>"Generate APK"</strong>.</li>
                  <li>Téléchargez immédiatement votre fichier <strong>.apk</strong> signé et prêt à être installé.</li>
                </ol>
              </div>

              {/* Option C: Native APK / Android Studio Build */}
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Option 3 : Compiler l'APK Natif dans Android Studio (Kotlin)
                  </span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 font-bold px-2 py-0.5 rounded">
                    Code Source Complet
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 leading-relaxed">
                  <li>Téléchargez l'archive <strong>adminbelgique-android-project.zip</strong> ci-dessous.</li>
                  <li>Décompressez le dossier sur votre ordinateur.</li>
                  <li>Ouvrez <strong>Android Studio</strong> et choisissez <strong>Open</strong> sur le dossier décompressé.</li>
                  <li>Dans le menu supérieur : <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
                  <li>L'APK <code>app-debug.apk</code> est généré dans <code>app/build/outputs/apk/debug/</code>.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Card 3: Download Buttons */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">Télécharger le Package Android Complet</div>
              <div className="text-xs text-slate-400">Tous les fichiers Kotlin, Gradle, Manifeste, écrans Compose et documentation</div>
            </div>

            <div className="flex gap-2">
              <a
                href="/api/download-android-zip"
                download="adminbelgique-android-project.zip"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>adminbelgique-android-project.zip</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
