import { User, Users, Building2, GraduationCap, Factory } from 'lucide-react';
import type { FarmerType } from '@/hooks/useFarmers';

interface FarmerTypeIconProps {
  type: FarmerType;
  className?: string;
}

export const FarmerTypeIcon = ({ type, className = "h-5 w-5" }: FarmerTypeIconProps) => {
  switch (type) {
    case 'individual':
      return <User className={className} />;
    case 'family':
      return <Users className={className} />;
    case 'cooperative':
      return <Building2 className={className} />;
    case 'field_school':
      return <GraduationCap className={className} />;
    case 'company':
      return <Factory className={className} />;
    default:
      return <User className={className} />;
  }
};

export const getFarmerTypeLabel = (type: FarmerType): string => {
  const labels: Record<FarmerType, string> = {
    individual: 'Pequeno Agricultor',
    family: 'Agricultura Familiar',
    cooperative: 'Cooperativa',
    field_school: 'Escola de Campo',
    company: 'Empresa/Grande Produtor',
  };
  return labels[type] || type;
};

export const getFarmerTypeColor = (type: FarmerType): string => {
  const colors: Record<FarmerType, string> = {
    individual: 'bg-blue-100 text-blue-800',
    family: 'bg-green-100 text-green-800',
    cooperative: 'bg-purple-100 text-purple-800',
    field_school: 'bg-amber-100 text-amber-800',
    company: 'bg-slate-100 text-slate-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};
