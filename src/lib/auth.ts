import { supabase } from './supabase';

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