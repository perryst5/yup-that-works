import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
import EventResponse from '../../src/components/EventResponse';
import { jest } from '@jest/globals';

// Mock modules with properly isolated imports that avoid import.meta
jest.mock('../../src/lib/supabase', () => {
  const mockInsert = jest.fn().mockResolvedValue({ error: null });
  const mockSupabase = {
    from: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-event-id',
          title: 'Test Event',
          description: 'Test Description',
          time_slots: {
            '2025-02-25': ['09:00', '10:00', '11:00']
          }
        },
        error: null
      }),
      insert: mockInsert
    }))
  };
  
  return {
    supabase: mockSupabase,
    mockInsert // Export the mockInsert for testing
  };
});

jest.mock('../../src/lib/auth', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue('test-user-id')
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-event-id' })
}));

jest.mock('../../src/lib/timeUtils', () => ({
  formatTimeForDisplay: jest.fn((time) => `${time} AM`),
  formatDateForDisplay: jest.fn((date) => date),
  fromUTC: jest.fn((date, time) => ({ date, time })),
  toUTC: jest.fn((date, time) => ({ date, time }))
}));

describe('EventResponse Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders event details and time slots', async () => {
    render(<EventResponse />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('handles time slot selection', async () => {
    render(<EventResponse />);
    
    await waitFor(() => screen.getByText('Test Event'));
    
    const timeSlotButtons = screen.getAllByRole('button', { name: /AM/ });
    expect(timeSlotButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(timeSlotButtons[0]);
  });

  it('submits the form with selected times', async () => {
    // Get the mock directly from the mock module
    const { mockInsert } = require('../../src/lib/supabase');
    
    render(<EventResponse />);
    
    await waitFor(() => screen.getByText('Test Event'));
    
    // Enter name
    const nameInput = screen.getByLabelText(/your name/i);
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    
    // Select a time slot
    const timeSlotButton = screen.getAllByRole('button', { name: /AM/ })[0];
    fireEvent.click(timeSlotButton);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit response/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(require('../../src/lib/auth').getCurrentUserId).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });
  });
});
