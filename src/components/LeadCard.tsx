import { Lead, LeadStatus } from '@/types/lead';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteLead, updateLeadStatus } from '@/services/leads';
import { StatusBadge } from './StatusBadge';
import { Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard = ({ lead }: LeadCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LeadStatus>(lead.Status);

  const deleteMutation = useMutation<void, Error, void, { previousLeads?: Lead[] }>({
    mutationFn: () => deleteLead(lead.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(['leads'], previousLeads.filter(l => l.id !== lead.id));
      }
      return { previousLeads };
    },
    onSuccess: () => {
      toast.success('Lead excluído com sucesso!');
    },
    onError: (e: Error, _vars, context) => {
      toast.error(`Erro ao excluir lead: ${e.message}`);
      if (context?.previousLeads) {
        queryClient.setQueryData<Lead[]>(['leads'], context.previousLeads);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const statusMutation = useMutation<Lead, Error, LeadStatus>({
    mutationFn: (newStatus: LeadStatus) => updateLeadStatus(lead.id, newStatus),
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (e: Error) => toast.error(`Erro ao atualizar status: ${e.message}`),
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card 
      className="p-6 cursor-pointer transition-all hover:shadow-lg border-border bg-card sm:min-w-[320px]"
      onClick={() => navigate(`/lead/${lead.id}`)}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-card-foreground">{lead.Nome}</h3>
            <p className="text-sm text-muted-foreground">{lead.Tipo_Evento}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:self-start" onClick={(e) => e.stopPropagation()}>
          <StatusBadge status={status} />
          <Select
            value={status}
            onValueChange={(val) => {
              const newStatus = val as LeadStatus;
              setStatus(newStatus);
              statusMutation.mutate(newStatus);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Alterar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Novo">Novo</SelectItem>
              <SelectItem value="Orçamento Enviado">Orçamento Enviado</SelectItem>
              <SelectItem value="Em Negociação">Em Negociação</SelectItem>
              <SelectItem value="Fechado">Fechado</SelectItem>
              <SelectItem value="Perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span className="text-sm">{formatDate(lead.Data_Evento)}</span>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center justify-between sm:block">
          <p className="text-xs text-muted-foreground">Valor Total</p>
          <p className="text-lg font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.Valor_Total)}
          </p>
        </div>
        <div className="text-right sm:text-left">
          <p className="text-xs text-muted-foreground">Convidados</p>
          <p className="text-lg font-semibold text-card-foreground">{lead.Num_Convidados}</p>
        </div>
      </div>
    </Card>
  );
};
