import React, { useState } from 'react';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Percent,
  Clock,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { UPCOMING_FISCAL_DEADLINES } from '../data/belgianData';

export const FiduciaryView: React.FC = () => {
  // Independent simulation states
  const [grossRevenue, setGrossRevenue] = useState<number>(65000);
  const [deductibleExpenses, setDeductibleExpenses] = useState<number>(12000);
  const [dependents, setDependents] = useState<number>(1);
  const [simResult, setSimResult] = useState<any>(null);

  // Invoice compliance auditor state
  const [invoiceText, setInvoiceText] = useState(`FACTURE N° 2026-042
Date : 15/10/2026
Fournisseur : IT Consulting SPRL
BCE : 0842.123.456
TVA : BE 0842.123.456
Client : Tech Services SA
Adresse : Boulevard Anspach 120, 1000 Bruxelles
Prestation : Développement web & maintenance
Montant HTVA : 2.500,00 €
Taux TVA : 21% (525,00 €)
Total TVAC : 3.025,00 €
Compte IBAN : BE71 0014 5678 9012
Communication structurée : +++084/2123/45688+++`);

  const [invoiceAudit, setInvoiceAudit] = useState<{
    checks: Array<{ label: string; passed: boolean; tip: string }>;
    overallScore: number;
    isCompliant: boolean;
  } | null>(null);

  const handleSimulate = async () => {
    try {
      const response = await fetch('/api/tools/tax-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grossRevenue,
          deductibleExpenses,
          dependents,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSimResult(data);
        return;
      }
    } catch {
      // Fallback to client algorithm
    }
    const { clientSimulateBelgianTaxes } = await import('../utils/belgianAlgorithms');
    setSimResult(clientSimulateBelgianTaxes(grossRevenue, deductibleExpenses));
  };

  const handleAuditInvoice = () => {
    const text = invoiceText.toLowerCase();

    const hasBce = /bce|0\d{3}\.?\d{3}\.?\d{3}/i.test(invoiceText);
    const hasVat = /be\s?0?\d{3}\.?\d{3}\.?\d{3}/i.test(invoiceText);
    const hasStructuredComm = /\+{3}\d{3}\/\d{4}\/\d{5}\+{3}/.test(invoiceText);
    const hasIban = /be\d{2}/i.test(invoiceText);
    const hasVatRate = /21%|12%|6%|0%|autoliquidation|franchise/i.test(invoiceText);
    const hasDate = /date|\d{2}\/\d{2}\/\d{4}/i.test(invoiceText);

    const checks = [
      {
        label: 'Numéro d\'entreprise BCE (10 chiffres)',
        passed: hasBce,
        tip: 'Le numéro BCE doit être mentionné clairement sur tout document émis.',
      },
      {
        label: 'Numéro d\'identification TVA (BE 0...)',
        passed: hasVat,
        tip: 'Obligatoire pour les assujettis TVA selon l\'art. 53 du Code TVA belge.',
      },
      {
        label: 'Taux de TVA belge (21%, 12%, 6% ou mention légale d\'exonération)',
        passed: hasVatRate,
        tip: 'Si franchise (art. 56bis) ou autoliquidation (art. 51 §2), la mention textuelle exacte est obligatoire.',
      },
      {
        label: 'Coordonnées bancaires IBAN belge',
        passed: hasIban,
        tip: 'Facilite le virement direct SEPA par le client.',
      },
      {
        label: 'Communication structurée standardisée (+++xxx/xxxx/xxxxx+++)',
        passed: hasStructuredComm,
        tip: 'Recommandé pour un rapprochement bancaire automatique modulo 97.',
      },
      {
        label: 'Date d\'émission et de prestation',
        passed: hasDate,
        tip: 'Détermine la date d\'exigibilité de la taxe dans votre déclaration trimestrielle.',
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    setInvoiceAudit({
      checks,
      overallScore: score,
      isCompliant: score >= 80,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Calculator className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-white">
            Fiduciaires & Fiscalité Belge (IA & Simulations)
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Simulateur de revenus nets pour indépendants (Inasti & IPP), calendrier des échéances du SPF Finances, et auditeur de conformité des factures de vente selon le Code de la TVA.
        </p>
      </div>

      {/* Grid: Independent Net Income Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Simulateur Revenu Net Indépendant Personne Physique</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold">
              Régime Inasti 20.5%
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Chiffre d'affaires brut annuel HTVA (€)
              </label>
              <input
                type="number"
                value={grossRevenue}
                onChange={(e) => setGrossRevenue(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Frais professionnels déductibles annuels (€)
              </label>
              <input
                type="number"
                value={deductibleExpenses}
                onChange={(e) => setDeductibleExpenses(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Personnes ou enfants à charge
              </label>
              <input
                type="number"
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              onClick={handleSimulate}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              Calculer le Net en Poche
            </button>
          </div>

          {/* Results breakdown */}
          {simResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400">Revenu Net Mensuel Disponible :</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {simResult.monthlyNet.toLocaleString('fr-BE')} € / mois
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cotisations sociales Inasti (20.5%) :</span>
                  <span className="text-amber-400 font-medium">
                    {simResult.annualSocialContributions.toLocaleString('fr-BE')} €/an (~
                    {simResult.quarterlySocialContributions.toLocaleString('fr-BE')} €/trimestre)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Impôt fédéral (IPP par tranches) :</span>
                  <span className="text-white font-medium">
                    {simResult.federalTax.toLocaleString('fr-BE')} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Centimes additionnels communaux (~7%) :</span>
                  <span className="text-white font-medium">
                    {simResult.municipalTax.toLocaleString('fr-BE')} €
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">Taux effectif de prélèvements globaux :</span>
                  <span className="text-blue-400">{simResult.effectiveTaxRate} %</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Compliance Auditor */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Vérificateur de Conformité de Facture Belge</span>
            </h2>
            <span className="text-[10px] text-slate-400">Code TVA Belge</span>
          </div>

          <textarea
            value={invoiceText}
            onChange={(e) => setInvoiceText(e.target.value)}
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleAuditInvoice}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            Vérifier la facture selon les normes du SPF Finances
          </button>

          {invoiceAudit && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Conformité Globale</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    invoiceAudit.isCompliant
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  Score : {invoiceAudit.overallScore} %
                </span>
              </div>

              <div className="space-y-2">
                {invoiceAudit.checks.map((check, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className={check.passed ? 'text-slate-200' : 'text-rose-300 font-semibold'}>
                        {check.label}
                      </div>
                      <div className="text-[10px] text-slate-400">{check.tip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fiscal Calendar Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Calendrier Officiel des Échéances Fiscales Belges</span>
            </h2>
            <p className="text-xs text-slate-400">
              Déclarations et versements imposés par le SPF Finances et l'Inasti
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold">
            Année en cours
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {UPCOMING_FISCAL_DEADLINES.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-blue-400">
                    {item.authority}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.dueDate}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-900 text-right">
                <span className="text-[10px] text-blue-400 font-medium">
                  {item.actionUrlName || 'Portail Officiel'} →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
