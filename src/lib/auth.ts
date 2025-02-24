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

async function migrateUserData(fromId: string, toId: string) {
  // First verify the data exists
  const { data: existingEvents } = await supabase
    .from('events')
    .select('id')
    .eq('creator_id', fromId);

  console.log('Found events to migrate:', existingEvents);

  // Use a transaction if possible
  const { error: eventsError } = await supabase.rpc('migrate_user_data', {
    old_id: fromId,
    new_id: toId
  });

  if (eventsError) {
    console.error('Error migrating events:', eventsError);
    throw eventsError;
  }

  // Verify migration
  const { data: migratedEvents } = await supabase
    .from('events')
    .select('id')
    .eq('creator_id', toId);

  console.log('Events after migration:', migratedEvents);

  console.log('Events migrated successfully');

  // Continue with responses migration
  const { error: responsesError } = await supabase
    .from('responses')
    .update({ user_id: toId })
    .eq('user_id', fromId);

  if (responsesError) {
    console.error('Error migrating responses:', responsesError);
    throw responsesError;
  }

  console.log('Responses migrated successfully');
}

/**
 * User Authentication Module
 * Handles user-specific authentication using Supabase Auth.
 * Provides functions for user sign up, sign in, and sign out operations.
 */

export async function signUp(email: string, password: string) {
  const oldAnonId = localStorage.getItem(ANON_ID_KEY);
  console.log('Old anon ID during signup:', oldAnonId);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error during signup:', error);
    return { data, error };
  }

  if (data?.user && oldAnonId) {
    console.log('Migrating data from', oldAnonId, 'to', data.user.id);
    
    // Need to wait for the migration to complete
    try {
      await migrateUserData(oldAnonId, data.user.id);
      console.log('Migration completed');
      localStorage.removeItem(ANON_ID_KEY);
    } catch (migrateError) {
      console.error('Error during migration:', migrateError);
    }
  }

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const oldAnonId = localStorage.getItem(ANON_ID_KEY);
  console.log('Sign in - old anon ID:', oldAnonId);

  // Use signInWithPassword instead of signInWithPassword
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error && data?.user && oldAnonId) {
    console.log('Migrating data during sign in from', oldAnonId, 'to', data.user.id);
    try {
      await migrateUserData(oldAnonId, data.user.id);
      localStorage.removeItem(ANON_ID_KEY);
    } catch (migrateError) {
      console.error('Error during sign in migration:', migrateError);
    }
  }

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export function useAuth() {
  return supabase.auth.getUser();
}