import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { Calendar, Users, ArrowRight } from 'lucide-react';

function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('events')
        .select(`
          *,
          responses:responses(*)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Event
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const responseCount = event.responses?.length || 0;
          const firstDate = event.dates[0]?.date;
          const lastDate = event.dates[event.dates.length - 1]?.date;

          return (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{event.title}</h3>
              
              {event.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {format(parseISO(firstDate), 'MMM d')}
                    {firstDate !== lastDate && ` - ${format(parseISO(lastDate), 'MMM d')}`}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{responseCount} responses</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/event/${event.id}`}
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Share
                </Link>
                <Link
                  to={`/results/${event.id}`}
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600">Create your first event to get started!</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard