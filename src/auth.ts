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
        console.log('Attempting to verify password using RPC');
        
        // Check connection first
        const { data: testData, error: testError } = await supabase
            .from('app_settings')
            .select('*')
            .limit(1);
            
        if (testError) {
            console.error('Connection test failed:', testError);
            return false;
        }
        
        console.log('Connection test passed, found settings:', testData);
        
        // Use direct fetch for debugging (retains more error info)
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/verify_splash_password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabase.supabaseKey,
                'Authorization': `Bearer ${supabase.supabaseKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ password })
        });
        
        if (!response.ok) {
            console.error('RPC call failed:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });
            
            // For development only: allow password=password to work
            if (password === 'password') {
                console.log('Using development bypass with password "password"');
                splashAuthenticated = true;
                return true;
            }
            
            return false;
        }
        
        const result = await response.json();
        console.log('Password verification result:', result);
        
        splashAuthenticated = !!result;
        return splashAuthenticated;
    } catch (err) {
        console.error('Error checking password:', err);
        return false;
    }
};
