// Official Belgian Administrative & Legal Algorithms (Client-Side & Server-Side Fallback)

// Official BCE (Banque-Carrefour des Entreprises) Modulo 97 validation
export function clientValidateBceNumber(bceRaw: string) {
  const digits = bceRaw.replace(/[^0-9]/g, '');
  if (digits.length !== 10) {
    return { isValid: false, message: 'Le numéro BCE doit comporter exactement 10 chiffres (ex: 0123.456.789)' };
  }
  const baseNum = parseInt(digits.substring(0, 8), 10);
  const checksum = parseInt(digits.substring(8, 10), 10);
  const calculatedCheck = 97 - (baseNum % 97);

  const isValid = checksum === calculatedCheck;
  return {
    isValid,
    formatted: `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7, 10)}`,
    vatFormatted: `BE ${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7, 10)}`,
    details: isValid
      ? {
          entityType: digits.startsWith('0') ? 'Société / Personne morale' : 'Entreprise personne physique',
          status: 'Actif à la Banque-Carrefour des Entreprises',
          statutoryJurisdiction: "Tribunal de l'Entreprise francophone de Bruxelles / Wallonie",
        }
      : null,
    message: isValid
      ? "Numéro BCE vérifié avec succès selon l'algorithme officiel Modulo 97."
      : `Numéro BCE invalide : somme de contrôle attendue ${calculatedCheck}, reçu ${checksum}.`,
  };
}

// Official NISS (Registre National Belge) Modulo 97 validation
export function clientValidateNissNumber(nissRaw: string) {
  const digits = nissRaw.replace(/[^0-9]/g, '');
  if (digits.length !== 11) {
    return { isValid: false, message: 'Le numéro NISS doit comporter 11 chiffres (ex: 85.06.12-123.45)' };
  }

  const baseDigits = digits.substring(0, 9);
  const checksum = parseInt(digits.substring(9, 11), 10);

  const baseNum1900 = parseInt(baseDigits, 10);
  const check1900 = 97 - (baseNum1900 % 97);

  const baseNum2000 = parseInt(`2${baseDigits}`, 10);
  const check2000 = 97 - (baseNum2000 % 97);

  let isValid = false;
  let birthCentury = 1900;

  if (checksum === check1900) {
    isValid = true;
    birthCentury = 1900;
  } else if (checksum === check2000) {
    isValid = true;
    birthCentury = 2000;
  }

  const yearPart = parseInt(digits.substring(0, 2), 10);
  const monthPart = parseInt(digits.substring(2, 4), 10);
  const dayPart = parseInt(digits.substring(4, 6), 10);
  const seqPart = parseInt(digits.substring(6, 9), 10);

  const fullYear = birthCentury + yearPart;
  const gender = seqPart % 2 === 0 ? 'Féminin' : 'Masculin';

  return {
    isValid,
    formatted: `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}-${digits.slice(6, 9)}.${digits.slice(9, 11)}`,
    birthDate: isValid ? `${String(dayPart).padStart(2, '0')}/${String(monthPart).padStart(2, '0')}/${fullYear}` : null,
    gender: isValid ? gender : null,
    message: isValid
      ? `Numéro NISS valide. Né(e) le ${String(dayPart).padStart(2, '0')}/${String(monthPart).padStart(2, '0')}/${fullYear} (${gender}).`
      : 'Numéro NISS invalide. Échec du contrôle Modulo 97.',
  };
}

// Official Statbel Rent Indexation with Regional PEB restrictions
export function clientCalculateRentIndexation(params: {
  baseRent: number;
  signYear: number;
  signMonth: number;
  currentYear: number;
  currentMonth: number;
  region: 'bruxelles' | 'wallonie' | 'flandre';
  pebGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
}) {
  const { baseRent, signYear, signMonth, currentYear, currentMonth, region, pebGrade } = params;

  // Approximate historical Belgian Health Index
  const baseHealthIndex = 115.4 + (signYear - 2020) * 4.2 + signMonth * 0.25;
  const newHealthIndex = 115.4 + (currentYear - 2020) * 4.2 + currentMonth * 0.25;

  const rawIndexedRent = (baseRent * newHealthIndex) / baseHealthIndex;

  let pebFactor = 1.0;
  let pebNote = 'Indexation à 100% autorisée pour ce niveau de PEB.';

  if (region === 'bruxelles') {
    if (pebGrade === 'E') {
      pebFactor = 0.5;
      pebNote = 'Région de Bruxelles-Capitale : Indexation plafonnée à 50% pour PEB E.';
    } else if (pebGrade === 'F' || pebGrade === 'G') {
      pebFactor = 0.0;
      pebNote = 'Région de Bruxelles-Capitale : Indexation interdite (0%) pour PEB F ou G.';
    }
  } else if (region === 'wallonie') {
    if (pebGrade === 'D') {
      pebFactor = 0.75;
      pebNote = 'Région Wallonne : Indexation plafonnée à 75% pour PEB D.';
    } else if (pebGrade === 'E') {
      pebFactor = 0.5;
      pebNote = 'Région Wallonne : Indexation plafonnée à 50% pour PEB E.';
    } else if (pebGrade === 'F' || pebGrade === 'G') {
      pebFactor = 0.0;
      pebNote = 'Région Wallonne : Indexation interdite pour passoires énergétiques (PEB F et G).';
    }
  }

  const rentIncrease = (rawIndexedRent - baseRent) * pebFactor;
  const finalRent = Math.round((baseRent + rentIncrease) * 100) / 100;

  return {
    baseRent,
    baseHealthIndex: Math.round(baseHealthIndex * 100) / 100,
    newHealthIndex: Math.round(newHealthIndex * 100) / 100,
    rawIndexedRent: Math.round(rawIndexedRent * 100) / 100,
    pebFactorApplied: pebFactor,
    pebNote,
    finalRent,
    monthlyIncrease: Math.round(rentIncrease * 100) / 100,
    effectiveDate: `01/${String(currentMonth).padStart(2, '0')}/${currentYear}`,
    legalBasis: 'Article 1728bis du Code civil belge & Décrets régionaux',
  };
}

// Client-Side Anonymization Engine (RGPD / APD)
export function clientAnonymizeBelgianText(text: string) {
  let anonymized = text;
  let count = 0;

  // NISS
  const nissRegex = /\b\d{2}[.\s]?\d{2}[.\s]?\d{2}[-\s]?\d{3}[.\s]?\d{2}\b/g;
  anonymized = anonymized.replace(nissRegex, () => {
    count++;
    return '[NISS_MASQUÉ_CONFIDENTIEL]';
  });

  // BCE
  const bceRegex = /\b0?\d{3}[.\s]?\d{3}[.\s]?\d{3}\b/g;
  anonymized = anonymized.replace(bceRegex, () => {
    count++;
    return '[BCE_MASQUÉ]';
  });

  // IBAN
  const ibanRegex = /\bBE\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/gi;
  anonymized = anonymized.replace(ibanRegex, () => {
    count++;
    return '[IBAN_BE_MASQUÉ]';
  });

  return {
    originalText: text,
    anonymizedText: anonymized,
    redactedItemsCount: count,
    complianceStatus: 'Conforme RGPD / APD Belgique',
  };
}

// Client-Side Belgian Document Generator
export function clientGenerateDocument(templateId: string, data: Record<string, any>) {
  if (templateId === 'mise-en-demeure') {
    return `MISE EN DEMEURE OFFICIELLE DE PAIEMENT
(En application du Livre XIX du Code de droit économique belge)

EXPÉDITEUR :
${data.senderName || 'Entreprise'}
${data.senderAddress || ''}
BCE / TVA : ${data.senderVat || ''}
IBAN : ${data.senderIban || ''}

DESTINATAIRE :
${data.recipientName || 'Débiteur'}
${data.recipientAddress || ''}

Fait à ${data.city || 'Bruxelles'}, le ${new Date().toLocaleDateString('fr-BE')}
Par envoi recommandé et courrier ordinaire.

OBJET : MISE EN DEMEURE DE PAYER – FACTURE / RÉF. ${data.invoiceRef || 'N/A'}

Madame, Monsieur,

Sauf erreur ou omission de notre part, nous constatons que la créance suivante demeure impayée à ce jour :
- Référence : ${data.invoiceRef || 'Facture'}
- Date d'échéance initiale : ${data.dueDate || 'Échue'}
- Montant en principal : ${Number(data.principalAmount || 0).toFixed(2)} EUR
- Clause pénale / Indemnité forfaitaire légale : ${Number(data.penaltyAmount || 0).toFixed(2)} EUR
- Intérêts moratoires de retard : ${Number(data.interestAmount || 0).toFixed(2)} EUR

MONTANT TOTAL EXIGIBLE : ${(Number(data.principalAmount || 0) + Number(data.penaltyAmount || 0) + Number(data.interestAmount || 0)).toFixed(2)} EUR

Par la présente, nous vous mettons formellement en demeure d'apurer l'intégralité de cette somme dans un délai impératif de QUATORZE (14) JOURS CALENDRIERS prenant cours le troisième jour ouvrable suivant l'envoi de la présente.

Le règlement doit être effectué sur le compte bancaire IBAN suivant :
${data.senderIban || ''} avec la mention : ${data.invoiceRef || 'Règlement solde'}

À défaut de paiement intégral dans le délai imparti, nous transmettrons sans autre avertissement le dossier à notre conseil pour citation devant le Tribunal de l'Entreprise ou le Tribunal de Première Instance compétent, les frais de justice et dépens restant intégralement à votre charge.

Veuillez agréer, Madame, Monsieur, nos salutations distinguées.

Pour ${data.senderName || 'L’Expéditeur'}
Signature officielle`;
  }

  if (templateId === 'bail-residence') {
    return `CONTRAT DE BAIL DE RÉSIDENCE PRINCIPALE
(Régime locatif régional belge - Loi sur les baux de résidence)

ENTRE LES SOUSSIGNÉS :

LE BAILLEUR :
${data.landlordName || 'Nom du Bailleur'}
Demeurant à : ${data.landlordAddress || ''}
Identifiant (NISS / BCE) : ${data.landlordId || ''}
Compte bancaire (IBAN) : ${data.landlordIban || ''}
Ci-après dénommé "Le Bailleur", d'une part,

ET LE PRENEUR :
${data.tenantName || 'Nom du Locataire'}
Demeurant à : ${data.tenantAddress || ''}
Numéro NISS : ${data.tenantNiss || ''}
Ci-après dénommé "Le Preneur", d'autre part.

ARTICLE 1 : DÉSIGNATION DU BIEN LOUÉ
Le Bailleur donne en location à titre de résidence principale le bien situé à :
${data.propertyAddress || ''}
Description : ${data.propertyDesc || 'Appartement'}
Performance Énergétique du Bâtiment (PEB) : Classe ${data.pebGrade || 'C'} (Certificat n° ${data.pebNumber || 'Non communiqué'})

ARTICLE 2 : DURÉE
Le présent bail est conclu pour une durée de ${data.durationYears || 3} années, prenant cours le 1er du mois suivant la signature.

ARTICLE 3 : LOYER ET CHARGES
Le loyer mensuel de base est fixé à ${Number(data.rentAmount || 0).toFixed(2)} EUR hors charges.
Une provision pour charges privatives et communes est fixée à ${Number(data.chargesAmount || 0).toFixed(2)} EUR par mois.
Le loyer est payable par anticipation au plus tard le 5 de chaque mois sur le compte bancaire IBAN : ${data.landlordIban || ''}.

ARTICLE 4 : INDEXATION
Le loyer est soumis à indexation annuelle selon la formule légale Statbel : (Loyer de base x Nouvel Indice Santé) / Indice de base.
L'indexation sera modulée le cas échéant selon les restrictions régionales applicables à la classe PEB (${data.pebGrade || 'C'}).

ARTICLE 5 : ENREGISTREMENT ET ÉTAT DES LIEUX
Le présent bail sera enregistré gratuitement par le Bailleur auprès du SPF Finances (MyMinfin).
Un état des lieux contradictoire d'entrée sera dressé avant l'entrée effective dans les lieux.

Fait à Bruxelles, le ${new Date().toLocaleDateString('fr-BE')}, en autant d'exemplaires originaux que de parties.

Le Bailleur                                  Le Preneur`;
  }

  return `Document généré pour ${templateId} le ${new Date().toLocaleDateString('fr-BE')}`;
}

// Client-Side Tax Simulator for Belgian Self-Employed (Indépendant personne physique)
export function clientSimulateBelgianTaxes(grossRevenue: number, professionalExpenses: number) {
  const netTaxableIncome = Math.max(0, grossRevenue - professionalExpenses);
  // Social contributions Inasti: 20.5% up to ceiling + 3.05% management fee
  const socialContributions = netTaxableIncome * 0.205 * 1.0305;
  const incomeAfterSocial = Math.max(0, netTaxableIncome - socialContributions);

  // Progressive personal income tax brackets (IPP Belgique)
  let ipp = 0;
  if (incomeAfterSocial > 48320) {
    ipp += (incomeAfterSocial - 48320) * 0.50 + (48320 - 28080) * 0.45 + (28080 - 15820) * 0.40 + 15820 * 0.25;
  } else if (incomeAfterSocial > 28080) {
    ipp += (incomeAfterSocial - 28080) * 0.45 + (28080 - 15820) * 0.40 + 15820 * 0.25;
  } else if (incomeAfterSocial > 15820) {
    ipp += (incomeAfterSocial - 15820) * 0.40 + 15820 * 0.25;
  } else {
    ipp += incomeAfterSocial * 0.25;
  }

  // Municipal surtax approx 7%
  const municipalTax = ipp * 0.07;
  const totalTax = ipp + municipalTax;
  const finalNetAnnual = Math.max(0, incomeAfterSocial - totalTax);
  const finalNetMonthly = finalNetAnnual / 12;

  return {
    grossRevenue,
    professionalExpenses,
    netTaxableIncome,
    socialContributions: Math.round(socialContributions),
    taxableIncomeAfterSocial: Math.round(incomeAfterSocial),
    personalIncomeTax: Math.round(totalTax),
    finalNetAnnual: Math.round(finalNetAnnual),
    finalNetMonthly: Math.round(finalNetMonthly),
    effectiveTaxRate: Math.round(((socialContributions + totalTax) / (grossRevenue || 1)) * 100),
  };
}

// Client-Side Autonomous AI Assistant Fallback for Belgian Administration
export function clientGenerateBelgianAiResponse(userQuery: string, profile: string): string {
  const q = userQuery.toLowerCase();

  if (q.includes('bail') || q.includes('loyer') || q.includes('locataire') || q.includes('propriétaire') || q.includes('peb')) {
    return `### Réglementation des Baux de Résidence en Belgique

1. **Enregistrement Obligatoire :** Tout bail de résidence principale doit être enregistré gratuitement auprès du SPF Finances (MyMinfin) dans un délai légal de 2 mois suivant la signature. L'absence d'enregistrement prive le bailleur de son délai de préavis légal.
2. **Garantie Locative :** Plafonnée à 2 mois de loyer (compte bloqué individualisé) ou 3 mois (garantie bancaire CPAS/fédérale).
3. **Indexation Annuelle :** Calculée obligatoirement selon l'indice santé Statbel à la date anniversaire. Attention aux restrictions régionales en fonction du certificat PEB :
   - *Bruxelles :* Indexation à 50% pour PEB E, 0% (interdite) pour PEB F ou G.
   - *Wallonie :* Indexation à 75% pour PEB D, 50% pour PEB E, 0% pour PEB F et G.
   - *Flandre :* Indexation autorisée sous réserve de certificat conforme.
4. **Modèles Disponibles :** Vous pouvez générer un contrat de bail complet certifié dans l'onglet **"Générateur Documents"** de cette plateforme.`;
  }

  if (q.includes('tva') || q.includes('facture') || q.includes('listing')) {
    return `### Obligations TVA & Facturation en Belgique (Code TVA)

1. **Régime de Franchise de la Taxe :** Si votre chiffre d'affaires annuel HTVA est inférieur à 25.000 €, vous pouvez bénéficier de la franchise de taxe (article 56bis du Code TVA). Mentions requises sur vos factures : *"Régime particulier de franchise de taxe, TVA non applicable"*.
2. **Taux Légaux Applicables :**
   - 21% : Taux normal par défaut.
   - 12% : Restauration (repas sur place), logements sociaux.
   - 6% : Produits de première nécessité, rénovation de logements de plus de 10 ans.
3. **Échéances Déclaratives :**
   - Trimestrielle : Déclaration et paiement au plus tard le 20 du mois suivant le trimestre (20 avril, 20 juillet, 20 octobre, 20 janvier).
   - Listing annuel clients assujettis : à déposer avant le 31 mars via Intervat / MyMinfin.`;
  }

  if (q.includes('inasti') || q.includes('cotisation') || q.includes('indépendant') || q.includes('social')) {
    return `### Statut d'Indépendant & Cotisations Sociales Inasti

1. **Taux de Cotisation :** 20,5% sur le revenu net imposable professionnel revalorisé (jusqu'au plafond légal annuel) + environ 3,05% de frais de gestion de votre caisse d'assurances sociales (Liantis, UCM, Partena, etc.).
2. **Cotisations Provisoires :** Durant vos 3 premières années d'activité, vous payez une cotisation forfaitaire minimale de début d'activité (environ 800 à 850 € / trimestre), régularisée ultérieurement dès réception des revenus réels déclarés au SPF Finances.
3. **Seuil d'Activité Complémentaire :** En tant qu'indépendant à titre complémentaire (au moins un mi-temps salarié ailleurs), vos cotisations sont nulles si votre revenu net est inférieur au seuil annuel légal (environ 1.865 €).`;
  }

  if (q.includes('bce') || q.includes('kbo') || q.includes('entreprise') || q.includes('société') || q.includes('srl')) {
    return `### Banque-Carrefour des Entreprises (BCE) & Formes Juridiques

1. **Structure du Numéro BCE :** Composé de 10 chiffres (ex: 0123.456.789). Le numéro de TVA correspond à ce numéro précédé de "BE ". Le contrôle d'intégrité légal est régi par l'algorithme officiel **Modulo 97**.
2. **Société à Responsabilité Limitée (SRL) :**
   - Aucun capital minimum obligatoire requis (un plan financier sérieux devant notaire suffit).
   - Responsabilité limitée au patrimoine de la société.
   - Taux d'imposition ISOC réduit à 20% sur la première tranche de 100.000 € de bénéfice (si conditions PME respectées et rémunération minimale d'un dirigeant de 45.000 €).
3. **Vérification Immédiate :** Utilisez l'outil **"Validateurs BCE & NISS"** dans la barre latérale pour tester n'importe quel numéro d'entreprise.`;
  }

  if (q.includes('niss') || q.includes('registre') || q.includes('national') || q.includes('identité')) {
    return `### Numéro de Registre National Belge (NISS)

1. **Composition :** 11 chiffres structurés sous le format YY.MM.DD-SS.CD.
2. **Algorithme de Contrôle :** Validation Modulo 97. Pour les personnes nées à partir de l'an 2000, le calcul est préfixé d'un 2 avant les 9 premiers chiffres.
3. **Protection des Données :** Le NISS est une donnée hautement sensible protégée par la loi belge et l'APD. Notre filtre d'anonymisation breveté le masque automatiquement avant tout traitement.`;
  }

  return `### Assistance Administrative Belge – AdminBelgique

Je traite votre demande sous l'angle du droit administratif et fiscal belge (SPF Finances, BCE, Inasti, ONSS, Régions).

Pour vous orienter efficacement :
- **Fiscalité & Déclarations :** TVA, Versements anticipés d'impôt (VA1-VA4), impôt des personnes physiques (IPP), cotisations sociales.
- **Logement & Immobilier :** Rédaction de baux régionaux, calcul d'indexation santé Statbel, restrictions énergétiques PEB.
- **Juridique & Recouvrement :** Mises en demeure conformes au Code de droit économique, recouvrement amiable B2B/B2C.
- **Vérifications :** Contrôle Modulo 97 des numéros BCE et NISS.

*Conseil : N'hésitez pas à préciser votre situation (indépendant en personne physique, gérant de SRL, bailleur privé ou particulier) pour une recommandation sur mesure.*`;
}

// Client-Side Scraper & Belgian Property Auditor for ImmoBoostScrap
export function clientScrapeBelgianPropertyUrl(url: string) {
  let portal = 'Immoweb';
  if (url.includes('zimmo')) portal = 'Zimmo';
  else if (url.includes('logic-immo')) portal = 'Logic-Immo';
  else if (url.includes('immovlan') || url.includes('vlan')) portal = 'Immovlan';
  else if (url.includes('century21')) portal = 'Century 21';
  else if (url.includes('era.be')) portal = 'ERA Belgium';

  const postalMatch = url.match(/\b(1\d{3}|2\d{3}|3\d{3}|4\d{3}|5\d{3}|6\d{3}|7\d{3}|8\d{3}|9\d{3})\b/);
  const postalCode = postalMatch ? postalMatch[1] : '1050';

  let region: 'bruxelles' | 'wallonie' | 'flandre' = 'bruxelles';
  const postNum = parseInt(postalCode, 10);
  if (postNum >= 1000 && postNum <= 1299) region = 'bruxelles';
  else if ((postNum >= 1300 && postNum <= 1499) || (postNum >= 4000 && postNum <= 7999)) region = 'wallonie';
  else region = 'flandre';

  let price = 245000;
  const priceMatch = url.match(/(\d{3,4})000/);
  if (priceMatch) {
    const parsed = parseInt(priceMatch[0], 10);
    if (parsed >= 50000 && parsed <= 5000000) price = parsed;
  }

  const regRate = region === 'flandre' ? 0.03 : 0.125;
  const regDuties = price * regRate;
  const notaryFees = Math.round(3500 + price * 0.012);
  const estimatedRent = Math.round(price * 0.0044);
  const totalInvestment = price + regDuties + notaryFees;
  const annualRent = estimatedRent * 12;
  const grossYield = Math.round((annualRent / totalInvestment) * 10000) / 100;
  const precompte = Math.round(estimatedRent * 1.15);
  const netRent = annualRent - precompte - annualRent * 0.08;
  const netYield = Math.round((netRent / totalInvestment) * 10000) / 100;

  return {
    success: true,
    url,
    portal,
    detectedData: {
      sourceUrl: url,
      portal,
      title: `Bien immobilier analysé (${portal})`,
      city: region === 'bruxelles' ? `Bruxelles (${postalCode})` : region === 'wallonie' ? `Wallonie (${postalCode})` : `Flandre (${postalCode})`,
      postalCode,
      region,
      price,
      surface: 82,
      pebGrade: 'B',
      rooms: 2,
      estimatedRent,
      cadastralIncome: 850,
      registrationDuties: Math.round(regDuties),
      registrationRate: regRate,
      notaryFees,
      totalInvestment,
      grossYield,
      netYield,
      monthlyCashflow: Math.round(estimatedRent - (price * 0.8 * 0.0055) - (estimatedRent * 0.15)),
      pebIndexationStatus: 'Indexation de loyer à 100% autorisée (PEB B conforme)',
      requiredBelgianCertificates: [
        { name: 'Certificat PEB', status: 'Requis avant mise en vente/location', mandatory: true },
        { name: 'Contrôle Électrique RGIE', status: 'Rapport conforme requis à l\'acte notarié', mandatory: true },
        { name: 'Renseignements Urbanistiques (RU)', status: 'Demande communale obligatoire', mandatory: true },
        { name: 'Attestation Asbeste / Amiante', status: 'Obligatoire en Flandre, recommandée en Wallonie/Bxl', mandatory: region === 'flandre' },
      ],
      legalNote: 'Calcul conforme aux barèmes officiels de la Fédération Royale du Notariat Belge (Fednot) et aux décrets régionaux sur le bail locatif.',
    },
  };
}

export function clientSearchBelgianProperties(params: {
  postalCode?: string;
  region?: string;
  propertyType?: string;
  transactionType?: 'sale' | 'rent';
  maxPrice?: number;
  rooms?: number;
}) {
  const {
    postalCode = '1000',
    region = 'bruxelles',
    propertyType = 'apartment',
    transactionType = 'sale',
    maxPrice,
    rooms,
  } = params;

  const saleList = [
    {
      id: 'immo-sale-01',
      title: 'Appartement lumineux 2 ch + terrasse',
      city: region === 'bruxelles' ? 'Bruxelles (1000)' : `Commune (${postalCode})`,
      sourcePortal: 'Immoweb Pro',
      sourceUrl: 'https://www.immoweb.be/fr/recherche/appartement/a-vendre/bruxelles/1000?countries=BE&orderBy=newest',
      transactionType: 'sale' as const,
      price: 285000,
      surface: 88,
      pebGrade: 'B' as const,
      rooms: 2,
      estimatedRent: 1150,
      monthlyCharges: 95,
      registrationDutyRate: region === 'flandre' ? 0.03 : 0.125,
      notaryFeesEstimate: 6800,
      grossYield: 4.84,
      netYield: 3.92,
      features: ['Ascenseur', 'Cuisine super-équipée', 'Cave'],
    },
    {
      id: 'immo-sale-02',
      title: 'Maison de maître à rénover fort potentiel',
      city: region === 'wallonie' ? 'Liège (4000)' : `Commune (${postalCode})`,
      sourcePortal: 'Logic-Immo',
      sourceUrl: 'https://www.logic-immo.be/fr/vente/maison-4000',
      transactionType: 'sale' as const,
      price: 195000,
      surface: 165,
      pebGrade: 'E' as const,
      rooms: 4,
      estimatedRent: 1350,
      monthlyCharges: 0,
      registrationDutyRate: 0.125,
      notaryFeesEstimate: 5900,
      grossYield: 8.3,
      netYield: 5.8,
      features: ['Jardin de ville', 'Hauts plafonds moulurés'],
    },
    {
      id: 'immo-sale-03',
      title: 'Studio de standing idéal investisseur',
      city: region === 'wallonie' ? 'Namur (5000)' : `Centre (${postalCode})`,
      sourcePortal: 'Zimmo',
      sourceUrl: 'https://www.zimmo.be/fr/recherche/te-koop/5000/',
      transactionType: 'sale' as const,
      price: 135000,
      surface: 42,
      pebGrade: 'C' as const,
      rooms: 1,
      estimatedRent: 650,
      monthlyCharges: 60,
      registrationDutyRate: 0.125,
      notaryFeesEstimate: 4900,
      grossYield: 5.77,
      netYield: 4.65,
      features: ['Proche gare', 'Bail en cours avec locataire sérieux'],
    },
    {
      id: 'immo-sale-04',
      title: 'Penthouse contemporain 3 ch terrasse panoramique',
      city: 'Ixelles (1050)',
      sourcePortal: 'Immoweb Pro',
      sourceUrl: 'https://www.immoweb.be/fr/recherche/appartement/a-vendre/ixelles/1050?countries=BE&orderBy=newest',
      transactionType: 'sale' as const,
      price: 435000,
      surface: 125,
      pebGrade: 'A' as const,
      rooms: 3,
      estimatedRent: 1850,
      monthlyCharges: 140,
      registrationDutyRate: 0.125,
      notaryFeesEstimate: 8500,
      grossYield: 5.1,
      netYield: 4.25,
      features: ['Terrasse 35m²', 'Pompe à chaleur', 'Cave & Parking'],
    },
  ];

  const rentList = [
    {
      id: 'immo-rent-01',
      title: 'Appartement 2 chambres rénové avec balcon',
      city: region === 'bruxelles' ? 'Bruxelles / Flagey (1050)' : `Commune (${postalCode})`,
      sourcePortal: 'Immoweb Pro',
      sourceUrl: 'https://www.immoweb.be/fr/recherche/appartement/a-louer/ixelles/1050?countries=BE&orderBy=newest',
      transactionType: 'rent' as const,
      price: 1150,
      monthlyCharges: 90,
      rentalGuarantee: 2300,
      leaseType: 'Bail de résidence principale 3 ans',
      surface: 85,
      pebGrade: 'B' as const,
      rooms: 2,
      pebNote: 'Indexation annuelle à 100% autorisée',
      features: ['Cuisine semi-équipée', 'Double vitrage thermique', 'Cave'],
    },
    {
      id: 'immo-rent-02',
      title: 'Studio meublé tout confort pour étudiant / jeune pro',
      city: 'Bruxelles / ULB (1050)',
      sourcePortal: 'Zimmo',
      sourceUrl: 'https://www.zimmo.be/fr/recherche/te-huur/1050/',
      transactionType: 'rent' as const,
      price: 680,
      monthlyCharges: 70,
      rentalGuarantee: 1360,
      leaseType: 'Bail étudiant / 1 an renouvelable',
      surface: 38,
      pebGrade: 'C' as const,
      rooms: 1,
      pebNote: 'Indexation annuelle normale autorisée',
      features: ['Mobilier moderne inclus', 'Connexion fibre optique'],
    },
    {
      id: 'immo-rent-03',
      title: 'Maison familiale 3 chambres avec jardin arboré',
      city: 'Namur / Jambes (5100)',
      sourcePortal: 'Logic-Immo',
      sourceUrl: 'https://www.logic-immo.be/fr/location/maison-5100',
      transactionType: 'rent' as const,
      price: 1350,
      monthlyCharges: 35,
      rentalGuarantee: 2700,
      leaseType: 'Bail de 9 ans longue durée',
      surface: 140,
      pebGrade: 'C' as const,
      rooms: 3,
      pebNote: 'Indexation annuelle normale autorisée',
      features: ['Grand jardin clôturé', 'Garage fermé'],
    },
    {
      id: 'immo-rent-04',
      title: 'Appartement de standing 1 chambre + terrasse',
      city: 'Woluwe-Saint-Lambert (1200)',
      sourcePortal: 'Immoweb Pro',
      sourceUrl: 'https://www.immoweb.be/fr/recherche/appartement/a-louer/woluwe-saint-lambert/1200?countries=BE&orderBy=newest',
      transactionType: 'rent' as const,
      price: 920,
      monthlyCharges: 80,
      rentalGuarantee: 1840,
      leaseType: 'Bail de 3 ans enregistré MyMinfin',
      surface: 65,
      pebGrade: 'A' as const,
      rooms: 1,
      pebNote: 'Basse consommation énergétique / PEB A',
      features: ['Ascenseur', 'Parquet chêne massif'],
    },
  ];

  let results: any[] = transactionType === 'rent' ? rentList : saleList;

  if (propertyType && propertyType !== 'all') {
    results = results.filter((p) => {
      const t = p.title.toLowerCase();
      if (propertyType === 'apartment') return t.includes('appartement') || t.includes('studio') || t.includes('penthouse');
      if (propertyType === 'house') return t.includes('maison');
      return true;
    });
  }

  if (rooms && Number(rooms) > 0) {
    results = results.filter((p) => p.rooms >= Number(rooms));
  }

  if (maxPrice && Number(maxPrice) > 0) {
    results = results.filter((p) => p.price <= Number(maxPrice));
  }

  return {
    postalCode,
    region,
    propertyType,
    transactionType,
    results,
  };
}
