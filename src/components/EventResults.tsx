import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { formatTimeSlot } from '../lib/timeUtils';

interface TimeSlot {
  date: string;
  hour: string;
}

function EventResults() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);

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

      // Fetch responses
      const { data: responsesData } = await supabase
        .from('responses')
        .select('*')
        .eq('event_id', id);

      if (responsesData) {
        setResponses(responsesData);
      }
    };

    fetchEventAndResponses();
  }, [id]);

  if (!event) {
    return <div>Loading...</div>;
  }

  const getAvailabilityCount = (timeSlot: string) => {
    return responses.filter(response => 
      response.selections.includes(timeSlot)
    ).length;
  };

  const getRespondentNames = (timeSlot: string) => {
    return responses
      .filter(response => response.selections.includes(timeSlot))
      .map(response => response.name);
  };

  // Group time slots by date
  const groupedSlots = event.dates.reduce((acc: {[key: string]: string[]}, slot: TimeSlot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot.hour);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
      {event.description && (
        <p className="text-gray-600 mb-6">{event.description}</p>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Results</h2>
          <p className="text-gray-600">Total Responses: {responses.length}</p>
        </div>

        {Object.entries(groupedSlots).map(([date, hours]) => (
          <div key={date} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hours.sort().map((hour) => {
                const timeSlot = `${date}-${hour}`;
                const availableCount = getAvailabilityCount(timeSlot);
                const availableNames = getRespondentNames(timeSlot);
                const percentage = responses.length ? Math.round((availableCount / responses.length) * 100) : 0;
                
                return (
                  <div key={timeSlot} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-gray-900">{formatTimeSlot(hour)}</p>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-indigo-600">
                          {availableCount} available
                        </p>
                        <p className="text-sm text-gray-500">
                          {percentage}% of respondents
                        </p>
                      </div>
                    </div>

                    {availableNames.length > 0 && (
                      <p className="text-sm text-gray-600 mb-2">
                        Available: {availableNames.join(', ')}
                      </p>
                    )}

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          percentage === 100 ? 'bg-green-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventResults;