import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Download,
  Sparkles,
  Building2,
  Scale,
  RefreshCw,
  Eye,
  FileEdit,
} from 'lucide-react';
import { DOCUMENT_TEMPLATES } from '../data/belgianData';
import { DocumentTemplate } from '../types/adminbelgique';

import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from './RoleBadge';

export const DocumentGeneratorView: React.FC = () => {
  const { currentRole, canCreateContent, switchRole } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(DOCUMENT_TEMPLATES[0]);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    DOCUMENT_TEMPLATES[0].fields.forEach((f) => {
      initial[f.name] = f.defaultValue ?? '';
    });
    return initial;
  });

  const [generatedDoc, setGeneratedDoc] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleSelectTemplate = (tpl: DocumentTemplate) => {
    setSelectedTemplate(tpl);
    const initial: Record<string, any> = {};
    tpl.fields.forEach((f) => {
      initial[f.name] = f.defaultValue ?? '';
    });
    setFormData(initial);
    setGeneratedDoc(null);
    setPermissionError(null);
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleGenerate = async () => {
    if (!canCreateContent) {
      setPermissionError(
        "Accès Restreint : Le rôle Visiteur dispose uniquement d'un droit de visualisation front-end. Pour modifier ou générer des documents administratifs et juridiques conformes, activez le rôle Éditeur ou Administrateur."
      );
      return;
    }

    setLoading(true);
    setPermissionError(null);
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          data: formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDoc(data);
        return;
      }
      throw new Error('Backend generation unavailable');
    } catch {
      // Fallback to client algorithm
      const { clientGenerateDocument } = await import('../utils/belgianAlgorithms');
      const content = clientGenerateDocument(selectedTemplate.id, formData);
      setGeneratedDoc({
        title: selectedTemplate.title,
        content,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${generatedDoc?.title || 'Document Administratif'}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.6; margin: 40px; color: #111; }
            h1 { font-size: 18px; text-align: center; margin-bottom: 25px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; }
          </style>
        </head>
        <body>
          <pre>${generatedDoc?.content || ''}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white">
                Générateur de Documents Administratifs Belges
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Modèles officiels rédigés conformément au Code de droit économique, aux décrets régionaux et au Code civil belge.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Conforme SPF Finances & Régions
            </span>
          </div>
        </div>

        {/* Template Selector Pills */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-800">
          {DOCUMENT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTemplate.id === tpl.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileEdit className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Champs Personnalisés</h2>
            </div>
            <span className="text-[10px] text-slate-400">Édition en direct</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {selectedTemplate.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] ?? ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder || ''}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-3">
            {permissionError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
                <p>{permissionError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      switchRole('editor');
                      setPermissionError(null);
                    }}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] cursor-pointer"
                  >
                    Passer en Éditeur
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setPermissionError(null);
                    }}
                    className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] cursor-pointer"
                  >
                    Passer en Admin
                  </button>
                </div>
              </div>
            )}

            {!canCreateContent && !permissionError && (
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Rôle Visiteur : Visualisation seule</span>
                <button
                  onClick={() => switchRole('editor')}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  Débloquer l'édition →
                </button>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3 font-semibold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 ${
                canCreateContent
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Génération du document juridique...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {canCreateContent
                      ? 'Générer le Document Conforme'
                      : 'Générer (Requiert rôle Éditeur/Admin)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          {/* Preview Toolbar */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">
                Aperçu du Document Officiel (Format A4)
              </span>
            </div>

            {generatedDoc && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copier le texte"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Document Content */}
          <div className="flex-1 p-6 bg-slate-950/40 overflow-y-auto">
            {generatedDoc ? (
              <div className="max-w-2xl mx-auto p-8 rounded-xl bg-white text-slate-900 shadow-2xl font-serif text-xs leading-relaxed border border-slate-200">
                <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {generatedDoc.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                      Royaume de Belgique • Document administratif certifié conforme
                    </p>
                  </div>
                  <div className="text-[10px] font-sans text-right text-slate-500">
                    Réf: ADB-{Date.now().toString().slice(-6)}
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-800">
                  {generatedDoc.content}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-sans">
                  <span>Document généré via AdminBelgique.com (Technologie elikacces IT)</span>
                  <span>Protection des données personnelles assurée</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <FileText className="w-12 h-12 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-300">
                  Prêt à générer votre document
                </h3>
                <p className="text-xs max-w-sm">
                  Remplissez les informations dans le panneau de gauche puis cliquez sur "Générer le Document Conforme".
                </p>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Générer maintenant avec les valeurs d'exemple
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
