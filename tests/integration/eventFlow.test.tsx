import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import CreateEvent from '../../src/components/CreateEvent';
import { jest } from '@jest/globals';

// Mock modules directly without requireActual to avoid import.meta
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null })
  }
}));

jest.mock('../../src/lib/auth', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue('test-user-id')
}));

jest.mock('uuid', () => ({
  v4: () => 'test-event-id'
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn()
  };
});

jest.mock('../../src/lib/timeUtils', () => ({
  formatTime24to12: (time) => time,
  format24Hour: (time) => time,
  toUTC: (date, time) => ({ date, time }),
  fromUTC: (date, time) => ({ date, time }),
}));

describe('Event Creation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an event with time slots', async () => {
    render(<CreateEvent user={null} />);
    
    // Fill in event details
    fireEvent.change(screen.getByLabelText(/event title/i), {
      target: { value: 'Test Event' }
    });
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));
    
    // Verify API was called
    await waitFor(() => {
      expect(require('../../src/lib/auth').getCurrentUserId).toHaveBeenCalled();
      expect(require('../../src/lib/supabase').supabase.from).toHaveBeenCalled();
    });
  });
});
