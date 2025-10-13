import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/lead';

// Fetch all leads ordered by request date desc
export const fetchLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from<Lead>('leads')
    .select('*')
    .order('Data_Solicitacao', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

// Fetch lead by id
export const fetchLeadById = async (id: string): Promise<Lead | null> => {
  const { data, error } = await supabase
    .from<Lead>('leads')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
};

// Create a new lead
export const createLead = async (payload: Partial<Lead>): Promise<Lead> => {
  const { data, error } = await supabase
    .from<Lead>('leads')
    .insert(payload as unknown as Lead)
    .select('*')
    .single();

  if (error) throw error;
  return data as Lead;
};

// Update existing lead fields
export const updateLead = async (id: string, updates: Partial<Lead>): Promise<Lead> => {
  const { data, error } = await supabase
    .from<Lead>('leads')
    .update(updates as unknown as Lead)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Lead;
};

// Update status only
export const updateLeadStatus = async (id: string, status: LeadStatus): Promise<Lead> => {
  return updateLead(id, { Status: status });
};

// Replace notes entirely (caller composes notes string)
export const updateLeadNotes = async (id: string, notes: string): Promise<Lead> => {
  return updateLead(id, { Notas: notes });
};

// Update next step fields
export const updateLeadNextStep = async (
  id: string,
  next: { Proximo_Passo_Data?: string; Proximo_Passo_Descricao?: string }
): Promise<Lead> => {
  return updateLead(id, next);
};

// Delete a lead by id
export const deleteLead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from<Lead>('leads')
    .delete()
    .eq('id', id);
  if (error) throw error;
};