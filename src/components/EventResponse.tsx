import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Check, X } from 'lucide-react';
import { formatTimeForDisplay, formatDateForDisplay, fromUTC, toUTC } from '../lib/timeUtils';
import type { Event } from '../lib/supabase';
import { getCurrentUserId } from '../lib/auth';

function EventResponse() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [name, setName] = useState('');
  const [selections, setSelections] = useState<{[key: string]: boolean}>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        // Convert UTC time_slots to local time for display
        const localTimeSlots = Object.entries(data.time_slots).reduce((acc, [utcDate, utcTimes]: [string, string[]]) => {
          utcTimes.forEach(utcTime => {
            const { date: localDate, time: localTime } = fromUTC(utcDate, utcTime);
            if (!acc[localDate]) acc[localDate] = [];
            acc[localDate].push(localTime);
          });
          return acc;
        }, {} as Record<string, string[]>);

        setEvent({ ...data, time_slots: localTimeSlots });
        
        // Initialize selections with local times
        const initialSelections: {[key: string]: boolean} = {};
        Object.entries(localTimeSlots).forEach(([date, times]) => {
          times.forEach(time => {
            initialSelections[`${date}-${time}`] = false;
          });
        });
        setSelections(initialSelections);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = await getCurrentUserId();

    const availability = Object.entries(selections)
      .filter(([_, selected]) => selected)
      .map(([timeSlot]) => {
        const lastHyphen = timeSlot.lastIndexOf('-');
        const date = timeSlot.substring(0, lastHyphen);
        const time = timeSlot.substring(lastHyphen + 1);
        
        try {
          const { date: utcDate, time: utcTime } = toUTC(date, time);
          
          return {
            date: utcDate,
            time: utcTime,
            available: true
          };
        } catch (error) {
          console.error('Conversion error:', { date, time, error });
          throw error;
        }
      });

    const { error } = await supabase
      .from('responses')
      .insert([{
        event_id: id,
        user_id: userId,
        name,
        availability
      }]);

    if (!error) {
      setSubmitted(true);
    } else {
      console.error('Error submitting response:', error);
    }
  };

  if (!event) {
    return <div>Loading...</div>;
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank you!</h2>
        <p className="text-gray-600">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
      {event.description && (
        <p className="text-gray-600 mb-6">{event.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Select Available Times</h2>
          {Object.entries(event.time_slots).map(([date, times]) => (
            <div key={date} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {formatDateForDisplay(date)}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {times.sort().map((time: string) => {
                  const timeSlot = `${date}-${time}`;
                  return (
                    <button
                      key={timeSlot}
                      type="button"
                      onClick={() => setSelections({
                        ...selections,
                        [timeSlot]: !selections[timeSlot]
                      })}
                      className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                        selections[timeSlot]
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <span>{formatTimeForDisplay(time)}</span>
                      {selections[timeSlot] ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit Response
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventResponse;