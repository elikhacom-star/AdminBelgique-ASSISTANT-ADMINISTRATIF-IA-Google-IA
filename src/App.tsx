import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AiAssistantView } from './components/AiAssistantView';
import { DocumentGeneratorView } from './components/DocumentGeneratorView';
import { DocumentAnalyzerView } from './components/DocumentAnalyzerView';
import { ImmoBoostView } from './components/ImmoBoostView';
import { FiduciaryView } from './components/FiduciaryView';
import { JuristAssistView } from './components/JuristAssistView';
import { AnonymizerView } from './components/AnonymizerView';
import { BelgianToolsView } from './components/BelgianToolsView';
import { SettingsView } from './components/SettingsView';
import { UserManagementView } from './components/UserManagementView';
import { AndroidPreviewView } from './components/AndroidPreviewView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationTab, UserProfileType } from './types/adminbelgique';
import { Sparkles, FileText, ScanText, BotMessageSquare, X, Building, Calculator } from 'lucide-react';

const getTabFromPath = (): NavigationTab => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.toLowerCase().replace(/^\//, '');
  if (path === 'immoboostscrap' || path === 'immoboost' || path === 'immoscrap' || path === 'scrap') return 'immoboost';
  if (path === 'assistant' || path === 'ai' || path === 'chat') return 'assistant';
  if (path === 'generator' || path === 'documents' || path === 'baux') return 'generator';
  if (path === 'analyzer' || path === 'scanner' || path === 'ocr') return 'analyzer';
  if (path === 'fiduciary' || path === 'fiscalite' || path === 'tva') return 'fiduciary';
  if (path === 'jurist' || path === 'juridique') return 'jurist';
  if (path === 'anonymizer' || path === 'rgpd') return 'anonymizer';
  if (path === 'tools' || path === 'bce' || path === 'niss') return 'tools';
  if (path === 'users' || path === 'roles') return 'users';
  if (path === 'android' || path === 'apk') return 'android';
  if (path === 'settings' || path === 'parametres') return 'settings';
  return 'dashboard';
};

function AppContent() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>(getTabFromPath);
  const [userProfile, setUserProfile] = useState<UserProfileType>('independant');
  const [showNewDossierModal, setShowNewDossierModal] = useState(false);
  const { currentRole } = useAuth();

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (targetTab: NavigationTab) => {
    setCurrentTab(targetTab);
    const targetUrl = targetTab === 'immoboost' ? '/ImmoBoostScrap' : targetTab === 'dashboard' ? '/' : `/${targetTab}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ tab: targetTab }, '', targetUrl);
    }
  };

  const handleLaunchQuickAction = (targetTab: NavigationTab) => {
    handleSelectTab(targetTab);
    setShowNewDossierModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Platform Header */}
      <Header
        currentProfile={userProfile}
        onProfileChange={setUserProfile}
        onOpenNewDossier={() => setShowNewDossierModal(true)}
        onNavigateToUsers={() => handleSelectTab('users')}
        onNavigateToAndroid={() => handleSelectTab('android')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={handleSelectTab} />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView onSelectTab={handleSelectTab} userProfile={userProfile} />
            )}
            {currentTab === 'assistant' && <AiAssistantView userProfile={userProfile} />}
            {currentTab === 'generator' && <DocumentGeneratorView />}
            {currentTab === 'analyzer' && <DocumentAnalyzerView />}
            {currentTab === 'immoboost' && <ImmoBoostView />}
            {currentTab === 'fiduciary' && <FiduciaryView />}
            {currentTab === 'jurist' && <JuristAssistView />}
            {currentTab === 'anonymizer' && <AnonymizerView />}
            {currentTab === 'tools' && <BelgianToolsView />}
            {currentTab === 'users' && <UserManagementView />}
            {currentTab === 'android' && <AndroidPreviewView />}
            {currentTab === 'settings' && (
              <SettingsView currentProfile={userProfile} onProfileChange={setUserProfile} />
            )}
          </div>
        </main>
      </div>

      {/* New Dossier / Fast Action Modal */}
      {showNewDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nouvelle Démarche Administrative</h3>
                  <p className="text-xs text-slate-400">
                    Sélectionnez l'action à entreprendre avec l'IA belge
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewDossierModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleLaunchQuickAction('assistant')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-2 group-hover:bg-blue-500/20">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">Poser une question IA</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  SPF Finances, TVA, lois sociales, inscription BCE.
                </div>
              </button>

              <button
                onClick={() => handleLaunchQuickAction('generator')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-2 group-hover:bg-amber-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">Créer un Document</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Bail d'habitation, mise en demeure, indexation loyer.
                </div>
              </button>

              <button
                onClick={() => handleLaunchQuickAction('analyzer')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-2 group-hover:bg-emerald-500/20">
                  <ScanText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">Scanner un Courrier</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Avis d'imposition, sommation ONSS, recours.
                </div>
              </button>

              <button
                onClick={() => handleLaunchQuickAction('immoboost')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-2 group-hover:bg-indigo-500/20">
                  <Building className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">ImmoBoost Pro</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Recherche d'opportunités, calcul de rendement & droits.
                </div>
              </button>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400">
                Toutes les démarches sont anonymisées et cryptées par défaut.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
