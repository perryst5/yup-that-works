import { createClient } from '@supabase/supabase-js';

export type Event = {
  id: string;
  created_at: string;
  creator_id: string;
  title: string;
  description?: string;
  dates: string[];
  times: string[];
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

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if tables exist
export const initializeTables = async () => {
  // ...existing code...
};