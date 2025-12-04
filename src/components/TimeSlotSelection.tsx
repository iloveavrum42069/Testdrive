import { useState, useEffect } from 'react';
import { Car } from '../App';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';
import { getPageSettings } from './PageEditor';
import { formatDateDisplay } from '../utils/formatters';
import { storageService } from '../services/storageService';

interface TimeSlotSelectionProps {
  car: Car;
  onNext: (date: string, timeSlot: string) => void;
  onBack: () => void;
  selectedDate?: string;
  selectedTimeSlot?: string;
}

export function TimeSlotSelection({ car, onNext, onBack, selectedDate, selectedTimeSlot }: TimeSlotSelectionProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getPageSettings();
      setTimeSlots(settings.timeSlots);
      setAvailableDates(settings.eventDates);
    };
    loadSettings();
  }, []);

  const [date, setDate] = useState(selectedDate || '');
  const [timeSlot, setTimeSlot] = useState(selectedTimeSlot || '');
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  // Load existing registrations to check for booked slots
  useEffect(() => {
    const loadBookedSlots = async () => {
      const registrations = await storageService.getRegistrations();
      const booked = new Set<string>();

      registrations.forEach((reg: any) => {
        if (reg.car?.id === car.id && reg.date === date) {
          booked.add(reg.timeSlot || '');
        }
      });

      setBookedSlots(booked);
    };

    if (date) {
      loadBookedSlots();
    }
  }, [date, car.id]);

  const isSlotBooked = (slot: string) => {
    return bookedSlots.has(slot);
  };

  const handleSubmit = () => {
    if (date && timeSlot) {
      onNext(date, timeSlot);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-slate-900 mb-2">Choose Your Test Drive Time</h2>
        <p className="text-slate-600">
          {car.name} {car.model}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-slate-700 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Select Date</span>
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
            {availableDates.map((d) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 ${date === d
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                  }`}
              >
                <div className="text-xs">{formatDateDisplay(d)}</div>
              </button>
            ))}
          </div>
        </div>

        {date && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <label className="flex items-center gap-2 text-slate-700 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Select Time Slot</span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {timeSlots.map((slot) => {
                const booked = isSlotBooked(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => !booked && setTimeSlot(slot)}
                    disabled={booked}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 relative transform ${booked
                      ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                      : timeSlot === slot
                        ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg ring-2 ring-blue-200 scale-105'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md hover:scale-105 active:scale-95'
                      }`}
                  >
                    {slot}
                    {booked && (
                      <span className="absolute top-1 right-1 text-xs text-red-500 font-bold">✕</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!date || !timeSlot}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-95 disabled:active:scale-100"
        >
          Continue
        </button>
      </div>
    </div>
  );
}