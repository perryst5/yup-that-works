import { jest } from '@jest/globals';

// Mock implementation of Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    session: jest.fn(),
    user: jest.fn()
  },
  rpc: jest.fn(),
  headers: {}
};

export default mockSupabase;
