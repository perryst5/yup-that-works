import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type DateSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dates: Date[]) => void;
};

export function DateSelectionModal({ isOpen, onClose, onConfirm }: DateSelectionModalProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleDateClick = (date: Date) => {
    setSelectedDates(prev => {
      const dateStr = date.toDateString();
      const exists = prev.some(d => d.toDateString() === dateStr);
      return exists 
        ? prev.filter(d => d.toDateString() !== dateStr)
        : [...prev, date];
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 space-y-4">
          <Dialog.Title className="text-lg font-medium">Select Dates</Dialog.Title>
          
          <Calendar
            onChange={handleDateClick}
            value={selectedDates}
            selectRange={false}
            onClickDay={handleDateClick}
            tileClassName={({ date }) => 
              selectedDates.some(d => d.toDateString() === date.toDateString())
                ? 'bg-blue-500 text-white'
                : ''
            }
            minDate={new Date()}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(selectedDates);
                onClose();
              }}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Confirm
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
