import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatTimeForDisplay, formatDateForDisplay } from '../lib/timeUtils';
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
        setEvent(eventData);
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

  // Create availability grid
  const availabilityGrid = event.dates.map(date => ({
    date,
    times: event.times.map(time => {
      const available = responses.filter(response => 
        response.availability.some(slot => 
          slot.date === date && 
          slot.time === time && 
          slot.available
        )
      );
      const percentage = responses.length > 0 
        ? Math.round((available.length / responses.length) * 100) 
        : 0;

      return {
        time,
        count: available.length,
        percentage,
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
            <div className="space-y-2">
              {times.map(({ time, count, percentage, respondents }) => (
                <div key={`${date}-${time}`} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {formatTimeForDisplay(time)}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {count} / {responses.length} ({percentage}%)
                    </span>
                  </div>
                  <div className="overflow-hidden h-6 text-xs flex bg-gray-200 rounded">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="bg-green-500 transition-all duration-300 flex items-center justify-center text-white shadow-none whitespace-nowrap"
                    >
                      {respondents.length > 0 && (
                        <span className="px-2 truncate">
                          {respondents.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
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