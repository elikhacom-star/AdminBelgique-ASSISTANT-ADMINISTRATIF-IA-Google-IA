import React, { useState } from 'react';
import {
  ScanText,
  Upload,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_ADMINISTRATIVE_DOCUMENTS } from '../data/belgianData';
import { DocumentAnalysisResult } from '../types/adminbelgique';

export const DocumentAnalyzerView: React.FC = () => {
  const [inputText, setInputText] = useState(SAMPLE_ADMINISTRATIVE_DOCUMENTS[0].text);
  const [filename, setFilename] = useState('Extrait_Role_SPF_Finances.pdf');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: inputText,
          filename,
        }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to analyze:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_ADMINISTRATIVE_DOCUMENTS[0]) => {
    setInputText(sample.text);
    setFilename(sample.name);
    setAnalysis(null);
  };

  const handleCopyDraft = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.recommendedReplyDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <ScanText className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white">
                Scanner & Analyseur de Courriers Administratifs Belges
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Déposez vos courriers SPF Finances, ONSS, CPAS, ou convocations officielles. L'IA extrait automatiquement la communication structurée, les montants, les échéances et génère le plan d'action légal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Anonymisation NISS Active
            </span>
          </div>
        </div>

        {/* Sample document quick loaders */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Charger un modèle d'exemple :</span>
          {SAMPLE_ADMINISTRATIVE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => loadSample(sample)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input / Paste zone */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Texte du Courrier ou Extrait</h2>
            <span className="text-xs text-slate-400">{filename}</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={15}
            placeholder="Collez ici le texte d'un courrier administratif belge reçu, ou saisissez les informations..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading || !inputText.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyse approfondie du courrier en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Lancer l'Analyse Administrative & OCR</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Analysis results */}
        <div className="lg:col-span-7 space-y-4">
          {analysis ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              {/* Header result */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400">
                    {analysis.authority}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{analysis.documentType}</h3>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    analysis.urgency === 'critique'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : analysis.urgency === 'haute'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}
                >
                  Urgence : {analysis.urgency.toUpperCase()}
                </div>
              </div>

              {/* Key Indicators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Montant Identifié</span>
                  <div className="text-xl font-bold text-white mt-1">{analysis.detectedAmount}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Délai d'Action / Échéance</span>
                  <div className="text-xs font-semibold text-amber-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{analysis.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Structured communication box */}
              {analysis.structuredCommunication && (
                <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Communication Structurée Officielle
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Algorithme Modulo 97 Valide
                    </span>
                  </div>
                  <div className="text-lg font-mono font-bold text-blue-400 tracking-wider">
                    {analysis.structuredCommunication.raw}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {analysis.structuredCommunication.notice}
                  </p>
                </div>
              )}

              {/* Action plan */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Plan d'Action Recommandé (Ordre de priorité)
                </h4>
                <div className="space-y-2">
                  {analysis.actionPlan.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-start space-x-3 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Reply Draft */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Brouillon de Réponse Officielle Prêt à l'Envoi
                  </h4>
                  <button
                    onClick={handleCopyDraft}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDraft ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {analysis.recommendedReplyDraft}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 space-y-3">
              <ScanText className="w-12 h-12 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-300">En attente d'analyse</h3>
              <p className="text-xs max-w-sm">
                Sélectionnez un exemple ou collez un texte de document administratif à gauche pour déclencher l'analyseur intelligent.
              </p>
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Analyser l'exemple chargé
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
