import { jest } from '@jest/globals';

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

// Mock Supabase client
export const supabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn().mockResolvedValue({ error: null }),
  update: jest.fn(),
  delete: jest.fn(),
  order: jest.fn().mockReturnThis(),
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    session: jest.fn(),
    user: jest.fn()
  },
  rpc: jest.fn(),
  headers: {}
};

// Helper function stubs
export const isAuthenticated = () => false;
export const initializeTables = async () => {};
