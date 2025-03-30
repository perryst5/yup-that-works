import { createClient } from '@supabase/supabase-js';

export type Event = {
  id: string;
  created_at: string;
  creator_id: string;
  title: string;
  description?: string;
  time_slots: {
    [date: string]: string[] // Maps dates to array of available times
  };
};

export type Response = {
  id: string;
  event_id: string;
  user_id: string;
  name: string;
  availability: {
    date: string;
    time: string;
    available: boolean;
  }[];
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Attempting to connect to Supabase at:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
  // Use placeholders for development to help with debugging
  console.warn('Using placeholder credentials for development only');
}

// Create client with better error logging
export const supabase = createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseAnonKey || 'placeholder-key-for-dev',
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: (...args) => {
        return fetch(...args).catch(err => {
          console.error('Supabase connection error:', err);
          console.log('Connection details:', {
            url: args[0],
            method: args[1]?.method || 'GET'
          });
          throw new Error(`Failed to connect to Supabase. Make sure the server is running at ${supabaseUrl}`);
        });
      }
    }
  }
);

// Add helper to check if user is authenticated
export const isAuthenticated = () => {
  return !!supabase.auth.session()?.user;
};

// Helper function to check if tables exist
export const initializeTables = async () => {
  // ...existing code...
};