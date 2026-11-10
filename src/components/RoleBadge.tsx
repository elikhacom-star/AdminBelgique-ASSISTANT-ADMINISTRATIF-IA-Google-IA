import React from 'react';
import { Shield, Edit3, Eye, ChevronDown } from 'lucide-react';
import { UserRole, ROLE_DEFINITIONS } from '../types/auth';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showIcon = true, className = '' }) => {
  const config = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.visitor;

  const renderIcon = () => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3 text-amber-400 shrink-0" />;
      case 'editor':
        return <Edit3 className="w-3 h-3 text-blue-400 shrink-0" />;
      case 'visitor':
      default:
        return <Eye className="w-3 h-3 text-slate-400 shrink-0" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${config.badgeClass} ${className}`}
      title={config.description}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};
