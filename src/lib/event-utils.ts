/**
 * Utility functions for working with event time slots
 */

export interface TimeSlot {
  date: string;
  times: string[];
}

/**
 * Convert separate dates and times arrays to the time_slots format
 * @param dates Array of date strings (YYYY-MM-DD)
 * @param times Array of time strings (HH:MM)
 * @returns Array of TimeSlot objects
 */
export function convertToTimeSlots(dates: string[], times: string[]): TimeSlot[] {
  if (!dates || !dates.length) return [];
  
  return dates.map(date => ({
    date,
    times: [...times] // Clone the times array for each date
  }));
}

/**
 * Extract dates array from time_slots
 * @param timeSlots Array of TimeSlot objects
 * @returns Array of date strings
 */
export function extractDates(timeSlots: TimeSlot[]): string[] {
  if (!timeSlots || !timeSlots.length) return [];
  return timeSlots.map(slot => slot.date);
}

/**
 * Extract unique times array from time_slots
 * @param timeSlots Array of TimeSlot objects
 * @returns Array of unique time strings
 */
export function extractTimes(timeSlots: TimeSlot[]): string[] {
  if (!timeSlots || !timeSlots.length) return [];
  
  // Get all times and deduplicate
  const allTimes = timeSlots.flatMap(slot => slot.times);
  return [...new Set(allTimes)];
}

/**
 * Safely parse time_slots from database
 * @param dbTimeSlots JSON string or object from database
 * @returns Properly formatted TimeSlot array
 */
export function parseTimeSlots(dbTimeSlots: any): TimeSlot[] {
  if (!dbTimeSlots) return [];
  
  try {
    // Handle string JSON
    const slots = typeof dbTimeSlots === 'string' 
      ? JSON.parse(dbTimeSlots) 
      : dbTimeSlots;
    
    // Ensure it's an array
    if (!Array.isArray(slots)) return [];
    
    // Validate and normalize each slot
    return slots.map(slot => ({
      date: slot.date || '',
      times: Array.isArray(slot.times) ? slot.times : []
    }));
  } catch (error) {
    console.error('Error parsing time_slots:', error);
    return [];
  }
}
