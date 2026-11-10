import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  KeyRound,
  History,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AppUser, UserRole, AuditLogEntry, ROLE_DEFINITIONS } from '../types/auth';
import { RoleBadge } from './RoleBadge';

export const UserManagementView: React.FC = () => {
  const { currentUser, currentRole, canManageUsers, switchRole } = useAuth();

  const [usersList, setUsersList] = useState<AppUser[]>([
    {
      uid: 'admin-001',
      email: 'admin@adminbelgique.com',
      displayName: 'Marc Vandewalle',
      role: 'admin',
      status: 'active',
      company: 'AdminBelgique SPRL / elikacces IT',
      bceNumber: '0842.123.456',
      createdAt: '15/01/2026',
      lastLoginAt: 'Aujourd\'hui à 17:30',
    },
    {
      uid: 'editor-002',
      email: 'redaction@adminbelgique.com',
      displayName: 'Sophie De Smet',
      role: 'editor',
      status: 'active',
      company: 'Cabinet Juridique & Fiduciaire',
      bceNumber: '0712.987.654',
      createdAt: '20/03/2026',
      lastLoginAt: 'Hier à 14:15',
    },
    {
      uid: 'visitor-003',
      email: 'visiteur.demo@gmail.com',
      displayName: 'Lucas Peeters',
      role: 'visitor',
      status: 'active',
      company: 'Citoyen Particulier',
      createdAt: '10/05/2026',
      lastLoginAt: 'À l\'instant',
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '08/11/2026 17:35:12',
      actorEmail: 'admin@adminbelgique.com',
      actorRole: 'admin',
      action: 'ROLE_CHANGED',
      details: 'Attribution du rôle Éditeur à jean.dupont@immoconsult.be',
      targetUserEmail: 'jean.dupont@immoconsult.be',
    },
    {
      id: 'log-2',
      timestamp: '08/11/2026 17:30:05',
      actorEmail: 'admin@adminbelgique.com',
      actorRole: 'admin',
      action: 'USER_LOGIN',
      details: 'Connexion sécurisée réussie (Session Administrateur active)',
    },
  ]);

  const [backendSyncStatus, setBackendSyncStatus] = useState<string>('Synchronisé');

  // Sync with backend API
  const fetchBackendData = () => {
    if (canManageUsers) {
      fetch('/api/admin/users', {
        headers: { 'x-user-role': currentRole },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.users) {
            setUsersList(data.users);
            setBackendSyncStatus('Synchronisé en direct avec le serveur back-end');
          }
        })
        .catch(() => setBackendSyncStatus('Mode local autonome'));

      fetch('/api/admin/audit-logs', {
        headers: { 'x-user-role': currentRole },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.logs) {
            setAuditLogs(data.logs);
          }
        })
        .catch(() => {});
    }
  };

  React.useEffect(() => {
    fetchBackendData();
  }, [currentRole, canManageUsers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('editor');

  const handleRoleChange = async (uid: string, targetRole: UserRole) => {
    if (!canManageUsers) return;

    // Optimistic update
    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: targetRole } : u))
    );

    try {
      const res = await fetch(`/api/admin/users/${uid}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
          'x-user-email': currentUser?.email || 'admin@adminbelgique.com',
        },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        fetchBackendData();
      }
    } catch (err) {
      console.warn('Backend sync fallback');
    }
  };

  const handleToggleStatus = async (uid: string) => {
    if (!canManageUsers) return;

    const targetUser = usersList.find((u) => u.uid === uid);
    const newStatus = targetUser?.status === 'active' ? 'suspended' : 'active';

    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, status: newStatus } : u))
    );

    try {
      const res = await fetch(`/api/admin/users/${uid}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
          'x-user-email': currentUser?.email || 'admin@adminbelgique.com',
        },
      });
      if (res.ok) {
        fetchBackendData();
      }
    } catch (err) {
      console.warn('Backend sync fallback');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!canManageUsers) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    setUsersList((prev) => prev.filter((u) => u.uid !== uid));

    try {
      await fetch(`/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentRole,
          'x-user-email': currentUser?.email || 'admin@adminbelgique.com',
        },
      });
      fetchBackendData();
    } catch (err) {
      console.warn('Backend sync fallback');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    const created: AppUser = {
      uid: `usr-${Date.now()}`,
      email: newEmail,
      displayName: newName,
      role: newRole,
      status: 'active',
      createdAt: new Date().toLocaleDateString('fr-BE'),
      lastLoginAt: 'Jamais connecté',
    };

    setUsersList((prev) => [created, ...prev]);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
          'x-user-email': currentUser?.email || 'admin@adminbelgique.com',
        },
        body: JSON.stringify({
          email: newEmail,
          displayName: newName,
          role: newRole,
        }),
      });
      if (res.ok) {
        fetchBackendData();
      }
    } catch (err) {
      console.warn('Backend sync fallback');
    }

    setShowAddUserModal(false);
    setNewEmail('');
    setNewName('');
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Shield className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white">
                Gestion des Utilisateurs & Contrôle d'Accès (RBAC)
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Gérez les privilèges d'accès pour les rôles **Administrateur**, **Éditeur** et **Visiteur** sur l'ensemble des modules back-end et front-end d'AdminBelgique.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Sécurité RBAC Active
            </span>
          </div>
        </div>
      </div>

      {/* Warning if current active role is not Admin */}
      {!canManageUsers && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-white">Mode consultation (Permissions restreintes)</div>
            <p>
              Votre rôle actuel est <strong>{ROLE_DEFINITIONS[currentRole].label}</strong>. Seul le rôle{' '}
              <strong>Administrateur</strong> a la permission de modifier les rôles, d'ajouter des utilisateurs et de consulter les journaux d'audit.
            </p>
            <div className="pt-2">
              <button
                onClick={() => switchRole('admin')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Passer en mode Administrateur (Test Démo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Matrix Overview */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-blue-400" />
          <span>Matrice des Permissions Back-End & Front-End</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-300">
              <tr>
                <th className="p-3 font-semibold">Section / Domaine</th>
                <th className="p-3 font-semibold">Permission Spécifique</th>
                <th className="p-3 text-center">
                  <RoleBadge role="admin" />
                </th>
                <th className="p-3 text-center">
                  <RoleBadge role="editor" />
                </th>
                <th className="p-3 text-center">
                  <RoleBadge role="visitor" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-medium text-white">Back-end : Utilisateurs</td>
                <td className="p-3 text-slate-400">Création, modification des rôles, blocage</td>
                <td className="p-3 text-center text-emerald-400 font-bold">Autorisé</td>
                <td className="p-3 text-center text-rose-400 font-bold">Refusé (403)</td>
                <td className="p-3 text-center text-rose-400 font-bold">Refusé (403)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-medium text-white">Back-end : Contenu</td>
                <td className="p-3 text-slate-400">Génération documents, calculs, analyses</td>
                <td className="p-3 text-center text-emerald-400 font-bold">Autorisé (Total)</td>
                <td className="p-3 text-center text-emerald-400 font-bold">Autorisé (Édition)</td>
                <td className="p-3 text-center text-rose-400 font-bold">Lecture seule</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-medium text-white">Back-end : Paramètres</td>
                <td className="p-3 text-slate-400">Clés API, TVA entreprise, Webhooks</td>
                <td className="p-3 text-center text-emerald-400 font-bold">Autorisé</td>
                <td className="p-3 text-center text-amber-400 font-bold">Lecture seule</td>
                <td className="p-3 text-center text-rose-400 font-bold">Refusé</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-medium text-white">Front-end : Visualisation</td>
                <td className="p-3 text-slate-400">Affichage de tous les modules & tableaux</td>
                <td className="p-3 text-center text-emerald-400 font-bold">Accès complet</td>
                <td className="p-3 text-center text-emerald-400 font-bold">Accès complet</td>
                <td className="p-3 text-center text-amber-400 font-bold">Accès restreint</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-medium text-white">Front-end : Modification</td>
                <td className="p-3 text-slate-400">Boutons de création, modification, export</td>
                <td className="p-3 text-center text-emerald-400 font-bold">Actif</td>
                <td className="p-3 text-center text-emerald-400 font-bold">Actif</td>
                <td className="p-3 text-center text-rose-400 font-bold">Désactivé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Utilisateurs Enregistrés & Attribution des Rôles</span>
            </h2>
            <p className="text-xs text-slate-400">
              Modifiez le rôle d'un compte pour répercuter immédiatement ses droits dans le système
            </p>
          </div>

          {canManageUsers && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un Utilisateur</span>
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tous les Rôles</option>
            <option value="admin">Administrateurs uniquement</option>
            <option value="editor">Éditeurs uniquement</option>
            <option value="visitor">Visiteurs uniquement</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium">Nom & Identifiant</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Rôle Actuel</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Dernière Connexion</th>
                <th className="pb-3 font-medium text-right">Actions de Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-white">{u.displayName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.uid}</div>
                  </td>
                  <td className="py-3 text-slate-300">{u.email}</td>
                  <td className="py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {u.status === 'active' ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{u.lastLoginAt}</td>
                  <td className="py-3 text-right">
                    {canManageUsers ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="admin">Administrateur</option>
                          <option value="editor">Éditeur</option>
                          <option value="visitor">Visiteur</option>
                        </select>
                        <button
                          onClick={() => handleToggleStatus(u.uid)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                          title={u.status === 'active' ? 'Suspendre le compte' : 'Activer le compte'}
                        >
                          {u.status === 'active' ? (
                            <UserX className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.uid)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Supprimer définitivement l'utilisateur"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Lecture seule</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Audit Logs Section (Admin Only) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              Journal d'Audit de Sécurité & Modifications de Rôles
            </h2>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
            Immuable • Conforme RGPD
          </span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
                <span className="text-slate-200 font-medium">{log.details}</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px]">
                <span className="text-slate-400">Acteur : {log.actorEmail}</span>
                <RoleBadge role={log.actorRole} showIcon={false} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add New User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Créer un Nouvel Utilisateur</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nom complet ou raison sociale</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Alexandre Dubois"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Adresse email professionnelle</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nom@cabinet.be"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Attribution du Rôle RBAC</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  <option value="admin">Administrateur (Accès total back & front)</option>
                  <option value="editor">Éditeur (Création et modification de contenu)</option>
                  <option value="visitor">Visiteur (Consultation en lecture seule)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
