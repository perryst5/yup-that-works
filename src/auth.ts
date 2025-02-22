import { supabase } from './lib/supabase';

// ...existing code...

export const checkSplashPassword = async (password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('verify_splash_password', {
      input_password: password  // This must match the SQL function parameter name
    });
    
    if (error) {
      console.error('Error verifying password:', error);
      return false;
    }
    
    return !!data;  // Ensure we return a boolean
  } catch (err) {
    console.error('Error checking password:', err);
    return false;
  }
};

// ...existing code...
