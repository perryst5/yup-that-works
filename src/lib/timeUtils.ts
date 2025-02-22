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