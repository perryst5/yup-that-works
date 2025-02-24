import { format, parse } from 'date-fns';

export function formatTimeSlot(hour: string): string {
  // Parse the 24-hour time and format to 12-hour
  const date = parse(hour, 'HH:00', new Date());
  return format(date, 'h:00 a');
}

export function formatTime24to12(time: string): string {
  const [hours] = time.split(':');
  const date = parse(time, 'HH:mm', new Date());
  return format(date, 'h:mm a');
}

export function format24Hour(time12: string): string {
  const date = parse(time12, 'h:mm a', new Date());
  return format(date, 'HH:mm');
}

export const formatTimeForDB = (time: string): string => {
  // Ensure time is in HH:mm format
  const [hours, minutes] = time.split(':').map(n => n.padStart(2, '0'));
  return `${hours}:${minutes}`;
};

export const formatDateForDB = (date: string): string => {
  // Ensure date is in YYYY-MM-DD format
  return new Date(date).toISOString().split('T')[0];
};

export const formatTimeForDisplay = (time: string | undefined) => {
  if (!time) return '';
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'h:mm a');
  } catch (e) {
    console.error('Invalid time format:', time);
    return '';
  }
};

export const formatDateForDisplay = (dateStr: string | undefined) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return format(date, 'MMMM d, yyyy');
  } catch (e) {
    console.error('Invalid date format:', dateStr);
    return '';
  }
};