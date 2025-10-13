import { useParams, useNavigate, Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeadById, updateLeadStatus, updateLeadNotes, updateLeadNextStep, deleteLead } from '@/services/leads';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageCircle, Calendar, MapPin, Users, IceCream, Truck, HandCoins, User as UserIcon, FileText, Target } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { LeadStatus, Lead } from '@/types/lead';
import { toast } from 'sonner';
import Textarea from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: lead, isLoading, isError, error } = useQuery<Lead | null, Error>({
    queryKey: ['lead', id],
    queryFn: () => fetchLeadById(id!),
    enabled: !!id,
  });
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead?.Status || 'Novo');
  const [notas, setNotas] = useState(lead?.Notas || '');
  const [newNote, setNewNote] = useState('');
  const [proximoPassoData, setProximoPassoData] = useState(lead?.Proximo_Passo_Data || '');
  const [proximoPassoDescricao, setProximoPassoDescricao] = useState(lead?.Proximo_Passo_Descricao || '');

  const statusMutation = useMutation({
    mutationFn: (newStatus: LeadStatus) => updateLeadStatus(id!, newStatus),
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (e: Error) => toast.error(`Erro ao atualizar status: ${e.message}`),
  });

  const notesMutation = useMutation({
    mutationFn: (notes: string) => updateLeadNotes(id!, notes),
    onSuccess: () => {
      toast.success('Notas salvas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (e: Error) => toast.error(`Erro ao salvar notas: ${e.message}`),
  });

  const nextStepMutation = useMutation({
    mutationFn: (next: { Proximo_Passo_Data?: string; Proximo_Passo_Descricao?: string }) =>
      updateLeadNextStep(id!, next),
    onSuccess: () => {
      toast.success('Próxima ação salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (e: Error) => toast.error(`Erro ao salvar próxima ação: ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteLead(id!),
    onSuccess: () => {
      toast.success('Lead excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigate('/');
    },
    onError: (e: Error) => toast.error(`Erro ao excluir lead: ${e.message}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <header className="bg-card/60 backdrop-blur-md border-b border-border/60 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-7 w-72" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-12 w-full" />
              </Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-64 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-56 mb-4" />
                <Skeleton className="h-24 w-full" />
                <div className="flex justify-end mt-4">
                  <Skeleton className="h-10 w-28" />
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end mt-4 gap-2">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </Card>
            </div>
          </div>
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    setCurrentStatus(newStatus);
    statusMutation.mutate(newStatus);
  };

  const handleWhatsAppClick = () => {
    window.open(lead.Link_WhatsApp, '_blank');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const noteWithTimestamp = `[${timestamp}] ${newNote}\n`;
    const updatedNotes = notas ? `${notas}${noteWithTimestamp}` : noteWithTimestamp;
    
    setNotas(updatedNotes);
    setNewNote('');
    notesMutation.mutate(updatedNotes);
  };

  const handleSaveProximoPasso = () => {
    nextStepMutation.mutate({
      Proximo_Passo_Data: proximoPassoData,
      Proximo_Passo_Descricao: proximoPassoDescricao,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ArrowLeft className="w-4 h-4 mr-2" />
              </TooltipTrigger>
              <TooltipContent>Voltar</TooltipContent>
            </Tooltip>
            Voltar para lista
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Breadcrumb className="mb-2">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/">Início</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Detalhes do Lead</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-3xl font-bold text-foreground mb-2">{lead.Nome}</h1>
              <p className="text-muted-foreground">{lead.Telefone}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:justify-end">
              <StatusBadge status={currentStatus} />
              <Button variant="outline" onClick={() => navigate(`/lead/${lead.id}/edit`)} className="w-full sm:w-auto">
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleteMutation.isPending} className="w-full sm:w-auto">
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação excluirá o lead "{lead.Nome}" de forma permanente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate()}>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contato */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Contato
              </h2>
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contatar no WhatsApp
              </Button>
            </Card>

            {/* Informações do Evento */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Calendar className="w-5 h-5 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>Informações do evento</TooltipContent>
                </Tooltip>
                Informações do Evento
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IceCream className="w-5 h-5 text-primary mt-1" />
                    </TooltipTrigger>
                    <TooltipContent>Tipo de evento</TooltipContent>
                  </Tooltip>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Evento</p>
                    <p className="font-medium text-foreground">{lead.Tipo_Evento}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Calendar className="w-5 h-5 text-primary mt-1" />
                    </TooltipTrigger>
                    <TooltipContent>Data do evento</TooltipContent>
                  </Tooltip>
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Evento</p>
                    <p className="font-medium text-foreground">{formatDate(lead.Data_Evento)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Users className="w-5 h-5 text-primary mt-1" />
                    </TooltipTrigger>
                    <TooltipContent>Número de convidados</TooltipContent>
                  </Tooltip>
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Convidados</p>
                    <p className="font-medium text-foreground">{lead.Num_Convidados} pessoas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                    </TooltipTrigger>
                    <TooltipContent>Local do evento</TooltipContent>
                  </Tooltip>
                  <div>
                    <p className="text-sm text-muted-foreground">Local do Evento</p>
                    <p className="font-medium text-foreground">{lead.Local_Evento}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <UserIcon className="w-5 h-5 text-primary mt-1" />
                    </TooltipTrigger>
                    <TooltipContent>Atendentes</TooltipContent>
                  </Tooltip>
                  <div>
                    <p className="text-sm text-muted-foreground">Atendentes</p>
                    <p className="font-medium text-foreground">{lead.Num_Atendentes} atendentes</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Resumo Financeiro */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Resumo Financeiro</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <IceCream className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Gelato ({lead.Kg_Gelato}kg)</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.Valor_Gelato)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Taxa de Deslocamento</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.Taxa_Deslocamento)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <HandCoins className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Mão de Obra</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.Mao_De_Obra)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-semibold text-foreground">Valor Total</span>
                  <span className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.Valor_Total)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Gerenciamento de Status */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Gerenciar Status</h2>
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">Status Atual</label>
                <Select value={currentStatus} onValueChange={(value) => handleStatusChange(value as LeadStatus)}>
                  <SelectTrigger>
                    <SelectValue />
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
            </Card>

            {/* Próxima Ação */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Target className="w-5 h-5 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>Próxima ação</TooltipContent>
                </Tooltip>
                Próxima Ação
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Data</label>
                  <Input
                    type="date"
                    value={proximoPassoData}
                    onChange={(e) => setProximoPassoData(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Descrição</label>
                  <Textarea
                    value={proximoPassoDescricao}
                    onChange={(e) => setProximoPassoDescricao(e.target.value)}
                    placeholder="Descreva a próxima ação..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveProximoPasso} className="w-full">
                  Salvar Próxima Ação
                </Button>
              </div>
            </Card>

            {/* Informações Adicionais */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Informações Adicionais</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Data da Solicitação</p>
                  <p className="font-medium text-foreground">{formatDate(lead.Data_Solicitacao)}</p>
                </div>
              </div>
            </Card>

            {/* Histórico e Notas */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Histórico e Notas
              </h2>
              <div className="space-y-4">
                {notas && (
                  <div className="bg-muted/50 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{notas}</pre>
                  </div>
                )}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Nova Nota</label>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Digite sua anotação aqui..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleAddNote} className="w-full">
                  Adicionar Nota
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadDetails;
