import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Lead, LeadStatus } from '@/types/lead';
import { fetchLeadById, updateLead } from '@/services/leads';

const EditLead = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: lead, isLoading, isError, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLeadById(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) {
      setForm({
        Nome: lead.Nome,
        Telefone: lead.Telefone,
        Link_WhatsApp: lead.Link_WhatsApp,
        Status: lead.Status,
        Data_Solicitacao: lead.Data_Solicitacao,
        Tipo_Evento: lead.Tipo_Evento,
        Data_Evento: lead.Data_Evento,
        Num_Convidados: lead.Num_Convidados,
        Local_Evento: lead.Local_Evento,
        Valor_Gelato: lead.Valor_Gelato,
        Taxa_Deslocamento: lead.Taxa_Deslocamento,
        Mao_De_Obra: lead.Mao_De_Obra,
        Valor_Total: lead.Valor_Total,
        Kg_Gelato: lead.Kg_Gelato,
        Num_Atendentes: lead.Num_Atendentes,
      });
    }
  }, [lead]);

  const mutation = useMutation({
    mutationFn: () => updateLead(id!, form),
    onSuccess: (updated) => {
      toast.success('Lead atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      navigate(`/lead/${updated.id}`);
    },
    onError: (e: Error) => toast.error(`Erro ao atualizar lead: ${e.message}`),
  });

  const handleChange = <K extends keyof Partial<Lead>>(field: K, value: Partial<Lead>[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  // Calcula automaticamente o Valor_Total com base em Gelato + Deslocamento + Mão de Obra
  useEffect(() => {
    const gelato = Number(form.Valor_Gelato || 0);
    const desloc = Number(form.Taxa_Deslocamento || 0);
    const mao = Number(form.Mao_De_Obra || 0);
    const total = gelato + desloc + mao;
    setForm(prev => (prev.Valor_Total === total ? prev : { ...prev, Valor_Total: total }));
  }, [form.Valor_Gelato, form.Taxa_Deslocamento, form.Mao_De_Obra]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <header className="bg-card/60 backdrop-blur-md border-b border-border/60 shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-7 w-40" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Lead não encontrado</h2>
          <Button onClick={() => navigate('/')}>Voltar para lista</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <header className="bg-card/60 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={() => navigate(`/lead/${id}`)}>
                Voltar
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voltar para detalhes</TooltipContent>
          </Tooltip>
          <h1 className="text-2xl font-bold text-foreground">Editar Lead</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Nome" value={form.Nome || ''} onChange={e => handleChange('Nome', e.target.value)} />
            <Input placeholder="Telefone" value={form.Telefone || ''} onChange={e => handleChange('Telefone', e.target.value)} />
            <Input placeholder="Link WhatsApp" value={form.Link_WhatsApp || ''} onChange={e => handleChange('Link_WhatsApp', e.target.value)} />
            <Select value={form.Status as LeadStatus} onValueChange={v => handleChange('Status', v as LeadStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Orçamento Enviado">Orçamento Enviado</SelectItem>
                <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
                <SelectItem value="Perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" placeholder="Data Solicitação" value={form.Data_Solicitacao || ''} onChange={e => handleChange('Data_Solicitacao', e.target.value)} />
            <Input placeholder="Tipo de Evento" value={form.Tipo_Evento || ''} onChange={e => handleChange('Tipo_Evento', e.target.value)} />
            <Input type="date" placeholder="Data do Evento" value={form.Data_Evento || ''} onChange={e => handleChange('Data_Evento', e.target.value)} />
            <Input type="number" placeholder="Número de Convidados" value={form.Num_Convidados ?? 0} onChange={e => handleChange('Num_Convidados', Number(e.target.value))} />
            <Input placeholder="Local do Evento" value={form.Local_Evento || ''} onChange={e => handleChange('Local_Evento', e.target.value)} />
            <Input type="number" placeholder="Valor Gelato" value={form.Valor_Gelato ?? 0} onChange={e => handleChange('Valor_Gelato', Number(e.target.value))} />
            <Input type="number" placeholder="Taxa de Deslocamento" value={form.Taxa_Deslocamento ?? 0} onChange={e => handleChange('Taxa_Deslocamento', Number(e.target.value))} />
            <Input type="number" placeholder="Mão de Obra" value={form.Mao_De_Obra ?? 0} onChange={e => handleChange('Mao_De_Obra', Number(e.target.value))} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Input type="number" placeholder="Valor Total (automático)" value={form.Valor_Total ?? 0} readOnly className="bg-muted" />
              </TooltipTrigger>
              <TooltipContent>Somatório de Gelato + Deslocamento + Mão de Obra</TooltipContent>
            </Tooltip>
            <Input type="number" placeholder="Kg de Gelato" value={form.Kg_Gelato ?? 0} onChange={e => handleChange('Kg_Gelato', Number(e.target.value))} />
            <Input type="number" placeholder="Número de Atendentes" value={form.Num_Atendentes ?? 0} onChange={e => handleChange('Num_Atendentes', Number(e.target.value))} />

            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" onClick={() => navigate(`/lead/${id}`)}>Cancelar</Button>
                </TooltipTrigger>
                <TooltipContent>Cancelar alterações</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={mutation.isPending}>Salvar</Button>
                </TooltipTrigger>
                <TooltipContent>Salvar alterações</TooltipContent>
              </Tooltip>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default EditLead;
