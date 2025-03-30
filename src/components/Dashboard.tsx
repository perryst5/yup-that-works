import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { formatDateForDisplay } from '../lib/timeUtils';
import { logProductionError } from '../lib/logger';

function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('Fetching events for user:', user.id);
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            responses:responses(*)
          `)
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching events:', error);
          return;
        }

        if (data) {
          console.log(`Found ${data.length} events for user ${user.id}:`, data);
          setEvents(data);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Helper function to get formatted date range from time_slots
  const getDateRange = (timeSlots: Record<string, string[]> | undefined) => {
    if (!timeSlots || Object.keys(timeSlots).length === 0) {
      return "No dates set";
    }

    try {xpected format
      const dates = Object.keys(timeSlots).sort((a, b) => {
        // Sort dates chronologically instead of lexicographically
        return new Date(a).getTime() - new Date(b).getTime();
      });
      ally with error handling
      if (dates.length === 0) {s(timeSlots).filter(date => {
        return "No dates set"; // Validate date string to ensure it's a valid date
      }  return !isNaN(new Date(date).getTime());
      
      const firstDate = dates[0];f lexicographically
      const lastDate = dates[dates.length - 1];        return new Date(a).getTime() - new Date(b).getTime();

      // If it's just one date, return that date
      if (firstDate === lastDate) {
        return formatDateForDisplay(firstDate); return "No dates set";
      }      }

      // Return date range
      return `${formatDateForDisplay(firstDate)} - ${formatDateForDisplay(lastDate)}`;= dates[dates.length - 1];
    } catch (error) {
      console.error("Error formatting date range:", error);n that date
      return "Date formatting error"; if (firstDate === lastDate) {
    }    return formatDateForDisplay(firstDate);
  };      }

  if (loading) {
    return <div>Loading...</div>;   return `${formatDateForDisplay(firstDate)} - ${formatDateForDisplay(lastDate)}`;
  }    } catch (error) {
ole.error("Error formatting date range:", error);
  return (rror";
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Event
        </Link>ssName="space-y-6">
      </div>      <div className="flex justify-between items-center">
ts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const responseCount = event.responses?.length || 0;className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          
          // Log the structure of the event in production to help debug
          if (import.meta.env.PROD) {
            try {
              console.log(`Event ID ${event.id} time_slots:`, 
                typeof event.time_slots === 'object' ? 
                  Object.keys(event.time_slots || {}).length : typeof event.time_slotsmap((event) => {
              );          const responseCount = event.responses?.length || 0;
            } catch (err) {
              logProductionError('EventRender', err, { eventId: event.id });
            }nded-lg shadow-md p-6">
          }mb-2">{event.title}</h3>
          
          return (              {event.description && (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6">vent.description}</p>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{event.title}</h3>
              
              {event.description && (ssName="space-y-2 mb-4">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p> className="flex items-center text-sm text-gray-500">
              )}                  <Calendar className="h-4 w-4 mr-2" />
me_slots)}</span>
              <div className="space-y-2 mb-4">>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{getDateRange(event.time_slots)}</span> <Users className="h-4 w-4 mr-2" />
                </div>>{responseCount} responses</span>

                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{responseCount} responses</span>
                </div>Link
              </div>${event.id}`}
enter items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              <div className="flex space-x-2">
                <Linkare
                  to={`/event/${event.id}`}Link>
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"    <Link
                >       to={`/results/${event.id}`}
                  Share      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                </Link>                >
                <Link
                  to={`/results/${event.id}`}-2 h-4 w-4" />
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Resultsdiv>
                  <ArrowRight className="ml-2 h-4 w-4" />  );
                </Link>}
              </div>  </div>
            </div>
          );      {events.length === 0 && (
        })}ext-center py-12">













export default Dashboard;}  );    </div>      )}        </div>          <p className="text-gray-600">Create your first event to get started!</p>          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>        <div className="text-center py-12">      {events.length === 0 && (      </div>          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600">Create your first event to get started!</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;