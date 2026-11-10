export type NavigationTab =
  | 'dashboard'
  | 'assistant'
  | 'generator'
  | 'analyzer'
  | 'immoboost'
  | 'fiduciary'
  | 'jurist'
  | 'anonymizer'
  | 'tools'
  | 'users'
  | 'android'
  | 'settings';

export type UserProfileType = 'particulier' | 'independant' | 'societe' | 'fiduciaire';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  anonymizationNotice?: string;
  engine?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: 'Juridique & Recouvrement' | 'Bail & Immobilier' | 'Fiscal & Social' | 'Sociétés';
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    defaultValue?: string | number;
    options?: string[];
    placeholder?: string;
  }>;
}

export interface DocumentAnalysisResult {
  filename: string;
  authority: string;
  documentType: string;
  urgency: 'basse' | 'moyenne' | 'haute' | 'critique';
  deadline: string;
  detectedAmount: string;
  structuredCommunication: {
    raw: string;
    isValidModulo97: boolean;
    notice: string;
  } | null;
  summary: string;
  actionPlan: string[];
  recommendedReplyDraft: string;
  anonymizationReport?: {
    anonymizedText: string;
    redactedItemsCount: number;
    protectionLevel: string;
  };
}

export interface FiscalDeadline {
  id: string;
  title: string;
  authority: 'SPF Finances' | 'ONSS' | 'Inasti' | 'BCE / BNB';
  dueDate: string;
  category: 'TVA' | 'Cotisations' | 'IPP / ISOC' | 'Comptes Annuels';
  description: string;
  status: 'urgent' | 'pending' | 'completed';
  actionUrlName?: string;
}

export interface ImmoProperty {
  id: string;
  title: string;
  city: string;
  sourcePortal: string;
  sourceUrl?: string;
  transactionType?: 'sale' | 'rent';
  price: number;
  monthlyCharges?: number;
  rentalGuarantee?: number;
  leaseType?: string;
  surface: number;
  pebGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  pebNote?: string;
  rooms: number;
  estimatedRent?: number;
  registrationDutyRate?: number;
  notaryFeesEstimate?: number;
  grossYield?: number;
  netYield?: number;
  features: string[];
}
