import { supabase } from './supabase';

const ANON_ID_KEY = 'yup_anon_id';

/**
 * Gets the current user ID - either from auth session or anonymous ID
 */
export const getCurrentUserId = async (): Promise<string> => {
  // Check for authenticated user first
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) {
    console.log('Using authenticated user ID:', user.id);
    return user.id;
  }

  // Fall back to anonymous ID
  let anonId = localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    // Create a new anonymous ID if none exists
    anonId = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, anonId);
    console.log('Generated new anonymous ID:', anonId);
  } else {
    console.log('Using existing anonymous ID:', anonId);
  }

  return anonId;
};

// Helper function to migrate user data from anonymous to authenticated
async function migrateUserData(fromId: string, toId: string) {
  console.log(`Starting migration from ${fromId} to ${toId}`);
  
  try {
    // Using direct update to avoid RLS policy issues
    const { data, error } = await supabase.rpc('migrate_events', {
      old_id: fromId,
      new_id: toId
    });
    
    if (error) {
      console.error('Migration error:', error);
      return { success: false, error };
    }
    
    console.log('Migration successful:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Migration error:', err);
    return { success: false, error: err };
  }
}

// Export for manual migration utility
export const migrateSpecificEvent = async (oldId: string, newId: string) => {
  console.log(`Manual migration from ${oldId} to ${newId}`);
  return migrateUserData(oldId, newId);
};

/**
 * User Authentication Module
 */
export async function signUp(email: string, password: string) {
  // Store the anonymous ID before sign up
  const oldAnonId = localStorage.getItem(ANON_ID_KEY);
  console.log('Anonymous ID before signup:', oldAnonId);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // After successful sign up, migrate data if there was an anonymous ID
  if (!error && data.user && oldAnonId) {
    console.log(`Will migrate data from ${oldAnonId} to ${data.user.id}`);
    const migrationResult = await migrateUserData(oldAnonId, data.user.id);
    console.log('Migration result:', migrationResult);
    
    // Clear the anonymous ID only after successful migration
    if (migrationResult.success) {
      console.log('Removing anonymous ID after successful migration');
      localStorage.removeItem(ANON_ID_KEY);
    }
  }
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  // Store the anonymous ID before sign in
  const oldAnonId = localStorage.getItem(ANON_ID_KEY);
  console.log('Anonymous ID before signin:', oldAnonId);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // After successful sign in, migrate data if there was an anonymous ID
  if (!error && data.user && oldAnonId) {
    console.log(`Will migrate data from ${oldAnonId} to ${data.user.id}`);
    const migrationResult = await migrateUserData(oldAnonId, data.user.id);
    console.log('Migration result:', migrationResult);
    
    // Clear the anonymous ID only after successful migration
    if (migrationResult.success) {
      console.log('Removing anonymous ID after successful migration');
      localStorage.removeItem(ANON_ID_KEY);
    }
  }
  
  return { data, error };
}

export async function signOut() {
  // Create a new anonymous ID when signing out
  const newAnonId = crypto.randomUUID();
  localStorage.setItem(ANON_ID_KEY, newAnonId);
  console.log('Created new anonymous ID after signout:', newAnonId);
  
  const { error } = await supabase.auth.signOut();
  return { error };
}

// For user state checks throughout the app
export async function getUserState() {
  const { data } = await supabase.auth.getUser();
  return {
    user: data.user,
    isAnonymous: !data.user && !!localStorage.getItem(ANON_ID_KEY),
    anonymousId: localStorage.getItem(ANON_ID_KEY)
  };
}

export function useAuth() {
  return supabase.auth.getUser();
}

export function isAuthenticated() {
  // This is only for session checks, not splash screen
  const session = supabase.auth.getSession();
  return session !== null;
}