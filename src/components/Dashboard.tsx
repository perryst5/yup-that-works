import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/auth';
import type { Event } from '../lib/supabase';
import { Share2, BarChart2 } from 'lucide-react';

interface CopyNotification {
  eventId: string;
  visible: boolean;
}

function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyNotification, setCopyNotification] = useState<CopyNotification>({ eventId: '', visible: false });

  useEffect(() => {
    const loadEvents = async () => {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading events:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    loadEvents();
  }, []);

  const handleShare = async (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(`${window.location.origin}/event/${event.id}`);
    
    setCopyNotification({ eventId: event.id, visible: true });
    setTimeout(() => {
      setCopyNotification({ eventId: '', visible: false });
    }, 2000);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Events</h1>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">You haven't created any events yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <Link to={`/event/${event.id}`}>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    {event.dates.length} {event.dates.length === 1 ? 'date' : 'dates'} •{' '}
                    {event.times.length} {event.times.length === 1 ? 'time slot' : 'time slots'}
                  </div>
                </div>
              </Link>
              <div className="px-6 py-3 border-t border-gray-100 flex justify-end space-x-2">
                <div className="relative">
                  <button
                    onClick={(e) => handleShare(event, e)}
                    className="text-gray-600 hover:text-indigo-600 px-3 py-1 rounded hover:bg-gray-50 text-sm font-medium"
                  >
                    Share
                  </button>
                  {copyNotification.visible && copyNotification.eventId === event.id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                      Link copied!
                    </div>
                  )}
                </div>
                <Link
                  to={`/results/${event.id}`}
                  className="text-gray-600 hover:text-indigo-600 px-3 py-1 rounded hover:bg-gray-50 text-sm font-medium"
                >
                  View Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;