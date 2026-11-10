import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const JuristAssistView: React.FC = () => {
  const [contractText, setContractText] = useState(`CONVENTION DE PRESTATIONS DE SERVICES INFORMATIQUES
Entre la société PRESTAPRO SRL (BCE 0812.345.678) et le CLIENT (CLIENT SA).

ARTICLE 4 : DÉLAIS ET PAIEMENTS
Les factures sont payables dans un délai de 90 jours à compter de leur date d'émission. En cas de retard de paiement du client, aucune indemnité ne sera due par le client. En revanche, si le prestataire a un jour de retard de livraison, il sera redevable d'une pénalité forfaitaire automatique de 5.000 € non révisable.

ARTICLE 7 : RESPONSABILITÉ
Le prestataire décline toute responsabilité, y compris en cas de dol, de faute lourde ou de manquement à une obligation essentielle du contrat.`);

  const [auditResult, setAuditResult] = useState<{
    abusiveClausesFound: Array<{ clause: string; issue: string; legalRef: string; severity: string }>;
    score: number;
  } | null>(null);

  const [copiedClauseIndex, setCopiedClauseIndex] = useState<number | null>(null);

  const certifiedClauses = [
    {
      title: 'Clause de Réserve de Propriété (Art. 69 Loi sur les sûretés réelles)',
      content: `Les marchandises et livrables demeurent la propriété exclusive du vendeur/prestataire jusqu'au complet paiement du prix en principal, frais et intérêts. L'acheteur s'interdit de les aliéner, nantir ou transformer avant paiement intégral. En cas de non-paiement à l'échéance, le vendeur se réserve le droit de revendiquer les biens aux frais du débiteur.`,
      usage: 'Contrat de vente commerciale B2B / Prestation avec matériel',
    },
    {
      title: 'Clause Pénale et Intérêts de Retard (Conforme Livre XIX CDE)',
      content: `En cas de retard de paiement à l'échéance par un consommateur et après l'envoi d'un premier rappel gratuit sans paiement dans les 14 jours calendrier, il sera dû de plein droit un intérêt de retard au taux directeur de la BCE majoré de 8 points, ainsi qu'une indemnité forfaitaire fixée à 20 € (dette ≤ 150 €), 30 € + 10% de la tranche supérieure (dette entre 150,01 € et 500 €) ou 65 € + 5% (dette > 500 €) dans la limite maximale légale de l'article XIX.4 du Code de droit économique.`,
      usage: 'Conditions Générales de Vente B2C (consommateurs)',
    },
    {
      title: 'Clause de Compétence Territoriale Belge (Droit International Privé)',
      content: `La présente convention est régie exclusivement par le droit belge. Tout différend relatif à sa validité, son interprétation ou son exécution sera soumis à la compétence exclusive des Tribunaux de l'Entreprise du ressort du siège social de l'expéditeur (Tribunal de l'Entreprise francophone de Bruxelles), sauf disposition impérative contraire.`,
      usage: 'Tous contrats commerciaux et partenariats B2B',
    },
  ];

  const handleAuditContract = () => {
    const issues: Array<{ clause: string; issue: string; legalRef: string; severity: string }> = [];

    if (/90 jours|120 jours/i.test(contractText)) {
      issues.push({
        clause: 'Délai de paiement de 90 jours',
        issue: 'En Belgique, le délai légal standard entre entreprises est de 30 jours, avec un plafond strict fixé à 60 jours calendrier (Loi du 2 août 2002 modifiée). Un délai de 90 jours est réputé non écrit.',
        legalRef: 'Loi relative aux retards de paiement dans les transactions commerciales',
        severity: 'haute',
      });
    }

    if (/faute lourde|dol|obligation essentielle/i.test(contractText)) {
      issues.push({
        clause: 'Exonération en cas de dol ou faute lourde',
        issue: 'L\'exonération contractuelle pour son propre dol ou sa faute lourde vidant le contrat de sa substance est nulle selon l\'article 5.89 du nouveau Code civil belge.',
        legalRef: 'Article 5.89 du Code civil belge (Livre 5 des obligations)',
        severity: 'critique',
      });
    }

    if (/aucune indemnité ne sera due.*pénalité forfaitaire automatique/i.test(contractText)) {
      issues.push({
        clause: 'Déséquilibre manifeste des clauses de pénalités',
        issue: 'La clause pénale asymétrique sanctionnant lourdement une partie tout en exonérant l\'autre crée un déséquilibre manifeste interdit entre entreprises (B2B).',
        legalRef: 'Article VI.91/3 du Code de droit économique belge (Loi B2B)',
        severity: 'haute',
      });
    }

    setAuditResult({
      abusiveClausesFound: issues,
      score: issues.length === 0 ? 95 : Math.max(30, 90 - issues.length * 25),
    });
  };

  const handleCopyClause = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedClauseIndex(index);
    setTimeout(() => setCopiedClauseIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Scale className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-white">JuristAssist Belge – Audit de Contrats & Clauses</h1>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Détecteur de clauses abusives selon la loi B2B (Code de droit économique belge) et bibliothèque de clauses certifiées par nos juristes partenaires.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Contract Audit Zone */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Audit de Contrat IA (Loi B2B & Code Civil Belge)</span>
            </h2>
            <span className="text-[10px] text-slate-400">Analyse de conformité</span>
          </div>

          <textarea
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            rows={10}
            placeholder="Collez ici les articles d'un contrat ou conditions générales à auditer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleAuditContract}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            Auditer les Clauses selon le Droit Belge
          </button>

          {auditResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Indice de Sécurité Juridique</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    auditResult.score >= 80
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  Score : {auditResult.score} / 100
                </span>
              </div>

              {auditResult.abusiveClausesFound.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      {auditResult.abusiveClausesFound.length} clause(s) non-conforme(s) ou risquée(s) détectée(s) :
                    </span>
                  </div>

                  {auditResult.abusiveClausesFound.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1"
                    >
                      <div className="text-xs font-bold text-white">{item.clause}</div>
                      <div className="text-[11px] text-slate-300">{item.issue}</div>
                      <div className="text-[10px] text-rose-300 font-semibold uppercase">
                        Réf : {item.legalRef}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aucune clause manifestement abusive détectée.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Certified Belgian Clauses Library */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Bibliothèque de Clauses Certifiées</span>
            </h2>
            <span className="text-[10px] text-slate-400">Prêtes à insérer</span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {certifiedClauses.map((clause, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{clause.title}</h3>
                    <span className="text-[10px] text-blue-400">{clause.usage}</span>
                  </div>
                  <button
                    onClick={() => handleCopyClause(clause.content, idx)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copier la clause"
                  >
                    {copiedClauseIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] font-mono text-slate-400 leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                  {clause.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
