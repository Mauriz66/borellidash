export type LeadStatus = 'Novo' | 'Orçamento Enviado' | 'Em Negociação' | 'Fechado' | 'Perdido';

export interface Lead {
  id: string;
  Nome: string;
  Telefone: string;
  Link_WhatsApp: string;
  Status: LeadStatus;
  Data_Solicitacao: string;
  Tipo_Evento: string;
  Data_Evento: string;
  Num_Convidados: number;
  Local_Evento: string;
  Valor_Gelato: number;
  Taxa_Deslocamento: number;
  Mao_De_Obra: number;
  Valor_Total: number;
  Kg_Gelato: number;
  Num_Atendentes: number;
  Notas?: string;
  Proximo_Passo_Data?: string;
  Proximo_Passo_Descricao?: string;
}
