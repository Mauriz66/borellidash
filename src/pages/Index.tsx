import { LeadCard } from '@/components/LeadCard';
import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '@/services/leads';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, IceCream, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useMemo } from 'react';
import { LeadStatus, Lead } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { compareDateAsc, compareDateDesc } from '@/lib/date';

const Index = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('data_solicitacao_desc');
  const { data: leads, isLoading, isError, error } = useQuery<Lead[], Error>({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  const filteredAndSortedLeads = useMemo(() => {
    const items = leads || [];
    const filtered = items.filter(lead => {
      const matchesSearch = lead.Nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.Tipo_Evento.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.Status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'data_solicitacao_desc':
          return compareDateDesc(a.Data_Solicitacao, b.Data_Solicitacao);
        case 'data_solicitacao_asc':
          return compareDateAsc(a.Data_Solicitacao, b.Data_Solicitacao);
        case 'data_evento_asc':
          return compareDateAsc(a.Data_Evento, b.Data_Evento);
        case 'data_evento_desc':
          return compareDateDesc(a.Data_Evento, b.Data_Evento);
        default:
          return 0;
      }
    });

    return filtered;
  }, [leads, searchTerm, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Breadcrumb className="mb-2">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Início</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-3 mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IceCream className="w-8 h-8 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>Gelato Borelli</TooltipContent>
                </Tooltip>
                <h1 className="text-3xl font-bold text-foreground">Gelato Borelli</h1>
              </div>
              <p className="text-muted-foreground">Portal de Gestão de Leads</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => navigate('/new-lead')} className="gap-2 w-full sm:w-auto">
                    Novo Lead
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Novo lead</TooltipContent>
              </Tooltip>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="gap-2 w-full sm:w-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <BarChart3 className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>Dashboard</TooltipContent>
              </Tooltip>
              Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent>Buscar</TooltipContent>
            </Tooltip>
            <Input
              placeholder="Buscar por nome ou tipo de evento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Novo">Novo</SelectItem>
              <SelectItem value="Orçamento Enviado">Orçamento Enviado</SelectItem>
              <SelectItem value="Em Negociação">Em Negociação</SelectItem>
              <SelectItem value="Fechado">Fechado</SelectItem>
              <SelectItem value="Perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data_solicitacao_desc">Solicitação (Mais Recente)</SelectItem>
              <SelectItem value="data_solicitacao_asc">Solicitação (Mais Antiga)</SelectItem>
              <SelectItem value="data_evento_asc">Data Evento (Mais Próximo)</SelectItem>
              <SelectItem value="data_evento_desc">Data Evento (Mais Distante)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <>
            {/* Skeleton dos cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
            {/* Skeleton da grade de leads */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {isError && (
          <div className="text-center text-red-500 py-8">Erro ao carregar leads: {error?.message ?? 'tente novamente'}</div>
        )}

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total de Leads</p>
              <p className="text-2xl font-bold text-foreground">{leads?.length ?? 0}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Novos</p>
              <p className="text-2xl font-bold text-primary">{(leads || []).filter(l => l.Status === 'Novo').length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Em Negociação</p>
              <p className="text-2xl font-bold text-secondary">{(leads || []).filter(l => l.Status === 'Em Negociação').length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Fechados</p>
              <p className="text-2xl font-bold text-accent-foreground">{(leads || []).filter(l => l.Status === 'Fechado').length}</p>
            </div>
          </div>
        )}

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(!isLoading && !isError && filteredAndSortedLeads.length > 0) ? (
            filteredAndSortedLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))
          ) : (
            !isLoading && (
              <div className="col-span-full text-center py-16">
                <div className="mx-auto mb-4">
                  <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Sem resultados</h3>
                <p className="text-muted-foreground mb-4">Tente ajustar a busca, filtros ou ordenação.</p>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSortBy('data_solicitacao_desc'); }}>Limpar filtros</Button>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
