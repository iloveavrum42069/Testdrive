import { useState, useEffect, useCallback } from 'react';
import { Car } from '../App';
import { Calendar, Clock, ChevronLeft, AlertCircle, Timer } from 'lucide-react';
import { getPageSettings } from './PageEditor';
import { formatDateDisplay } from '../utils/formatters';
import { storageService } from '../services/storageService';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface TimeSlotSelectionProps {
  car: Car;
  onNext: (date: string, timeSlot: string, sessionId: string) => void;
  onBack: () => void;
  selectedDate?: string;
  selectedTimeSlot?: string;
  sessionId: string;
}

export function TimeSlotSelection({ car, onNext, onBack, selectedDate, selectedTimeSlot, sessionId }: TimeSlotSelectionProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [date, setDate] = useState(selectedDate || '');
  const [timeSlot, setTimeSlot] = useState(selectedTimeSlot || '');
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [heldSlots, setHeldSlots] = useState<Set<string>>(new Set());
  const [myHeldSlot, setMyHeldSlot] = useState<string | null>(null);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number>(0);
  const [isCreatingHold, setIsCreatingHold] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getPageSettings();
      setTimeSlots(settings.timeSlots);
      setAvailableDates(settings.eventDates);
    };
    loadSettings();
  }, []);

  // Load booked and held slots
  const loadSlotStatus = useCallback(async () => {
    if (!date || !car.id) return;

    const registrations = await storageService.getRegistrations();
    const booked = new Set<string>();
    const held = new Set<string>();

    registrations.forEach((reg: any) => {
      if (reg.car?.id === car.id && reg.date === date) {
        booked.add(reg.timeSlot || '');
      }
    });

    // Check holds for each time slot
    for (const slot of timeSlots) {
      if (!booked.has(slot)) {
        const isAvailable = await storageService.isSlotAvailable(car.id, date, slot, sessionId);
        if (!isAvailable) {
          // Check if it's our hold
          const hold = await storageService.getSlotHold(car.id, date, slot);
          if (hold && hold.session_id === sessionId) {
            setMyHeldSlot(slot);
            const remaining = Math.max(0, new Date(hold.expires_at).getTime() - Date.now());
            setHoldTimeRemaining(Math.floor(remaining / 1000));
          } else if (hold) {
            held.add(slot);
          }
        }
      }
    }

    setBookedSlots(booked);
    setHeldSlots(held);
  }, [date, car.id, timeSlots, sessionId]);

  // Real-time subscriptions for instant updates across devices
  useEffect(() => {
    if (!date || !car.id) return;

    // Subscribe to slot_holds changes
    const holdsChannel = supabase
      .channel('slot_holds_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slot_holds',
          filter: `car_id=eq.${car.id}`,
        },
        () => {
          // Refresh slot status when any hold changes
          loadSlotStatus();
        }
      )
      .subscribe();

    // Subscribe to registrations changes
    const registrationsChannel = supabase
      .channel('registrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
        },
        () => {
          // Refresh slot status when any registration changes
          loadSlotStatus();
        }
      )
      .subscribe();

    // Initial load
    loadSlotStatus();

    // Backup polling every 30 seconds (in case real-time fails)
    const interval = setInterval(loadSlotStatus, 30000);

    return () => {
      supabase.removeChannel(holdsChannel);
      supabase.removeChannel(registrationsChannel);
      clearInterval(interval);
    };
  }, [date, car.id, loadSlotStatus]);

  // Countdown timer for hold
  useEffect(() => {
    if (holdTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setHoldTimeRemaining(prev => {
        if (prev <= 1) {
          // Hold expired
          setMyHeldSlot(null);
          setTimeSlot('');
          toast.warning('Your slot hold has expired. Please select a new time.');
          loadSlotStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [holdTimeRemaining, loadSlotStatus]);

  const handleSlotSelect = async (slot: string) => {
    if (bookedSlots.has(slot) || heldSlots.has(slot)) return;
    if (isCreatingHold) return;

    setIsCreatingHold(true);

    // Release previous hold if any
    if (myHeldSlot && myHeldSlot !== slot) {
      await storageService.releaseSlotHold(car.id, date, myHeldSlot, sessionId);
      setMyHeldSlot(null);
    }

    // Create new hold
    const success = await storageService.createSlotHold(car.id, date, slot, sessionId);

    if (success) {
      setTimeSlot(slot);
      setMyHeldSlot(slot);
      setHoldTimeRemaining(6 * 60); // 6 minutes
      toast.success('Time slot reserved for 6 minutes');
    } else {
      toast.error('This slot was just taken. Please choose another.');
      await loadSlotStatus();
    }

    setIsCreatingHold(false);
  };

  const handleBack = async () => {
    // Release hold when going back
    if (myHeldSlot) {
      await storageService.releaseSlotHold(car.id, date, myHeldSlot, sessionId);
    }
    onBack();
  };

  const handleSubmit = () => {
    if (date && timeSlot) {
      onNext(date, timeSlot, sessionId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isSlotUnavailable = (slot: string) => {
    return bookedSlots.has(slot) || (heldSlots.has(slot) && slot !== myHeldSlot);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-slate-900 mb-2">Choose Your Test Drive Time</h2>
        <p className="text-slate-600">
          {car.name} {car.model}
        </p>
      </div>

      {/* Hold Timer */}
      {myHeldSlot && holdTimeRemaining > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Time slot <strong>{myHeldSlot}</strong> reserved for you
              </span>
            </div>
            <div className={`font-mono text-lg font-bold ${holdTimeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-blue-700'}`}>
              {formatTime(holdTimeRemaining)}
            </div>
          </div>
          {holdTimeRemaining < 60 && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Less than 1 minute remaining! Complete your registration soon.
            </p>
          )}
        </div>
      )}

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
                onClick={() => {
                  setDate(d);
                  setTimeSlot('');
                  if (myHeldSlot) {
                    storageService.releaseSlotHold(car.id, date, myHeldSlot, sessionId);
                    setMyHeldSlot(null);
                  }
                }}
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
              <span className="text-sm text-slate-500">(Click to reserve)</span>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {timeSlots.map((slot) => {
                const booked = bookedSlots.has(slot);
                const heldByOther = heldSlots.has(slot);
                const isMyHold = slot === myHeldSlot;
                const unavailable = booked || heldByOther;

                return (
                  <button
                    key={slot}
                    onClick={() => !unavailable && handleSlotSelect(slot)}
                    disabled={unavailable || isCreatingHold}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 relative transform ${booked
                      ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                      : heldByOther
                        ? 'border-orange-200 bg-orange-50 text-orange-400 cursor-not-allowed opacity-60'
                        : isMyHold
                          ? 'border-green-600 bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-lg ring-2 ring-green-200 scale-105'
                          : timeSlot === slot
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg ring-2 ring-blue-200 scale-105'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md hover:scale-105 active:scale-95'
                      }`}
                  >
                    {slot}
                    {booked && (
                      <span className="absolute top-1 right-1 text-xs text-red-500 font-bold">✕</span>
                    )}
                    {heldByOther && (
                      <span className="absolute top-1 right-1 text-xs text-orange-500 font-bold">⏳</span>
                    )}
                    {isMyHold && (
                      <span className="absolute top-1 right-1 text-xs text-green-500 font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200"></span> Booked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200"></span> Held by another</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200"></span> Your hold</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!date || !timeSlot || !myHeldSlot}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-95 disabled:active:scale-100"
        >
          Continue
        </button>
      </div>
    </div>
  );
}