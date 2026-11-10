import { DocumentTemplate, FiscalDeadline } from '../types/adminbelgique';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'mise-en-demeure',
    title: 'Mise en Demeure de Paiement (Droit Belge)',
    category: 'Juridique & Recouvrement',
    description: 'Sommation formelle avant citation judiciaire, conforme au Code de droit économique et à la loi sur le recouvrement amiable.',
    fields: [
      { name: 'senderName', label: 'Nom / Société Expéditeur', type: 'text', defaultValue: 'Consulting Pro SPRL / SRL', placeholder: 'Ex: SRL Tech Innov' },
      { name: 'senderAddress', label: 'Adresse Expéditeur', type: 'text', defaultValue: 'Avenue Louise 240, 1050 Bruxelles' },
      { name: 'senderVat', label: 'N° BCE / TVA Expéditeur', type: 'text', defaultValue: 'BE 0845.123.987' },
      { name: 'senderIban', label: 'IBAN de Paiement', type: 'text', defaultValue: 'BE68 5390 0754 7034' },
      { name: 'recipientName', label: 'Nom Débiteur / Entreprise', type: 'text', defaultValue: 'Entreprise Client SA' },
      { name: 'recipientAddress', label: 'Adresse Débiteur', type: 'text', defaultValue: 'Rue Royale 100, 1000 Bruxelles' },
      { name: 'invoiceRef', label: 'Référence Facture / Contrat', type: 'text', defaultValue: 'FACT-2026-089' },
      { name: 'dueDate', label: 'Date d\'échéance initiale', type: 'date', defaultValue: '2026-10-15' },
      { name: 'principalAmount', label: 'Montant en Principal (€)', type: 'number', defaultValue: 1750 },
      { name: 'penaltyAmount', label: 'Indemnité Forfaitaire Légale (€)', type: 'number', defaultValue: 40 },
      { name: 'interestAmount', label: 'Intérêts de Retard (€)', type: 'number', defaultValue: 18.5 },
      { name: 'city', label: 'Fait à', type: 'text', defaultValue: 'Bruxelles' },
    ],
  },
  {
    id: 'bail-residence',
    title: 'Contrat de Bail de Résidence Principale',
    category: 'Bail & Immobilier',
    description: 'Contrat complet conforme aux décrets régionaux (Wallonie, Bruxelles, Flandre) avec clause d\'enregistrement MyMinfin et PEB.',
    fields: [
      { name: 'landlordName', label: 'Nom du Bailleur', type: 'text', defaultValue: 'Jean Dupont' },
      { name: 'landlordAddress', label: 'Adresse du Bailleur', type: 'text', defaultValue: 'Chaussée de Waterloo 320, 1060 Saint-Gilles' },
      { name: 'landlordId', label: 'NISS ou BCE Bailleur', type: 'text', defaultValue: '72.04.18-215.89' },
      { name: 'landlordIban', label: 'IBAN du compte loyer', type: 'text', defaultValue: 'BE42 0012 3456 7890' },
      { name: 'tenantName', label: 'Nom du Preneur (Locataire)', type: 'text', defaultValue: 'Claire Martin' },
      { name: 'tenantAddress', label: 'Adresse actuelle preneur', type: 'text', defaultValue: 'Rue Haute 45, 1000 Bruxelles' },
      { name: 'tenantNiss', label: 'NISS Locataire', type: 'text', defaultValue: '88.11.23-146.32' },
      { name: 'propertyAddress', label: 'Adresse du bien loué', type: 'text', defaultValue: 'Avenue de la Couronne 150, 1050 Ixelles' },
      { name: 'propertyDesc', label: 'Description sommaire', type: 'text', defaultValue: 'Appartement 2 chambres, salon, cuisine semi-équipée, balcon' },
      { name: 'pebGrade', label: 'Classe PEB du logement', type: 'select', defaultValue: 'B', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
      { name: 'pebNumber', label: 'N° certificat PEB', type: 'text', defaultValue: 'PEB-2025-BRU-87421' },
      { name: 'durationYears', label: 'Durée du bail (années)', type: 'number', defaultValue: 3 },
      { name: 'rentAmount', label: 'Loyer mensuel de base (€)', type: 'number', defaultValue: 950 },
      { name: 'chargesAmount', label: 'Provision mensuelle charges (€)', type: 'number', defaultValue: 80 },
    ],
  },
  {
    id: 'indexation-loyer',
    title: 'Lettre d\'Indexation Annuelle de Loyer',
    category: 'Bail & Immobilier',
    description: 'Notification officielle d\'indexation avec application de la formule légale Statbel indice santé.',
    fields: [
      { name: 'landlordName', label: 'Nom du Bailleur', type: 'text', defaultValue: 'Jean Dupont' },
      { name: 'landlordAddress', label: 'Adresse du Bailleur', type: 'text', defaultValue: 'Chaussée de Waterloo 320, 1060 Bruxelles' },
      { name: 'tenantName', label: 'Nom du Locataire', type: 'text', defaultValue: 'Claire Martin' },
      { name: 'propertyAddress', label: 'Adresse du logement loué', type: 'text', defaultValue: 'Avenue de la Couronne 150, 1050 Ixelles' },
      { name: 'baseRent', label: 'Loyer de base initial (€)', type: 'number', defaultValue: 900 },
      { name: 'signDate', label: 'Date de signature du bail', type: 'date', defaultValue: '2023-10-15' },
      { name: 'baseIndex', label: 'Indice santé de base', type: 'number', defaultValue: 128.91 },
      { name: 'newIndex', label: 'Nouvel indice santé', type: 'number', defaultValue: 136.50 },
      { name: 'indexedRent', label: 'Loyer recalculé (€)', type: 'number', defaultValue: 952.99 },
      { name: 'effectiveDate', label: 'Date d\'application', type: 'date', defaultValue: '2026-11-01' },
      { name: 'charges', label: 'Charges inchangées (€)', type: 'number', defaultValue: 50 },
    ],
  },
];

export const UPCOMING_FISCAL_DEADLINES: FiscalDeadline[] = [
  {
    id: 'fisc-01',
    title: 'Déclaration TVA 3ème Trimestre 2026',
    authority: 'SPF Finances',
    dueDate: '2026-10-20',
    category: 'TVA',
    description: 'Dépôt du formulaire de TVA et paiement du solde éventuel via MyMinfin / Intervat.',
    status: 'urgent',
    actionUrlName: 'Intervat MyMinfin',
  },
  {
    id: 'fisc-02',
    title: 'Cotisations Sociales Inasti 4ème Trimestre',
    authority: 'Inasti',
    dueDate: '2026-12-31',
    category: 'Cotisations',
    description: 'Paiement des cotisations d\'indépendant à votre caisse d\'assurances sociales (Liantis, UCM, etc.).',
    status: 'pending',
    actionUrlName: 'Caisse Sociale',
  },
  {
    id: 'fisc-03',
    title: 'Acompte Impôt des Sociétés (ISOC - VA4)',
    authority: 'SPF Finances',
    dueDate: '2026-12-20',
    category: 'IPP / ISOC',
    description: 'Versement anticipé d\'impôt des sociétés pour éviter la majoration légale.',
    status: 'pending',
    actionUrlName: 'Versement Anticipé',
  },
  {
    id: 'fisc-04',
    title: 'Listing Annuel TVA Clients Assujettis',
    authority: 'SPF Finances',
    dueDate: '2027-03-31',
    category: 'TVA',
    description: 'Déclaration de la liste des clients belges ayant un n° de TVA avec CA > 250 €.',
    status: 'pending',
    actionUrlName: 'Intervat',
  },
];

export const SAMPLE_ADMINISTRATIVE_DOCUMENTS = [
  {
    id: 'sample-spf',
    name: 'Avertissement-Extrait de Rôle SPF Finances (Exemple)',
    text: `SERVICE PUBLIC FÉDÉRAL FINANCES
Administration générale de la Fiscalité
Centre de perception de Bruxelles - SPF Finances
Boulevard du Jardin Botanique 50, 1000 Bruxelles

AVERTISSEMENT-EXTRAIT DE RÔLE – IMPÔT DES PERSONNES PHYSIQUES
Exercice d'imposition : 2025 – Revenus 2024
Numéro d'article : 8472910398
Date d'envoi : 12/09/2026
Date limite de paiement : 12/11/2026

Contribuable :
M. DUPONT Marc
NISS : 82.03.14-239.51
Rue de la Loi 15, 1000 Bruxelles

DÉCOMPTE D'IMPÔT :
Revenus professionnels imposables : 42.500,00 EUR
Cotisations sociales déduites : 8.712,50 EUR
Impôt fédéral calculé : 11.230,00 EUR
Centimes additionnels communaux (7%) : 786,10 EUR
Précomptes professionnels déjà retenus : 9.850,00 EUR

SOLDE RESTANT À PAYER PAR VOS SOINS : 2.166,10 €

MODALITÉS DE PAIEMENT :
À virer au compte BE45 6792 0012 3456 avec la communication structurée obligatoire :
+++084/7291/03985+++

VOIES DE RECOURS :
En cas de désaccord, vous disposez d'un délai d'un an à dater de l'envoi pour introduire une réclamation motivée auprès du Conseiller général compétent via MyMinfin ou par pli recommandé.`,
  },
  {
    id: 'sample-onss',
    name: 'Mise en Demeure de Cotisations Patronales ONSS (Exemple)',
    text: `OFFICE NATIONAL DE SÉCURITÉ SOCIALE (ONSS)
Direction de la Perception des Cotisations
Place Victor Horta 11, 1060 Bruxelles

RÉF : ONSS/REC/2026/0942
ENTREPRISE : TECH SERVICES SPRL
N° ONSS : 1234567-89
N° BCE : 0823.456.789

MISE EN DEMEURE FORMELLE AVANT PROCÉDURE DE CONTRAINTE

Monsieur le Gérant,

L'examen de votre compte employeur fait apparaître un solde débiteur non apuré concernant le 2ème trimestre 2026.
Montant en principal des cotisations patronales : 3.450,00 €
Majoration légale de retard (10%) : 345,00 €
Intérêts de retard (7% l'an) : 60,38 €

TOTAL EXIGIBLE IMMÉDIATEMENT : 3.855,38 €

Vous disposez d'un délai de 14 jours calendrier pour régler cette somme sur notre compte :
IBAN : BE12 0001 2345 6789
Communication structurée : +++123/4567/89045+++

À défaut de paiement intégral ou d'introduction d'un plan d'apurement recevable dans ce délai, une contrainte par huissier de justice sera décernée sans autre avertissement.`,
  },
];
