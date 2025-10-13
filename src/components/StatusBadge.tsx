import { LeadStatus } from '@/types/lead';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: LeadStatus;
}

const statusConfig: Record<LeadStatus, { className: string, label: string }> = {
  'Novo': { className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30', label: 'Novo' },
  'Orçamento Enviado': { className: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30', label: 'Orçamento Enviado' },
  'Em Negociação': { className: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30', label: 'Em Negociação' },
  'Fechado': { className: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30', label: 'Fechado' },
  'Perdido': { className: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30', label: 'Perdido' }
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge className={`font-medium border ${config.className}`}>
      {config.label}
    </Badge>
  );
};
