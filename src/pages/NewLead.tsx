import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createLead } from '@/services/leads';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LeadStatus, Lead } from '@/types/lead';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toLocalYMD } from '@/lib/date';

const schema = z.object({
  Nome: z.string().min(2, 'Informe o nome'),
  Telefone: z.string().min(8, 'Informe o telefone'),
  Link_WhatsApp: z.string().url('Informe uma URL válida').optional().or(z.literal('')),
  Status: z.enum(['Novo', 'Orçamento Enviado', 'Em Negociação', 'Fechado', 'Perdido']),
  Data_Solicitacao: z.string().min(10, 'Informe a data'),
  Tipo_Evento: z.string().min(2, 'Informe o tipo de evento'),
  Data_Evento: z.string().min(10, 'Informe a data do evento'),
  Num_Convidados: z.coerce.number().min(1, 'Mínimo 1'),
  Local_Evento: z.string().min(2, 'Informe o local'),
  Valor_Gelato: z.coerce.number().min(0, 'Não pode ser negativo'),
  Taxa_Deslocamento: z.coerce.number().min(0, 'Não pode ser negativo'),
  Mao_De_Obra: z.coerce.number().min(0, 'Não pode ser negativo'),
  Valor_Total: z.coerce.number().min(0, 'Não pode ser negativo').optional(),
  Kg_Gelato: z.coerce.number().min(0, 'Não pode ser negativo'),
  Num_Atendentes: z.coerce.number().min(0, 'Não pode ser negativo'),
  Notas: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const NewLead = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const formatPhoneBR = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const parts = [] as string[];
    if (digits.length > 0) {
      parts.push('(' + digits.slice(0, 2) + ')');
    }
    if (digits.length >= 7) {
      parts.push(' ' + digits.slice(2, 7) + '-' + digits.slice(7));
    } else if (digits.length > 2) {
      parts.push(' ' + digits.slice(2));
    }
    return parts.join('');
  };

  const formatCurrencyBR = (num?: number) => {
    const n = typeof num === 'number' ? num : 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  };

  const parseCurrencyToNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 0;
    // Interpret as cents
    const num = parseInt(digits, 10) / 100;
    return Number.isNaN(num) ? 0 : num;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      Nome: '',
      Telefone: '',
      Link_WhatsApp: '',
      Status: 'Novo',
      Data_Solicitacao: toLocalYMD(new Date()),
      Tipo_Evento: '',
      Data_Evento: '',
      Num_Convidados: 0,
      Local_Evento: '',
      Valor_Gelato: 0,
      Taxa_Deslocamento: 0,
      Mao_De_Obra: 0,
      Valor_Total: 0,
      Kg_Gelato: 0,
      Num_Atendentes: 0,
      Notas: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: Partial<Lead>) => createLead(payload),
    onSuccess: (lead) => {
      toast.success('Lead criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      navigate(`/lead/${lead.id}`);
    },
    onError: (e: Error) => toast.error(`Erro ao criar lead: ${e.message}`),
  });

  const onSubmit = (values: FormValues) => {
    const total = (values.Valor_Gelato || 0) + (values.Taxa_Deslocamento || 0) + (values.Mao_De_Obra || 0);
    const payload: Partial<Lead> = { ...values, Valor_Total: total };
    mutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      <header className="bg-card/60 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={() => navigate('/')}>
                Voltar
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voltar para lista</TooltipContent>
          </Tooltip>
          <h1 className="text-2xl font-bold text-foreground">Novo Lead</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Dados do Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="Nome" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Nome</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Nome completo do cliente.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="Ex: Maria Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Telefone" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Telefone</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Formato: (11) 91234-5678</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(11) 91234-5678"
                        value={field.value}
                        onChange={(e) => field.onChange(formatPhoneBR(e.target.value))}
                        inputMode="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Link_WhatsApp" control={form.control} render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Link WhatsApp</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>URL direta para conversa no WhatsApp.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="https://wa.me/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Informações do Evento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="Status" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Status</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Etapa atual do lead.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Data_Solicitacao" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Data da Solicitação</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Dia em que o lead foi criado.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Tipo_Evento" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Tipo de Evento</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Ex.: Festa, Casamento, Corporativo.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="Ex: Festa, Casamento..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Data_Evento" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Data do Evento</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Quando o evento acontecerá.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Num_Convidados" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Número de Convidados</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Quantidade estimada de pessoas.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Local_Evento" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Local do Evento</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Endereço ou nome do espaço.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input placeholder="Ex: Rua X, 123 - Salão Y" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Financeiro</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="Valor_Gelato" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Valor Gelato</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Valor total do gelato para o evento.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 1.500,00"
                        value={formatCurrencyBR(field.value)}
                        onChange={(e) => field.onChange(parseCurrencyToNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Taxa_Deslocamento" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Taxa de Deslocamento</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Custos de transporte e deslocamento.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 200,00"
                        value={formatCurrencyBR(field.value)}
                        onChange={(e) => field.onChange(parseCurrencyToNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Mao_De_Obra" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Mão de Obra</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Custos com equipe e atendimento.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: 500,00"
                        value={formatCurrencyBR(field.value)}
                        onChange={(e) => field.onChange(parseCurrencyToNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Valor_Total" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (auto)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={formatCurrencyBR((form.watch('Valor_Gelato') || 0) + (form.watch('Taxa_Deslocamento') || 0) + (form.watch('Mao_De_Obra') || 0))}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Logística</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="Kg_Gelato" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Kg de Gelato</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Quantidade total de gelato em kg.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="Num_Atendentes" control={form.control} render={({ field }) => (
                  <FormItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Número de Atendentes</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>Quantidade de pessoas para atendimento.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Observações</h2>
              <FormField name="Notas" control={form.control} render={({ field }) => (
                <FormItem>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FormLabel>Notas</FormLabel>
                      </TooltipTrigger>
                      <TooltipContent>Informações adicionais ou histórico de contato.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <FormControl>
                    <Textarea rows={4} placeholder="Observações adicionais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </Card>

            <div className="flex justify-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" onClick={() => navigate('/')}>Cancelar</Button>
                </TooltipTrigger>
                <TooltipContent>Cancelar e voltar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={mutation.isPending}>Salvar</Button>
                </TooltipTrigger>
                <TooltipContent>Salvar novo lead</TooltipContent>
              </Tooltip>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default NewLead;
