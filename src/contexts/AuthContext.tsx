import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole, RolePermissions, ROLE_DEFINITIONS } from '../types/auth';

interface AuthContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  currentRole: UserRole;
  permissions: RolePermissions;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, displayName: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updatePassword: (newPass: string) => Promise<{ success: boolean; message: string }>;
  canManageUsers: boolean;
  canManageContent: boolean;
  canManageSettings: boolean;
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
}

// Pre-seeded Belgian Administrative users for 1-click test and demonstrations
export const PRESET_USERS: Record<UserRole, AppUser> = {
  admin: {
    uid: 'admin-001',
    email: 'admin@adminbelgique.com',
    displayName: 'Marc Vandewalle (Super Admin)',
    role: 'admin',
    status: 'active',
    company: 'elikacces IT Solutions / AdminBelgique SPRL',
    bceNumber: '0842.123.456',
    createdAt: '2026-01-15',
    lastLoginAt: 'Aujourd\'hui à 17:30',
  },
  editor: {
    uid: 'editor-002',
    email: 'redaction@adminbelgique.com',
    displayName: 'Sophie De Smet (Éditrice Juridique)',
    role: 'editor',
    status: 'active',
    company: 'Cabinet Conseil Fiduciaire Bruxelles',
    bceNumber: '0712.987.654',
    createdAt: '2026-03-20',
    lastLoginAt: 'Hier à 14:15',
  },
  visitor: {
    uid: 'visitor-003',
    email: 'visiteur.demo@gmail.com',
    displayName: 'Lucas Peeters (Citoyen Visiteur)',
    role: 'visitor',
    status: 'active',
    company: 'Particulier',
    createdAt: '2026-05-10',
    lastLoginAt: 'À l\'instant',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with default Admin session for the owner (elikacces IT Solutions / Elikhacom@gmail.com)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('adminbelgique_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return PRESET_USERS.admin;
      }
    }
    return PRESET_USERS.admin;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('adminbelgique_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('adminbelgique_auth_user');
    }
  }, [currentUser]);

  const currentRole: UserRole = currentUser?.role || 'visitor';
  const permissions: RolePermissions = ROLE_DEFINITIONS[currentRole].permissions;

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Find matching preset or create active user session
    const matched = Object.values(PRESET_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (matched) {
      setCurrentUser(matched);
      return true;
    }

    // Default registration if not found
    const newUser: AppUser = {
      uid: `usr-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      role: 'visitor', // New sign-ups start as visitor unless promoted by admin
      status: 'active',
      createdAt: new Date().toLocaleDateString('fr-BE'),
      lastLoginAt: 'À l\'instant',
    };
    setCurrentUser(newUser);
    return true;
  };

  const register = async (email: string, displayName: string, role: UserRole = 'visitor'): Promise<boolean> => {
    const newUser: AppUser = {
      uid: `usr-${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      role,
      status: 'active',
      createdAt: new Date().toLocaleDateString('fr-BE'),
      lastLoginAt: 'À l\'instant',
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (PRESET_USERS[newRole]) {
      setCurrentUser(PRESET_USERS[newRole]);
    } else if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  const updatePassword = async (newPass: string) => {
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'Le mot de passe doit comporter au moins 6 caractères.' };
    }
    return { success: true, message: 'Mot de passe mis à jour avec succès.' };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        currentRole,
        permissions,
        login,
        register,
        logout,
        switchRole,
        updatePassword,
        canManageUsers: permissions.manage_users,
        canManageContent: permissions.manage_content,
        canManageSettings: permissions.manage_settings,
        canCreateContent: permissions.can_create_content,
        canEditContent: permissions.can_edit_content,
        canDeleteContent: permissions.can_delete_content,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
