import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Trash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { addDays, format, eachHourOfInterval, set, parseISO } from 'date-fns';
import { formatTime24to12, format24Hour, toUTC } from '../lib/timeUtils';  // Changed from dateUtils to timeUtils
import { useTrimmedInput } from '../hooks/useTrimmedInput';
import { getCurrentUserId } from '../lib/auth';

interface CreateEventProps {
  user: any;
}

interface DateSlot {
  date: string;
  startTime: string;
  endTime: string;
}

function CreateEvent({ user }: CreateEventProps) {
  const navigate = useNavigate();
  const title = useTrimmedInput('');
  const description = useTrimmedInput('');
  const [dates, setDates] = useState<DateSlot[]>([{
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00'
  }]);

  const addDate = () => {
    const lastDate = dates[dates.length - 1];
    const parsedDate = parseISO(lastDate.date); // Properly parse the ISO date string
    const nextDate = format(addDays(parsedDate, 1), 'yyyy-MM-dd');
    setDates([...dates, {
      date: nextDate,
      startTime: lastDate.startTime,
      endTime: lastDate.endTime
    }]);
  };

  const removeDate = (index: number) => {
    setDates(dates.filter((_, i) => i !== index));
  };

  const generateTimeSlots = (date: string, startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = set(new Date(date), { hours: startHour, minutes: startMinute });
    const end = set(new Date(date), { hours: endHour, minutes: endMinute });

    return eachHourOfInterval({ start, end });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const creatorId = await getCurrentUserId();
    const eventId = uuidv4();

    // Transform dates and times into UTC time_slots
    const time_slots = dates.reduce((acc, d) => {
      const times = [];
      for (let hour = parseInt(d.startTime); hour <= parseInt(d.endTime); hour++) {
        const localTime = `${hour.toString().padStart(2, '0')}:00`;
        console.log(`Converting local time: ${d.date} ${localTime}`);
        const { date: utcDate, time: utcTime } = toUTC(d.date, localTime);
        console.log(`Converted to UTC: ${utcDate} ${utcTime}`);
        
        if (!acc[utcDate]) acc[utcDate] = [];
        acc[utcDate].push(utcTime);
      }
      return acc;
    }, {} as Record<string, string[]>);

    console.log('Final time_slots:', time_slots);

    // Sort times within each date
    Object.keys(time_slots).forEach(date => {
      time_slots[date].sort();
    });

    const { error } = await supabase
      .from('events')
      .insert([{
        id: eventId,
        title: title.trimmedValue,
        description: description.trimmedValue,
        time_slots,
        creator_id: creatorId
      }]);

    if (!error) {
      navigate(user ? '/dashboard' : `/event/${eventId}`);
    } else {
      console.error('Error creating event:', error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Event Title
          </label>
          <input
            type="text"
            id="title"
            value={title.value}
            onChange={title.handleChange}
            onBlur={title.handleBlur}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description.value}
            onChange={description.handleChange}
            onBlur={description.handleBlur}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Available Dates</h2>
            <button
              type="button"
              onClick={addDate}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Date
            </button>
          </div>

          {dates.map((date, index) => (
            <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-md">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={date.date}
                      onChange={(e) => {
                        const newDates = [...dates];
                        newDates[index].date = e.target.value;
                        setDates(newDates);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Start Time
                    </label>
                    <select
                      value={formatTime24to12(date.startTime)}
                      onChange={(e) => {
                        const newDates = [...dates];
                        newDates[index].startTime = format24Hour(e.target.value);
                        setDates(newDates);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const time = `${String(i).padStart(2, '0')}:00`;
                        return (
                          <option key={time} value={formatTime24to12(time)}>
                            {formatTime24to12(time)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 inline mr-2" />
                      End Time
                    </label>
                    <select
                      value={formatTime24to12(date.endTime)}
                      onChange={(e) => {
                        const newDates = [...dates];
                        newDates[index].endTime = format24Hour(e.target.value);
                        setDates(newDates);
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const time = `${String(i).padStart(2, '0')}:00`;
                        return (
                          <option key={time} value={formatTime24to12(time)}>
                            {formatTime24to12(time)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {dates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDate(index)}
                  className="p-2 text-red-600 hover:text-red-800 mt-8 md:mt-0"
                >
                  <Trash className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;