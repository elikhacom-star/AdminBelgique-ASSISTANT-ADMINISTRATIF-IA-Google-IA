export type UserRole = 'admin' | 'editor' | 'visitor';

export interface RolePermissions {
  // Backend permissions
  manage_users: boolean;      // Gestion des utilisateurs (création, rôles, suspension)
  manage_content: boolean;    // Gestion du contenu (créer, éditer, supprimer)
  manage_settings: boolean;   // Paramètres système, clés d'API, TVA de l'entreprise
  view_audit_logs: boolean;   // Consultation du journal d'audit de sécurité

  // Frontend permissions
  can_view_all: boolean;      // Visualisation de l'ensemble des écrans et métriques
  can_create_content: boolean;// Création de nouveaux dossiers, baux et analyses
  can_edit_content: boolean;  // Modification des contenus existants
  can_delete_content: boolean;// Suppression définitive de dossiers ou documents
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: 'active' | 'suspended';
  company?: string;
  bceNumber?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: 'USER_REGISTERED' | 'USER_LOGIN' | 'ROLE_CHANGED' | 'PASSWORD_RESET' | 'CONTENT_DELETED' | 'SETTINGS_UPDATED';
  details: string;
  targetUserEmail?: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, {
  label: string;
  description: string;
  badgeClass: string;
  permissions: RolePermissions;
}> = {
  admin: {
    label: 'Administrateur',
    description: 'Accès total aux utilisateurs, contenus, paramètres système et journaux d’audit.',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    permissions: {
      manage_users: true,
      manage_content: true,
      manage_settings: true,
      view_audit_logs: true,
      can_view_all: true,
      can_create_content: true,
      can_edit_content: true,
      can_delete_content: true,
    },
  },
  editor: {
    label: 'Éditeur',
    description: 'Création et modification des dossiers, baux, analyses et descriptifs. Pas d’accès aux utilisateurs.',
    badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    permissions: {
      manage_users: false,
      manage_content: true,
      manage_settings: false,
      view_audit_logs: false,
      can_view_all: true,
      can_create_content: true,
      can_edit_content: true,
      can_delete_content: false,
    },
  },
  visitor: {
    label: 'Visiteur',
    description: 'Accès en lecture seule. Peut consulter les simulations et documents publics sans modification.',
    badgeClass: 'bg-slate-700 text-slate-300 border border-slate-600',
    permissions: {
      manage_users: false,
      manage_content: false,
      manage_settings: false,
      view_audit_logs: false,
      can_view_all: false,
      can_create_content: false,
      can_edit_content: false,
      can_delete_content: false,
    },
  },
};
