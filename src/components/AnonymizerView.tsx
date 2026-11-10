import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const AnonymizerView: React.FC = () => {
  const [testText, setTestText] = useState(`Madame, Monsieur,
Voici les informations concernant mon dossier auprès du SPF Finances :
Mon numéro de registre national est le 84.05.12-321.45 et mon entreprise TECH SRL possède le numéro BCE 0842.987.654 (TVA : BE 0842.987.654).
Le solde doit être versé sur mon compte bancaire BE68 5390 0754 7034 avec la communication structurée +++084/2987/65492+++.
Mon domicile fiscal est fixé à Rue de la Loi 16, 1000 Bruxelles.`);

  const [loading, setLoading] = useState(false);
  const [anonymizedResult, setAnonymizedResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleRunAnonymizer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/anonymize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText }),
      });
      if (response.ok) {
        const data = await response.json();
        setAnonymizedResult(data);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }
    const { clientAnonymizeBelgianText } = await import('../utils/belgianAlgorithms');
    setAnonymizedResult(clientAnonymizeBelgianText(testText));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white">
                Centre de Confidentialité & Anonymisation Brevetée
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Technologie d'anonymisation multicouche brevetée d'AdminBelgique. Vos données sensibles (NISS, BCE, IBAN, adresses) sont biffées avant toute transmission à nos modèles d'IA, assurant une conformité totale avec l'APD et le RGPD.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Chiffrement AES-256 Actif
            </span>
          </div>
        </div>
      </div>

      {/* Interactive test bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw text */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Texte Brut avec Données Sensibles Belges</span>
            </h2>
            <span className="text-[10px] text-slate-400">Entrée utilisateur</span>
          </div>

          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500 leading-relaxed"
          />

          <button
            onClick={handleRunAnonymizer}
            disabled={loading || !testText.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Tester le Filtre d'Anonymisation Breveté</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Anonymized output */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Résultat Traité (Prêt pour l'IA sans fuite de données)</span>
            </h2>
            {anonymizedResult && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(anonymizedResult.anonymizedText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[200px] text-xs font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
            {anonymizedResult?.anonymizedText || (
              <span className="text-slate-400 font-sans text-xs">
                Cliquez sur le bouton pour tester le filtre et observer le masquage automatique des identifiants belges.
              </span>
            )}
          </div>

          {anonymizedResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Éléments biffés avec succès :</span>
                <span className="font-bold text-emerald-400">
                  {anonymizedResult.redactedItemsCount} détectés
                </span>
              </div>

              <div className="space-y-1">
                {anonymizedResult.redactedItems?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-900 text-slate-300"
                  >
                    <span className="font-medium text-slate-400">{item.type}</span>
                    <span className="font-mono text-emerald-400">{item.replacement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GDPR & Security Architecture Info */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">
          Architecture de Sécurité Conforme aux Exigences Belges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zéro Rétention Inutile</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Les données soumises ne sont jamais utilisées pour l'entraînement de modèles tiers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-blue-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chiffrement Bout en Bout</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Toutes les communications HTTPS utilisent TLS 1.3 avec chiffrement des disques au repos AES-256.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Hébergement Européen</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Infrastructure certifiée ISO 27001 localisée au sein de l'Union Européenne (Région Europe-West).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
