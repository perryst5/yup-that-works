import { supabase } from './supabase';

const ANON_ID_KEY = 'yup_anon_id';

export const getCurrentUserId = async (): Promise<string> => {
  // Check for authenticated user first
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) return user.id;

  // Fall back to anonymous ID
  let anonId = localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, anonId);
  }

  // Set the header for all future requests
  supabase.headers = {
    ...supabase.headers,
    'x-anon-id': anonId
  };

  return anonId;
};

export const isAuthenticated = () => {
  return !!supabase.auth.user();
};

export const signInWithEmail = async (email: string, password: string) => {
  const oldAnonId = localStorage.getItem(ANON_ID_KEY);
  const { user, error } = await supabase.auth.signIn({ email, password });
  
  if (user && oldAnonId) {
    // Transfer anonymous user's data to authenticated user
    await migrateUserData(oldAnonId, user.id);
    localStorage.removeItem(ANON_ID_KEY);
  }
  
  return { user, error };
};

async function migrateUserData(fromId: string, toId: string) {
  // Run in a transaction
  const { error } = await supabase.rpc('migrate_user_data', {
    from_id: fromId,
    to_id: toId
  });

  if (error) {
    console.error('Error migrating user data:', error);
  }
}

/**
 * User Authentication Module
 * Handles user-specific authentication using Supabase Auth.
 * Provides functions for user sign up, sign in, and sign out operations.
 */

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export function useAuth() {
  return supabase.auth.getUser();
}