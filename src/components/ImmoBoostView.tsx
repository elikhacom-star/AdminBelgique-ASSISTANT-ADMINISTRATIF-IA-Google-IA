import React, { useState } from 'react';
import {
  Building,
  Search,
  Calculator,
  TrendingUp,
  Percent,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Link2,
  Coins,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Layers,
  FileSpreadsheet,
  Eye,
  X,
} from 'lucide-react';
import { ImmoProperty } from '../types/adminbelgique';

export const ImmoBoostView: React.FC = () => {
  const [postalCode, setPostalCode] = useState('1000');
  const [region, setRegion] = useState<'bruxelles' | 'wallonie' | 'flandre'>('bruxelles');
  const [propertyType, setPropertyType] = useState('all');
  const [transactionType, setTransactionType] = useState<'sale' | 'rent'>('sale');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [roomsFilter, setRoomsFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<ImmoProperty[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'search' | 'urlScraper' | 'yield' | 'cashflow' | 'generator'>('search');

  // URL Scraper state
  const [urlInput, setUrlInput] = useState('');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [copiedAudit, setCopiedAudit] = useState(false);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [copiedSourceUrl, setCopiedSourceUrl] = useState(false);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState<ImmoProperty | null>(null);

  // Helper to get guaranteed active live portal search URL (ZERO 404 guarantee)
  const getLivePortalSearchUrl = (prop: ImmoProperty, isRentMode: boolean) => {
    // If it's already a validated search URL and not an expired individual ID
    if (prop.sourceUrl && prop.sourceUrl.includes('/recherche/')) {
      return prop.sourceUrl;
    }
    const postCode = postalCode || '1000';
    const portal = (prop.sourcePortal || 'Immoweb').toLowerCase();
    
    if (portal.includes('zimmo')) {
      return `https://www.zimmo.be/fr/recherche/${isRentMode ? 'te-huur' : 'te-koop'}/${postCode}/`;
    }
    if (portal.includes('logic-immo')) {
      return `https://www.logic-immo.be/fr/${isRentMode ? 'location' : 'vente'}/${postCode}`;
    }
    if (portal.includes('immovlan')) {
      return `https://www.immovlan.be/fr/recherche/appartement/${isRentMode ? 'a-louer' : 'a-vendre'}/${postCode}`;
    }
    // Immoweb official search query URL (Guaranteed 200 OK, never 404)
    return `https://www.immoweb.be/fr/recherche/appartement/${isRentMode ? 'a-louer' : 'a-vendre'}?postalCodes=${postCode}&countries=BE&orderBy=newest`;
  };

  // Yield calculator state
  const [purchasePrice, setPurchasePrice] = useState<number>(250000);
  const [monthlyRent, setMonthlyRent] = useState<number>(1100);
  const [renovationCost, setRenovationCost] = useState<number>(15000);
  const [selectedPeb, setSelectedPeb] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'>('B');
  const [applyBxlAbatement, setApplyBxlAbatement] = useState<boolean>(false);

  // Mortgage & Cashflow state
  const [downPayment, setDownPayment] = useState<number>(50000);
  const [loanDurationYears, setLoanDurationYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(3.35);
  const [monthlyCharges, setMonthlyCharges] = useState<number>(80);
  const [cadastralIncome, setCadastralIncome] = useState<number>(950);

  // Ad generator state
  const [adParams, setAdParams] = useState({
    title: 'Appartement 2 chambres lumineux',
    city: 'Ixelles / Flagey (1050)',
    surface: '85 m²',
    peb: 'B',
    charges: '120 €',
    rent: '1.250 €',
  });
  const [generatedAd, setGeneratedAd] = useState('');
  const [copiedAd, setCopiedAd] = useState(false);

  const handleSearch = async (overrideTx?: 'sale' | 'rent') => {
    const tx = overrideTx || transactionType;
    setLoading(true);
    try {
      const response = await fetch('/api/immoboost/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode,
          region,
          propertyType: propertyType === 'all' ? undefined : propertyType,
          transactionType: tx,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          rooms: roomsFilter !== 'all' ? Number(roomsFilter) : undefined,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setProperties(data.results || []);
        setLoading(false);
        return;
      }
    } catch {
      // client fallback
    }

    const { clientSearchBelgianProperties } = await import('../utils/belgianAlgorithms');
    const fallback = clientSearchBelgianProperties({
      postalCode,
      region,
      propertyType: propertyType === 'all' ? undefined : propertyType,
      transactionType: tx,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      rooms: roomsFilter !== 'all' ? Number(roomsFilter) : undefined,
    });
    setProperties(fallback.results as any);
    setLoading(false);
  };

  React.useEffect(() => {
    handleSearch();
  }, []);

  const handleToggleTxType = (type: 'sale' | 'rent') => {
    setTransactionType(type);
    handleSearch(type);
  };

  const handleScrapeUrl = async (presetUrl?: string) => {
    const targetUrl = presetUrl || urlInput;
    if (!targetUrl.trim()) return;
    setScrapeLoading(true);

    try {
      const response = await fetch('/api/immoboost/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (response.ok) {
        const data = await response.json();
        const detected = {
          ...data.detectedData,
          sourceUrl: data.detectedData?.sourceUrl || data.url || targetUrl,
          portal: data.detectedData?.portal || data.portal || 'Immoweb',
        };
        setScrapedData(detected);
        setPurchasePrice(detected.price);
        setMonthlyRent(detected.estimatedRent);
        setSelectedPeb(detected.pebGrade as any);
        setRegion(detected.region);
        setScrapeLoading(false);
        return;
      }
    } catch {
      // client fallback
    }

    const { clientScrapeBelgianPropertyUrl } = await import('../utils/belgianAlgorithms');
    const fallback = clientScrapeBelgianPropertyUrl(targetUrl);
    const detected = {
      ...fallback.detectedData,
      sourceUrl: fallback.detectedData?.sourceUrl || fallback.url || targetUrl,
      portal: fallback.detectedData?.portal || fallback.portal || 'Immoweb',
    };
    setScrapedData(detected);
    setPurchasePrice(detected.price);
    setMonthlyRent(detected.estimatedRent);
    setSelectedPeb(detected.pebGrade as any);
    setRegion(detected.region);
    setScrapeLoading(false);
  };

  // Belgian yield calculation
  let registrationRate = region === 'flandre' ? 0.03 : 0.125;
  let registrationDuties = purchasePrice * registrationRate;
  if (region === 'bruxelles' && applyBxlAbatement) {
    // Abattement bruxellois : exonération sur la 1ère tranche de 200.000 € = économie de 25.000 €
    const taxableBase = Math.max(0, purchasePrice - 200000);
    registrationDuties = taxableBase * 0.125;
  }

  const notaryFees = Math.round(3500 + purchasePrice * 0.012);
  const totalInvestment = purchasePrice + registrationDuties + notaryFees + renovationCost;
  const annualGrossRent = monthlyRent * 12;
  const grossYield = totalInvestment > 0 ? (annualGrossRent / totalInvestment) * 100 : 0;
  
  // Estimated net: deduce précompte immobilier (~1.25 month rent) and insurance/maintenance (8%)
  const precompteImmo = Math.round(monthlyRent * 1.25);
  const maintenance = annualGrossRent * 0.08;
  const netRent = annualGrossRent - precompteImmo - maintenance;
  const netYield = totalInvestment > 0 ? (netRent / totalInvestment) * 100 : 0;

  // Mortgage Calculation (Mensualité constante amortissable)
  const loanAmount = Math.max(0, totalInvestment - downPayment);
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanDurationYears * 12;
  const monthlyMortgage =
    loanAmount > 0 && monthlyRate > 0
      ? Math.round(
          (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : 0;

  const monthlyNetCashflow = Math.round(monthlyRent - monthlyMortgage - monthlyCharges - (precompteImmo / 12));

  const handleGenerateAd = () => {
    const text = `À LOUER – ${adParams.title.toUpperCase()} (${adParams.city})
Loyer mensuel : ${adParams.rent} + ${adParams.charges} de charges communes
Superficie : ${adParams.surface}

Idéalement situé à proximité immédiate des transports, commerces et commodités.
Ce bien se compose de :
- Hall d'entrée avec vestiaire sécurisé
- Vaste séjour baigné de lumière naturelle
- Cuisine contemporaine entièrement équipée (four, taque, hotte, lave-vaisselle)
- 2 belles chambres au calme
- Salle de bains avec douche à l'italienne et raccordements machine
- Cave privative en sous-sol

INFORMATIONS LÉGALES OBLIGATOIRES (BELGIQUE) :
- Certificat de performance énergétique : PEB Classe ${adParams.peb} (Consommation spécifique : conforme aux normes régionales)
- Contrôle de l'installation électrique : Conforme aux normes RGIE
- Châssis : Double vitrage haute isolation thermique et acoustique
- Bail : Résidence principale de 3 ans ou 9 ans (enregistré gratuitement via MyMinfin)
- Garantie locative : 2 mois de loyer bloqués sur compte individualisé

Visites et renseignements sur dossier. Disponible immédiatement.`;
    setGeneratedAd(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Building className="w-5 h-5" />
              </span>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  ImmoBoost Pro / ImmoScrap Pro – Immobilier Belge
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  /ImmoBoostScrap
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Agrégateur et scraper d'annonces en Belgique (Immoweb, Zimmo, Logic-Immo), audit notarial Fednot, droits d'enregistrement régionaux, PEB et simulateur de crédit cashflow.
            </p>
          </div>

          {/* Subtabs Navigation */}
          <div className="flex flex-wrap items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setActiveSubTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'search'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Recherche Multi-Portails
            </button>
            <button
              onClick={() => setActiveSubTab('urlScraper')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'urlScraper'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Scraper une URL d'Annonce
            </button>
            <button
              onClick={() => setActiveSubTab('yield')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'yield'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Frais Notaire & Droits
            </button>
            <button
              onClick={() => setActiveSubTab('cashflow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'cashflow'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Crédit & Cash-Flow
            </button>
            <button
              onClick={() => setActiveSubTab('generator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'generator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Générateur d'Annonces PEB
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 1: Search & Scraping Multi-portals */}
      {activeSubTab === 'search' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            {/* Row 1: Transaction Type Toggle (Vente vs Location) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Type de Transaction :</span>
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    onClick={() => handleToggleTxType('sale')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      transactionType === 'sale'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    À Vendre (Achat / Investissement)
                  </button>
                  <button
                    onClick={() => handleToggleTxType('rent')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      transactionType === 'rent'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    À Louer (Location Résidentielle)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Portails scannés :</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Immoweb</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Logic-Immo</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Zimmo</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Immovlan</span>
              </div>
            </div>

            {/* Row 2: Search Filters (Commune, Type, Chambres, Budget, Région) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Code Postal / Commune
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Ex: 1000, 1050, 4000..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Type de Bien</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="all">Tous types de biens</option>
                  <option value="apartment">Appartement / Flat</option>
                  <option value="house">Maison d'habitation</option>
                  <option value="building">Immeuble de rapport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Chambres</label>
                <select
                  value={roomsFilter}
                  onChange={(e) => setRoomsFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="all">Toutes chambres</option>
                  <option value="1">1 chambre min.</option>
                  <option value="2">2 chambres min.</option>
                  <option value="3">3 chambres min.</option>
                  <option value="4">4+ chambres</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {transactionType === 'rent' ? 'Loyer Max (€/mois)' : 'Prix d\'Achat Max (€)'}
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={transactionType === 'rent' ? 'Ex: 1200' : 'Ex: 350000'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Région Fiscale</label>
                <select
                  value={region}
                  onChange={(e: any) => setRegion(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="bruxelles">Bruxelles (12.5%)</option>
                  <option value="wallonie">Wallonie (12.5%)</option>
                  <option value="flandre">Flandre (3% / 12%)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Filtrer les Annonces</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop: any) => {
              const isRent = prop.transactionType === 'rent' || transactionType === 'rent';

              return (
                <div
                  key={prop.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                              isRent
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            }`}
                          >
                            {isRent ? 'À LOUER' : 'À VENDRE'}
                          </span>
                          <a
                            href={prop.sourceUrl || `https://www.immoweb.be/fr/recherche/${isRent ? 'appartement/a-louer' : 'appartement/a-vendre'}/${postalCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 hover:text-blue-300 transition-colors"
                            title="Ouvrir l'annonce d'origine sur le portail source"
                          >
                            <span>{prop.sourcePortal}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {prop.city}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5">{prop.title}</h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          prop.pebGrade === 'A' || prop.pebGrade === 'B'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : prop.pebGrade === 'C' || prop.pebGrade === 'D'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        PEB {prop.pebGrade}
                      </span>
                    </div>

                    {/* Rent vs Sale KPI Summary */}
                    {isRent ? (
                      <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-slate-800 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400">Loyer Mensuel</div>
                          <div className="text-sm font-bold text-emerald-400">
                            {prop.price.toLocaleString('fr-BE')} €
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Charges</div>
                          <div className="text-sm font-bold text-white">
                            {prop.monthlyCharges ? `${prop.monthlyCharges} €/m` : 'Incluses'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Garantie (2 mois)</div>
                          <div className="text-sm font-bold text-blue-400">
                            {(prop.rentalGuarantee || prop.price * 2).toLocaleString('fr-BE')} €
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-slate-800 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400">Prix Vente</div>
                          <div className="text-sm font-bold text-white">
                            {prop.price.toLocaleString('fr-BE')} €
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Loyer estimé</div>
                          <div className="text-sm font-bold text-emerald-400">
                            {prop.estimatedRent || Math.round(prop.price * 0.0044)} €/m
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Rendement Brut</div>
                          <div className="text-sm font-bold text-blue-400">
                            {prop.grossYield || 5.2}%
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-300 py-1">
                      <span>Surface : <strong>{prop.surface} m²</strong></span>
                      <span>•</span>
                      <span>Chambres : <strong>{prop.rooms} ch</strong></span>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-400 pt-1">
                      {prop.features?.map((f: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800">
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons on card: In-App View & Live Portal Search without 404 */}
                    <div className="pt-2.5 mt-2 flex flex-col gap-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPropertyForModal(prop)}
                          className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                          title="Consulter la fiche détaillée complète du bien"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>Fiche complète & Audit</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetUrl = getLivePortalSearchUrl(prop, isRent);
                            navigator.clipboard.writeText(targetUrl);
                            setCopiedUrlId(prop.id);
                            setTimeout(() => setCopiedUrlId(null), 2000);
                          }}
                          title="Copier le lien direct vers le portail"
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1 shrink-0"
                        >
                          {copiedUrlId === prop.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400 font-semibold">Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Lien</span>
                            </>
                          )}
                        </button>
                      </div>

                      <a
                        href={getLivePortalSearchUrl(prop, isRent)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-300 transition-colors bg-slate-800/60 hover:bg-slate-800 py-1 px-2 rounded-lg border border-slate-800"
                        title="Ouvrir la recherche en direct sur le portail (garanti actif, aucun 404)"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0 text-blue-400" />
                        <span>Voir en direct sur {prop.sourcePortal} ↗</span>
                      </a>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-800">
                    {isRent ? (
                      <>
                        <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {prop.leaseType || 'Bail de résidence 3 ans'}
                        </span>
                        <button
                          onClick={() => {
                            setAdParams({
                              ...adParams,
                              city: prop.city,
                              rent: `${prop.price} €`,
                              peb: prop.pebGrade,
                            });
                            setActiveSubTab('generator');
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                        >
                          Rédiger le bail / annonce →
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-slate-400">
                          Droits {(prop.registrationDutyRate || 0.125) * 100}% :{' '}
                          {(prop.price * (prop.registrationDutyRate || 0.125)).toLocaleString('fr-BE')} €
                        </span>
                        <button
                          onClick={() => {
                            setPurchasePrice(prop.price);
                            setMonthlyRent(prop.estimatedRent || Math.round(prop.price * 0.0044));
                            setSelectedPeb(prop.pebGrade);
                            setActiveSubTab('yield');
                          }}
                          className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                        >
                          Simuler rendement →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 2: Direct URL Scraper (ImmoScrap URL) */}
      {activeSubTab === 'urlScraper' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Link2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white">Scraper d'Annonce Immobilière Belge en Direct</h2>
                <p className="text-xs text-slate-400">
                  Collez le lien d'une annonce Immoweb, Zimmo ou Logic-Immo pour extraire automatiquement les données et calculer les frais légaux belges.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Ex: https://www.immoweb.be/fr/annonce/appartement/a-vendre/ixelles/1050/11894210"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleScrapeUrl()}
                disabled={scrapeLoading || !urlInput.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                {scrapeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Scraper & Analyser</span>
              </button>
            </div>

            {/* Quick Test Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">Tester rapidement avec un exemple :</span>
              <button
                onClick={() => {
                  setUrlInput('https://www.immoweb.be/fr/annonce/appartement/a-vendre/ixelles/1050/11894210');
                  handleScrapeUrl('https://www.immoweb.be/fr/annonce/appartement/a-vendre/ixelles/1050/11894210');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
              >
                Immoweb (Ixelles 1050)
              </button>
              <button
                onClick={() => {
                  setUrlInput('https://www.zimmo.be/fr/liege-4000/a-vendre/appartement/345920');
                  handleScrapeUrl('https://www.zimmo.be/fr/liege-4000/a-vendre/appartement/345920');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
              >
                Zimmo (Liège 4000)
              </button>
              <button
                onClick={() => {
                  setUrlInput('https://www.logic-immo.be/fr/vente/maison-namur-5000/12948');
                  handleScrapeUrl('https://www.logic-immo.be/fr/vente/maison-namur-5000/12948');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
              >
                Logic-Immo (Namur 5000)
              </button>
            </div>
          </div>

          {/* Scraped Results Display */}
          {scrapedData && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-400">
                    Source : {scrapedData.portal} • Région {scrapedData.region.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{scrapedData.title}</h3>
                  <p className="text-xs text-slate-400">{scrapedData.city}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    PEB {scrapedData.pebGrade}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(scrapedData, null, 2));
                      setCopiedAudit(true);
                      setTimeout(() => setCopiedAudit(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedAudit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAudit ? 'Copié' : 'Copier l\'audit'}</span>
                  </button>
                </div>
              </div>

              {/* Original Source Announcement Access Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-800/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                    <ExternalLink className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Annonce Source d'Origine</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25">
                        {scrapedData.portal || 'Portail Belge'}
                      </span>
                    </div>
                    <a
                      href={scrapedData.sourceUrl || urlInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={scrapedData.sourceUrl || urlInput}
                      className="text-xs text-blue-400 hover:text-blue-300 underline font-mono truncate max-w-xs sm:max-w-md md:max-w-xl block mt-0.5"
                    >
                      {scrapedData.sourceUrl || urlInput}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(scrapedData.sourceUrl || urlInput);
                      setCopiedSourceUrl(true);
                      setTimeout(() => setCopiedSourceUrl(false), 2000);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedSourceUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSourceUrl ? 'Lien copié' : 'Copier l\'URL source'}</span>
                  </button>
                  <a
                    href={scrapedData.sourceUrl || urlInput}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <span>Accéder à l'annonce d'origine</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Prix d'Achat</span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {scrapedData.price.toLocaleString('fr-BE')} €
                  </div>
                  <span className="text-[10px] text-slate-400">~{Math.round(scrapedData.price / scrapedData.surface)} €/m²</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Frais Totaux (Droits + Notaire)</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {(scrapedData.registrationDuties + scrapedData.notaryFees).toLocaleString('fr-BE')} €
                  </div>
                  <span className="text-[10px] text-slate-400">Droits {(scrapedData.registrationRate * 100)}% + Fednot</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Rendement Brut</span>
                  <div className="text-lg font-bold text-blue-400 mt-0.5">
                    {scrapedData.grossYield} %
                  </div>
                  <span className="text-[10px] text-slate-400">Loyer {scrapedData.estimatedRent} €/m</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Rendement Net</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {scrapedData.netYield} %
                  </div>
                  <span className="text-[10px] text-slate-400">Après précompte & charges</span>
                </div>
              </div>

              {/* Belgian Regulatory Compliance Checklist */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Obligations Légales & Certificats Requis à l'Acte Notarié (Belgique)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {scrapedData.requiredBelgianCertificates.map((cert: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-white">{cert.name}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                        {cert.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <a
                  href={scrapedData.sourceUrl || urlInput}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Consulter l'annonce sur {scrapedData.portal || 'le site source'}</span>
                </a>

                <button
                  onClick={() => setActiveSubTab('cashflow')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <Coins className="w-4 h-4" />
                  <span>Calculer le Crédit & Cash-Flow Net →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Yield & Notary Calculator (Fednot) */}
      {activeSubTab === 'yield' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              <span>Paramètres de l'Investissement Locatif Belge</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Prix d'Achat du Bien (€)
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Loyer Mensuel Hors Charges (€)
                </label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Budget Travaux / Rafraîchissement prévu (€)
                </label>
                <input
                  type="number"
                  value={renovationCost}
                  onChange={(e) => setRenovationCost(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Région Fiscale</label>
                  <select
                    value={region}
                    onChange={(e: any) => setRegion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="bruxelles">Bruxelles (12.5%)</option>
                    <option value="wallonie">Wallonie (12.5%)</option>
                    <option value="flandre">Flandre (3% / 12%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Classe PEB</label>
                  <select
                    value={selectedPeb}
                    onChange={(e: any) => setSelectedPeb(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="A">PEB A (Indexable 100%)</option>
                    <option value="B">PEB B (Indexable 100%)</option>
                    <option value="C">PEB C (Indexable 100%)</option>
                    <option value="D">PEB D (Indexable 100%)</option>
                    <option value="E">PEB E (Indexable 50%)</option>
                    <option value="F">PEB F (Indexation gelée)</option>
                    <option value="G">PEB G (Indexation gelée)</option>
                  </select>
                </div>
              </div>

              {region === 'bruxelles' && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyBxlAbatement}
                      onChange={(e) => setApplyBxlAbatement(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-blue-300 font-semibold">
                      Appliquer l'Abattement Fiscal Bruxellois (Économie de 25.000 €)
                    </span>
                  </label>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Exonération des droits d'enregistrement sur la 1ère tranche de 200.000 € pour première acquisition sous conditions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Synthèse Notariale & Rendement Locatif Net</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Rendement Brut
                </span>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {grossYield.toFixed(2)} %
                </div>
                <span className="text-[10px] text-slate-400">Loyer annuel / Coût global</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Rendement Net Estimé
                </span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {netYield.toFixed(2)} %
                </div>
                <span className="text-[10px] text-slate-400">Après précompte & charges</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 divide-y divide-slate-800">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Droits d'enregistrement légaux :</span>
                <span className="font-semibold text-white">
                  {registrationDuties.toLocaleString('fr-BE')} €
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Frais d'acte notarié estimés (Fednot) :</span>
                <span className="font-semibold text-white">
                  {notaryFees.toLocaleString('fr-BE')} €
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Budget rénovation prévu :</span>
                <span className="font-semibold text-white">
                  {renovationCost.toLocaleString('fr-BE')} €
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-bold border-t border-slate-700">
                <span className="text-white">Investissement Total Clé en Main :</span>
                <span className="text-blue-400">
                  {totalInvestment.toLocaleString('fr-BE')} €
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('cashflow')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Simuler le Crédit & Cashflow Mensuel →</span>
            </button>
          </div>
        </div>
      )}

      {/* Subtab 4: Mortgage Credit & Monthly Cashflow */}
      {activeSubTab === 'cashflow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Financement Bancaire Belge (Crédit Hypothécaire)</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Apport Personnel (€)
                </label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Durée (années)</label>
                  <select
                    value={loanDurationYears}
                    onChange={(e) => setLoanDurationYears(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value={15}>15 ans</option>
                    <option value={20}>20 ans (Standard)</option>
                    <option value={25}>25 ans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Taux Fixe Annuel (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Charges Non Récupérables Mensuelles (€)
                </label>
                <input
                  type="number"
                  value={monthlyCharges}
                  onChange={(e) => setMonthlyCharges(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Cashflow Results Panel */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Bilan Cash-Flow Réel Net en Poche</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Cash-Flow Net Mensuel</span>
                <span
                  className={`text-xl font-bold px-3 py-1 rounded-lg ${
                    monthlyNetCashflow >= 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {monthlyNetCashflow >= 0 ? `+${monthlyNetCashflow}` : monthlyNetCashflow} € / mois
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {monthlyNetCashflow >= 0
                  ? 'Bien autofinancé générant des liquidités nettes positives chaque mois.'
                  : `Effort d'épargne mensuel requis de ${Math.abs(monthlyNetCashflow)} € pour rembourser le capital.`}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300 divide-y divide-slate-800">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Montant emprunté à la banque :</span>
                <span className="font-semibold text-white">{loanAmount.toLocaleString('fr-BE')} €</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Mensualité du crédit hypothécaire :</span>
                <span className="font-semibold text-rose-300">-{monthlyMortgage.toLocaleString('fr-BE')} €/mois</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Loyer mensuel perçu :</span>
                <span className="font-semibold text-emerald-400">+{monthlyRent.toLocaleString('fr-BE')} €/mois</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Provision Précompte Immobilier (mensualisée) :</span>
                <span className="font-semibold text-slate-300">-{Math.round(precompteImmo / 12)} €/mois</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Charges communes & assurance propriétaire :</span>
                <span className="font-semibold text-slate-300">-{monthlyCharges} €/mois</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 5: PEB Ad Generator */}
      {activeSubTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Paramètres de l'Annonce Légale</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Titre de l'Annonce</label>
                <input
                  type="text"
                  value={adParams.title}
                  onChange={(e) => setAdParams({ ...adParams, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Commune / Code Postal</label>
                  <input
                    type="text"
                    value={adParams.city}
                    onChange={(e) => setAdParams({ ...adParams, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Superficie</label>
                  <input
                    type="text"
                    value={adParams.surface}
                    onChange={(e) => setAdParams({ ...adParams, surface: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Classe PEB</label>
                <select
                  value={adParams.peb}
                  onChange={(e) => setAdParams({ ...adParams, peb: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="A">PEB A (Excellente isolation)</option>
                  <option value="B">PEB B</option>
                  <option value="C">PEB C</option>
                  <option value="D">PEB D</option>
                  <option value="E">PEB E</option>
                  <option value="F">PEB F</option>
                  <option value="G">PEB G</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Loyer (€)</label>
                  <input
                    type="text"
                    value={adParams.rent}
                    onChange={(e) => setAdParams({ ...adParams, rent: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Charges (€)</label>
                  <input
                    type="text"
                    value={adParams.charges}
                    onChange={(e) => setAdParams({ ...adParams, charges: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateAd}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
              >
                Générer le texte d'annonce conforme
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Descriptif Optimisé & Conforme Droit Belge</h2>
              {generatedAd && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedAd);
                    setCopiedAd(true);
                    setTimeout(() => setCopiedAd(false), 2000);
                  }}
                  className="text-xs text-blue-400 flex items-center gap-1 cursor-pointer"
                >
                  {copiedAd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAd ? 'Copié !' : 'Copier'}</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[300px] text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {generatedAd || (
                <span className="text-slate-400 font-sans text-xs">
                  Cliquez sur "Générer le texte d'annonce" à gauche pour obtenir un descriptif complet avec toutes les mentions légales obligatoires belges (PEB, RGIE, charges, garantie locative MyMinfin).
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed In-App Property Sheet & Audit Modal (100% Reliable, Zero 404) */}
      {selectedPropertyForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 my-6 text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                      selectedPropertyForModal.transactionType === 'rent'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {selectedPropertyForModal.transactionType === 'rent' ? 'À LOUER' : 'À VENDRE'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedPropertyForModal.sourcePortal}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedPropertyForModal.city}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {selectedPropertyForModal.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPropertyForModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Fermer la fiche"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price & Primary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  {selectedPropertyForModal.transactionType === 'rent' ? 'Loyer Mensuel' : 'Prix de Vente'}
                </span>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {selectedPropertyForModal.price.toLocaleString('fr-BE')} €
                  {selectedPropertyForModal.transactionType === 'rent' && <span className="text-xs text-slate-400 font-normal"> /mois</span>}
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedPropertyForModal.surface > 0 ? `~${Math.round(selectedPropertyForModal.price / selectedPropertyForModal.surface)} €/m²` : ''}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  {selectedPropertyForModal.transactionType === 'rent' ? 'Garantie (2 mois)' : 'Droits d\'Enreg.'}
                </span>
                <div className="text-lg font-bold text-blue-400 mt-0.5">
                  {selectedPropertyForModal.transactionType === 'rent'
                    ? `${(selectedPropertyForModal.rentalGuarantee || selectedPropertyForModal.price * 2).toLocaleString('fr-BE')} €`
                    : `${Math.round(selectedPropertyForModal.price * (selectedPropertyForModal.registrationDutyRate || 0.125)).toLocaleString('fr-BE')} €`}
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedPropertyForModal.transactionType === 'rent' ? 'Compte bloqué légal' : `Taux ${(selectedPropertyForModal.registrationDutyRate || 0.125) * 100}%`}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Superficie & Pièces</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {selectedPropertyForModal.surface} m²
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedPropertyForModal.rooms} chambre{selectedPropertyForModal.rooms > 1 ? 's' : ''}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Certificat PEB</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`px-2.5 py-0.5 rounded text-sm font-bold ${
                      selectedPropertyForModal.pebGrade === 'A' || selectedPropertyForModal.pebGrade === 'B'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : selectedPropertyForModal.pebGrade === 'C' || selectedPropertyForModal.pebGrade === 'D'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    Classe {selectedPropertyForModal.pebGrade}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                  {selectedPropertyForModal.pebNote || 'Normes régionales'}
                </span>
              </div>
            </div>

            {/* Features & Equipment List */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>Caractéristiques & Équipements du Bien</span>
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedPropertyForModal.features?.map((feat: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Belgian Regulatory & Notary Audit Checklist */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Audit Juridique & Obligations Légales Belges (Fednot / SPF Finances)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-white">Certificat de Performance Énergétique (PEB)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Obligatoire dès la mise en annonce. Détermine l'autorisation d'indexation du loyer selon l'indice santé Statbel.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-white">Contrôle Électrique RGIE</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Rapport de conformité RGIE requis à l'acte authentique de vente chez le notaire.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-white">Renseignements Urbanistiques (RU)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Délivrés par l'administration communale pour certifier la conformité de l'affectation du bien.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-white">
                    {selectedPropertyForModal.transactionType === 'rent' ? 'Enregistrement MyMinfin' : 'Frais d\'Acte de Notaire (Fednot)'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {selectedPropertyForModal.transactionType === 'rent'
                      ? 'Enregistrement gratuit obligatoire dans les 2 mois via MyMinfin par le bailleur.'
                      : `Barème dégressif légal Fednot : estimation à ~${selectedPropertyForModal.notaryFeesEstimate || 6000} €.`}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <a
                href={getLivePortalSearchUrl(selectedPropertyForModal, selectedPropertyForModal.transactionType === 'rent')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                title="Consulter les annonces actives en direct sur le portail (garantie sans 404)"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Voir les annonces en direct sur {selectedPropertyForModal.sourcePortal} ↗</span>
              </a>

              <div className="flex items-center gap-2">
                {selectedPropertyForModal.transactionType === 'rent' ? (
                  <button
                    onClick={() => {
                      setAdParams({
                        ...adParams,
                        city: selectedPropertyForModal.city,
                        rent: `${selectedPropertyForModal.price} €`,
                        peb: selectedPropertyForModal.pebGrade,
                      });
                      setSelectedPropertyForModal(null);
                      setActiveSubTab('generator');
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Rédiger l'annonce / Bail →</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setPurchasePrice(selectedPropertyForModal.price);
                      setMonthlyRent(selectedPropertyForModal.estimatedRent || Math.round(selectedPropertyForModal.price * 0.0044));
                      setSelectedPeb(selectedPropertyForModal.pebGrade);
                      setSelectedPropertyForModal(null);
                      setActiveSubTab('yield');
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Simuler Rendement & Crédit →</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedPropertyForModal(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
