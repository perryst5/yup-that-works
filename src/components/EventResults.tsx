import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatTimeForDisplay, formatDateForDisplay, fromUTC } from '../lib/timeUtils';
import type { Event, Response } from '../lib/supabase';

function EventResults() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    const fetchEventAndResponses = async () => {
      // Fetch event details
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventData) {
        // Convert UTC time_slots to local time for display
        const localTimeSlots = Object.entries(eventData.time_slots).reduce((acc, [utcDate, utcTimes]) => {
          utcTimes.forEach(utcTime => {
            const { date: localDate, time: localTime } = fromUTC(utcDate, utcTime);
            if (!acc[localDate]) acc[localDate] = [];
            if (!acc[localDate].includes(localTime)) {
              acc[localDate].push(localTime);
            }
          });
          return acc;
        }, {} as Record<string, string[]>);

        console.log('UTC time slots:', eventData.time_slots);
        console.log('Local time slots:', localTimeSlots);

        setEvent({ ...eventData, time_slots: localTimeSlots });
      }

      // Fetch responses with logging
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('event_id', id);

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
      }

      if (responsesData) {
        console.log('Responses:', responsesData);
        setResponses(responsesData);
      }
    };

    fetchEventAndResponses();
  }, [id]);

  if (!event) return <div>Loading...</div>;

  // Create availability grid from time_slots structure
  const availabilityGrid = Object.entries(event.time_slots).map(([date, times]) => ({
    date,
    times: times.map(time => {
      const available = responses.filter(response => 
        response.availability?.some(slot => {
          try {
            if (!slot || !slot.date || !slot.time) return false;
            const { date: localDate, time: localTime } = fromUTC(slot.date, slot.time);
            const matches = localDate === date && localTime === time && slot.available;
            return matches;
          } catch (error) {
            console.error('Error processing response:', { slot, error });
            return false;
          }
        }) || false
      );

      return {
        time,
        count: available.length,
        percentage: responses.length > 0 
          ? Math.round((available.length / responses.length) * 100) 
          : 0,
        respondents: available.map(r => r.name)
      };
    })
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
      {event.description && (
        <p className="text-gray-600 mb-6">{event.description}</p>
      )}

      <div className="space-y-6">
        {availabilityGrid.map(({ date, times }) => (
          <div key={date} className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {formatDateForDisplay(date)}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {times.map(({ time, count, respondents }) => (
                <div
                  key={`${date}-${time}`}
                  className={`p-3 rounded-md ${
                    count > 0 ? 'bg-green-100' : 'bg-white'
                  }`}
                >
                  <div className="font-medium">{formatTimeForDisplay(time)}</div>
                  <div className="text-sm text-gray-600">
                    {count} {count === 1 ? 'person' : 'people'}
                  </div>
                  {count > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {respondents.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventResults;