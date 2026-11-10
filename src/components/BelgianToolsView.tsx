import React, { useState } from 'react';
import {
  Wrench,
  Building2,
  UserCheck,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';

export const BelgianToolsView: React.FC = () => {
  // BCE validator state
  const [bceInput, setBceInput] = useState('0842.123.456');
  const [bceResult, setBceResult] = useState<any>(null);

  // NISS validator state
  const [nissInput, setNissInput] = useState('85.06.12-123.45');
  const [nissResult, setNissResult] = useState<any>(null);

  // Rent indexation state
  const [rentParams, setRentParams] = useState({
    baseRent: 850,
    signYear: 2023,
    signMonth: 6,
    currentYear: 2026,
    currentMonth: 11,
    region: 'bruxelles' as 'bruxelles' | 'wallonie' | 'flandre',
    pebGrade: 'B' as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G',
  });
  const [rentResult, setRentResult] = useState<any>(null);

  const handleValidateBce = async () => {
    try {
      const response = await fetch('/api/tools/validate-bce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bceNumber: bceInput }),
      });
      if (response.ok) {
        const data = await response.json();
        setBceResult(data);
        return;
      }
    } catch {
      // Fallback to client algorithm
    }
    const { clientValidateBceNumber } = await import('../utils/belgianAlgorithms');
    setBceResult(clientValidateBceNumber(bceInput));
  };

  const handleValidateNiss = async () => {
    try {
      const response = await fetch('/api/tools/validate-niss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nissNumber: nissInput }),
      });
      if (response.ok) {
        const data = await response.json();
        setNissResult(data);
        return;
      }
    } catch {
      // Fallback to client algorithm
    }
    const { clientValidateNissNumber } = await import('../utils/belgianAlgorithms');
    setNissResult(clientValidateNissNumber(nissInput));
  };

  const handleCalculateRent = async () => {
    try {
      const response = await fetch('/api/tools/rent-indexation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rentParams),
      });
      if (response.ok) {
        const data = await response.json();
        setRentResult(data);
        return;
      }
    } catch {
      // Fallback to client algorithm
    }
    const { clientCalculateRentIndexation } = await import('../utils/belgianAlgorithms');
    setRentResult(clientCalculateRentIndexation(rentParams));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Wrench className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-white">
            Validateurs & Calculateurs Algorithmiques Belges
          </h1>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Outils conformes aux algorithmes officiels du SPF Économie (BCE Modulo 97), du Registre National (NISS) et de Statbel (Indice Santé).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool 1: BCE Modulo 97 Checker */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Vérificateur BCE / Numéro de TVA</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold font-mono">
              Modulo 97
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Vérifie la validité mathématique d'un numéro d'entreprise à la Banque-Carrefour des Entreprises selon la formule légale belge.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={bceInput}
              onChange={(e) => setBceInput(e.target.value)}
              placeholder="Ex: 0842.123.456 ou 0123456789"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleValidateBce}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Vérifier BCE
            </button>
          </div>

          {bceResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                bceResult.isValid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                {bceResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{bceResult.message}</span>
              </div>

              {bceResult.isValid && bceResult.details && (
                <div className="pt-2 border-t border-emerald-500/20 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Format BCE :</span>
                    <span className="font-mono font-bold text-white">{bceResult.formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Format TVA Intra :</span>
                    <span className="font-mono font-bold text-blue-400">{bceResult.vatFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type de structure :</span>
                    <span className="font-medium text-white">{bceResult.details.entityType}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tool 2: NISS Modulo 97 Checker */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Validateur NISS (Registre National)</h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold font-mono">
              État Civil BE
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Valide le numéro de registre national belge (11 chiffres) et extrait la date de naissance et le sexe biologique de naissance.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={nissInput}
              onChange={(e) => setNissInput(e.target.value)}
              placeholder="Ex: 85.06.12-123.45 ou 85061212345"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleValidateNiss}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Valider NISS
            </button>
          </div>

          {nissResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                nissResult.isValid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                {nissResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{nissResult.message}</span>
              </div>

              {nissResult.isValid && (
                <div className="pt-2 border-t border-emerald-500/20 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date de naissance :</span>
                    <span className="font-bold text-white">{nissResult.birthDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Genre à l'état civil :</span>
                    <span className="font-bold text-indigo-400">{nissResult.gender}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tool 3: Official Statbel Rent Indexation Engine */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              Calculateur Officiel d'Indexation de Loyer (Statbel)
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold">
            Art. 1728bis C. Civ.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Loyer de base initial (€)
            </label>
            <input
              type="number"
              value={rentParams.baseRent}
              onChange={(e) => setRentParams({ ...rentParams, baseRent: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Signature du bail</label>
            <div className="flex gap-1">
              <input
                type="number"
                placeholder="Mois (1-12)"
                value={rentParams.signMonth}
                onChange={(e) => setRentParams({ ...rentParams, signMonth: Number(e.target.value) })}
                className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white"
              />
              <input
                type="number"
                placeholder="Année"
                value={rentParams.signYear}
                onChange={(e) => setRentParams({ ...rentParams, signYear: Number(e.target.value) })}
                className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Région</label>
            <select
              value={rentParams.region}
              onChange={(e: any) => setRentParams({ ...rentParams, region: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="bruxelles">Bruxelles-Capitale</option>
              <option value="wallonie">Région Wallonne</option>
              <option value="flandre">Région Flamande</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Certificat PEB</label>
            <select
              value={rentParams.pebGrade}
              onChange={(e: any) => setRentParams({ ...rentParams, pebGrade: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="A">PEB A (100% indexable)</option>
              <option value="B">PEB B (100% indexable)</option>
              <option value="C">PEB C (100% indexable)</option>
              <option value="D">PEB D (100% indexable)</option>
              <option value="E">PEB E (50% indexable)</option>
              <option value="F">PEB F (Indexation gelée)</option>
              <option value="G">PEB G (Indexation gelée)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculateRent}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-600/30 transition-all cursor-pointer"
        >
          Calculer l'Indexation Légale
        </button>

        {rentResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Nouveau Loyer Indexé :</span>
                <div className="text-2xl font-bold text-emerald-400">
                  {rentResult.finalRent.toLocaleString('fr-BE')} € / mois
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Hausse mensuelle :</span>
                <div className="text-base font-bold text-amber-400">
                  +{rentResult.difference} € (+{rentResult.percentageIncrease} %)
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Formule appliquée :</span>
                <span className="font-mono text-white">{rentResult.formula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Indice de base :</span>
                <span className="text-slate-200">{rentResult.baseIndex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nouvel indice santé :</span>
                <span className="text-slate-200">{rentResult.newIndex}</span>
              </div>
              {rentResult.pebNotice && (
                <div className="p-2 rounded bg-amber-500/10 text-amber-300 text-[11px] border border-amber-500/20">
                  {rentResult.pebNotice}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
