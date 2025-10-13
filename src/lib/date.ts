import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Parse 'YYYY-MM-DD' as local midnight to avoid timezone shifting to previous day
export const parseLocalDateString = (dateString: string): Date => {
  if (!dateString) return new Date(NaN);
  const isYMD = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  return isYMD ? new Date(`${dateString}T00:00:00`) : new Date(dateString);
};

// Format long date in pt-BR using local date parsing
export const formatDateLong = (dateString: string): string => {
  try {
    return format(parseLocalDateString(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

// Sorting helpers using local date parsing
export const compareDateAsc = (a: string, b: string): number => {
  return parseLocalDateString(a).getTime() - parseLocalDateString(b).getTime();
};

export const compareDateDesc = (a: string, b: string): number => {
  return parseLocalDateString(b).getTime() - parseLocalDateString(a).getTime();
};

// Produce local 'YYYY-MM-DD' string (e.g., for <input type="date"> default values)
export const toLocalYMD = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};