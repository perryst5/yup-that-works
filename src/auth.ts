import { supabase } from './lib/supabase';

/**
 * Splash Screen Authentication Module
 * Handles the initial password gate before users can access the application.
 * Uses a single password stored as a bcrypt hash in the app_settings table.
 */

let splashAuthenticated = false;

export const isAuthenticated = () => {
    return splashAuthenticated;
};

export const checkSplashPassword = async (password: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase.rpc('verify_splash_password', {
            password: password  // Changed from input_password to password
        });
        
        if (error) {
            console.error('Error verifying password:', error);
            return false;
        }
        
        splashAuthenticated = !!data;
        return splashAuthenticated;
    } catch (err) {
        console.error('Error checking password:', err);
        return false;
    }
};
