import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock the timezone for consistent testing
const OriginalDate = global.Date;

class MockDate extends OriginalDate {
  constructor(...args: any[]) {
    // @ts-ignore - args might be empty or have different types
    super(...args);
  }

  getTimezoneOffset() {
    // Return a fixed timezone offset for tests (UTC-5, like US Eastern)
    return 300;
  }
}

global.Date = MockDate as DateConstructor;

// Silence console errors during tests to keep output clean
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Warning:') || args[0].includes('Error in'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock Temporal API
jest.mock('@js-temporal/polyfill', () => ({
  Temporal: {
    Now: {
      timeZoneId: () => 'America/New_York',
    },
    PlainDateTime: {
      from: ({ year, month, day, hour, minute }: any) => ({
        toZonedDateTime: () => ({
          toInstant: () => ({
            toZonedDateTimeISO: () => ({
              toPlainDate: () => ({
                toString: () => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              }),
              toPlainTime: () => ({
                toString: () => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
              })
            })
          })
        })
      })
    },
    ZonedDateTime: {
      from: (dateString: string) => {
        // Parse "2025-02-25T09:00:00Z[UTC]"
        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (match) {
          const [_, year, month, day, hour, minute] = match;
          return {
            withTimeZone: () => ({
              toPlainDate: () => ({
                toString: () => `${year}-${month}-${day}`
              }),
              toPlainTime: () => ({
                toString: () => `${hour}:${minute}:00`
              })
            })
          };
        }
        return {};
      }
    }
  }
}));
