import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '@/services/leads';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, Users, Target, Calendar } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, FunnelChart, Funnel, LabelList } from 'recharts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Lead } from '@/types/lead';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('all');
  const { data: leads, isLoading, isError, error } = useQuery<Lead[], Error>({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  const filteredLeads = useMemo(() => {
    const now = new Date();
    const list = leads || [];
    return list.filter(lead => {
      const date = new Date(lead.Data_Solicitacao);
      
      switch (dateFilter) {
        case 'last30': {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return date >= thirtyDaysAgo;
        }
        case 'last90': {
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return date >= ninetyDaysAgo;
        }
        case 'thisMonth': {
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        case 'thisQuarter': {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const leadQuarter = Math.floor(date.getMonth() / 3);
          return leadQuarter === currentQuarter && date.getFullYear() === now.getFullYear();
        }
        case 'thisYear': {
          return date.getFullYear() === now.getFullYear();
        }
        default: {
          return true;
        }
      }
    });
  }, [leads, dateFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Leads do mês atual
    const leadsDoMes = filteredLeads.filter(lead => {
      const date = new Date(lead.Data_Solicitacao);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    // Valor total em negociação
    const valorEmNegociacao = filteredLeads
      .filter(lead => lead.Status === 'Em Negociação')
      .reduce((sum, lead) => sum + lead.Valor_Total, 0);

    // Distribuição por status
    const statusDistribution = filteredLeads.reduce((acc, lead) => {
      acc[lead.Status] = (acc[lead.Status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Taxa de conversão
    const fechados = filteredLeads.filter(l => l.Status === 'Fechado').length;
    const total = filteredLeads.length;
    const taxaConversao = total > 0 ? (fechados / total) * 100 : 0;

    // Ticket Médio
    const leadsFechados = filteredLeads.filter(l => l.Status === 'Fechado');
    const ticketMedio = leadsFechados.length > 0
      ? leadsFechados.reduce((sum, lead) => sum + lead.Valor_Total, 0) / leadsFechados.length
      : 0;

    // Previsão de Receita (Pipeline Ponderado)
    const probabilidades = {
      'Novo': 0.05,
      'Orçamento Enviado': 0.20,
      'Em Negociação': 0.60,
      'Fechado': 0,
      'Perdido': 0
    };
    const previsaoReceita = filteredLeads
      .filter(l => l.Status !== 'Fechado' && l.Status !== 'Perdido')
      .reduce((sum, lead) => sum + (lead.Valor_Total * probabilidades[lead.Status]), 0);

    return {
      leadsDoMes,
      valorEmNegociacao,
      statusDistribution,
      taxaConversao,
      totalLeads: total,
      ticketMedio,
      previsaoReceita
    };
  }, [filteredLeads]);

  const pieData = Object.entries(stats.statusDistribution).map(([status, count]) => ({
    name: status,
    value: count
  }));

  

  // Volume de Leads por Mês
  const volumePorMes = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const volumes = meses.map((mes, index) => ({
      mes,
      count: filteredLeads.filter(lead => {
        const date = new Date(lead.Data_Solicitacao);
        return date.getMonth() === index;
      }).length
    }));
    return volumes;
  }, [filteredLeads]);

  // Funil de Vendas
  // Paletas de cores estáveis
  const COLORS = useMemo(() => ({
    'Novo': '#3b82f6',
    'Orçamento Enviado': '#a855f7',
    'Em Negociação': '#eab308',
    'Fechado': '#22c55e',
    'Perdido': '#ef4444'
  }), []);
  const CHART_COLORS = useMemo(() => ['#3b82f6', '#a855f7', '#eab308', '#22c55e', '#ef4444', '#f97316', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'], []);

  const funnelData = useMemo(() => {
    const etapas = ['Novo', 'Orçamento Enviado', 'Em Negociação', 'Fechado'];
    return etapas.map(etapa => ({
      name: etapa,
      value: stats.statusDistribution[etapa] || 0,
      fill: COLORS[etapa as keyof typeof COLORS]
    }));
  }, [stats, COLORS]);

  // Tipos de Evento Mais Comuns
  const tiposEventoData = useMemo(() => {
    const tipos = filteredLeads.reduce((acc, lead) => {
      acc[lead.Tipo_Evento] = (acc[lead.Tipo_Evento] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(tipos).map(([tipo, count]) => ({
      name: tipo,
      value: count
    }));
  }, [filteredLeads]);

  // Leads por Localização
  const leadsPorLocal = useMemo(() => {
    const locais = filteredLeads.reduce((acc, lead) => {
      acc[lead.Local_Evento] = (acc[lead.Local_Evento] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(locais)
      .map(([local, count]) => ({ local, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredLeads]);

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
          <div className="flex items-center justify-between mb-6">
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
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral de métricas e indicadores</p>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Selecionar período</TooltipContent>
              </Tooltip>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="last30">Últimos 30 dias</SelectItem>
                  <SelectItem value="last90">Últimos 90 dias</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                  <SelectItem value="thisQuarter">Este trimestre</SelectItem>
                  <SelectItem value="thisYear">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-4 w-28 mb-4" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <Skeleton className="h-5 w-40 mb-4" />
                <Skeleton className="h-64 w-full" />
              </Card>
              <Card className="p-6">
                <Skeleton className="h-5 w-40 mb-4" />
                <Skeleton className="h-64 w-full" />
              </Card>
            </div>
          </>
        )}
        {isError && (
          <div className="text-center text-red-500 py-8">Erro ao carregar dados: {error?.message ?? 'tente novamente'}</div>
        )}
        {/* Stats Cards */}
        {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 hover:border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Leads do Mês</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Users className="w-5 h-5 text-primary" />
                </TooltipTrigger>
                <TooltipContent>Leads do mês</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.leadsDoMes}</p>
            <p className="text-xs text-muted-foreground mt-1">Solicitações recebidas</p>
          </Card>

          <Card className="p-6 hover:border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Em Negociação</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>Valor em negociação</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                minimumFractionDigits: 0
              }).format(stats.valorEmNegociacao)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Valor total em negociação</p>
          </Card>

          <Card className="p-6 hover:border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Target className="w-5 h-5 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>Taxa de conversão</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.taxaConversao.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Leads convertidos em vendas</p>
          </Card>

          <Card className="p-6 hover:border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total de Leads</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </TooltipTrigger>
                <TooltipContent>Total de leads</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalLeads}</p>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </Card>

          <Card className="p-6 hover:border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Ticket Médio por Evento</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DollarSign className="w-5 h-5 text-primary" />
                </TooltipTrigger>
                <TooltipContent>Ticket médio por evento</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                minimumFractionDigits: 0
              }).format(stats.ticketMedio)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Valor médio dos negócios fechados</p>
          </Card>

          <Card className="p-6 hover:border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Previsão de Receita</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>Previsão de receita</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                minimumFractionDigits: 0
              }).format(stats.previsaoReceita)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Pipeline ponderado</p>
          </Card>
        </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Volume de Leads por Mês */}
          <Card className="p-6 min-w-0">
            <h2 className="text-xl font-semibold text-foreground mb-6">Volume de Leads por Mês</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumePorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Funil de Vendas */}
          <Card className="p-6 min-w-0">
            <h2 className="text-xl font-semibold text-foreground mb-6">Funil de Vendas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <RechartsTooltip />
                <Bar dataKey="value" name="Leads">
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribuição por Status */}
          <Card className="p-6 min-w-0">
            <h2 className="text-xl font-semibold text-foreground mb-6">Distribuição por Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Tipos de Evento Mais Comuns */}
          <Card className="p-6 min-w-0">
            <h2 className="text-xl font-semibold text-foreground mb-6">Tipos de Evento Mais Comuns</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tiposEventoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tiposEventoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leads por Localização */}
          <Card className="p-6 min-w-0">
            <h2 className="text-xl font-semibold text-foreground mb-6">Leads por Localização</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsPorLocal} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="local" type="category" width={100} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#a855f7" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Status Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Resumo de Status</h2>
            <div className="space-y-4">
              {Object.entries(stats.statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[status as keyof typeof COLORS] }}
                    />
                    <span className="text-foreground font-medium">{status}</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
