import { format, parseISO, isValid, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format a date string to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Format a date string to short format (DD/MM)
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, 'dd/MM', { locale: ptBR });
}

/**
 * Format a date string to long format (15 de Janeiro de 2024)
 */
export function formatDateLong(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Format a month string (YYYY-MM) to display format (Janeiro 2024)
 */
export function formatMonth(month: string): string {
  const date = parseISO(`${month}-01`);
  if (!isValid(date)) return month;
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

/**
 * Format a month string to short format (Jan/24)
 */
export function formatMonthShort(month: string): string {
  const date = parseISO(`${month}-01`);
  if (!isValid(date)) return month;
  return format(date, 'MMM/yy', { locale: ptBR });
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get the month from a date string
 */
export function getMonthFromDate(date: string): string {
  return date.substring(0, 7);
}

/**
 * Get previous month in YYYY-MM format
 */
export function getPreviousMonth(month: string): string {
  const date = parseISO(`${month}-01`);
  return format(subMonths(date, 1), 'yyyy-MM');
}

/**
 * Get next month in YYYY-MM format
 */
export function getNextMonth(month: string): string {
  const date = parseISO(`${month}-01`);
  return format(addMonths(date, 1), 'yyyy-MM');
}

/**
 * Get the first day of a month
 */
export function getFirstDayOfMonth(month: string): string {
  const date = parseISO(`${month}-01`);
  return format(startOfMonth(date), 'yyyy-MM-dd');
}

/**
 * Get the last day of a month
 */
export function getLastDayOfMonth(month: string): string {
  const date = parseISO(`${month}-01`);
  return format(endOfMonth(date), 'yyyy-MM-dd');
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: string): boolean {
  const dateObj = parseISO(date);
  return isValid(dateObj) && dateObj > new Date();
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string): boolean {
  const dateObj = parseISO(date);
  return isValid(dateObj) && dateObj < new Date();
}

/**
 * Get the day of month from a date string
 */
export function getDayOfMonth(date: string): number {
  const dateObj = parseISO(date);
  return isValid(dateObj) ? dateObj.getDate() : 1;
}

/**
 * Create a date string from month and day
 */
export function createDateFromMonthAndDay(month: string, day: number): string {
  const paddedDay = String(day).padStart(2, '0');
  return `${month}-${paddedDay}`;
}

/**
 * Get relative time string (e.g., "há 2 dias", "em 3 dias")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';

  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays === -1) return 'Ontem';
  if (diffDays > 0) return `Em ${diffDays} dias`;
  return `Há ${Math.abs(diffDays)} dias`;
}

/**
 * Get months between two months (inclusive)
 */
export function getMonthsBetween(startMonth: string, endMonth: string): string[] {
  const months: string[] = [];
  let current = parseISO(`${startMonth}-01`);
  const end = parseISO(`${endMonth}-01`);

  while (current <= end) {
    months.push(format(current, 'yyyy-MM'));
    current = addMonths(current, 1);
  }

  return months;
}

/**
 * Format deadline with remaining days
 */
export function formatDeadline(deadline: string): { text: string; isUrgent: boolean; isPast: boolean } {
  const dateObj = parseISO(deadline);
  if (!isValid(dateObj)) {
    return { text: '', isUrgent: false, isPast: false };
  }

  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Vencido há ${Math.abs(diffDays)} dias`,
      isUrgent: true,
      isPast: true,
    };
  }

  if (diffDays === 0) {
    return { text: 'Vence hoje', isUrgent: true, isPast: false };
  }

  if (diffDays <= 7) {
    return { text: `Vence em ${diffDays} dias`, isUrgent: true, isPast: false };
  }

  if (diffDays <= 30) {
    return { text: `Vence em ${diffDays} dias`, isUrgent: false, isPast: false };
  }

  return {
    text: format(dateObj, "d 'de' MMMM", { locale: ptBR }),
    isUrgent: false,
    isPast: false,
  };
}
