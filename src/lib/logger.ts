/**
 * Simple production error logger
 */
export const logProductionError = (context: string, error: any, data?: any) => {
  if (import.meta.env.PROD) {
    console.error(`[${context}] Error:`, error);
    if (data) {
      console.error(`[${context}] Related data:`, 
        typeof data === 'object' ? JSON.stringify(data) : data
      );
    }
  }
};
