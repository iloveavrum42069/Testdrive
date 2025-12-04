import { useState, useEffect } from 'react';
import { RegistrationData } from '../App';
import { Calendar, Clock, Car } from 'lucide-react';
import { getPageSettings } from './PageEditor';
import { formatDateDisplay, formatDateShort } from '../utils/formatters';

interface ScheduleGridProps {
  registrations: RegistrationData[];
  onSelectBooking: (registration: RegistrationData) => void;
}

export function ScheduleGrid({ registrations, onSelectBooking }: ScheduleGridProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [cars, setCars] = useState<string[]>([]);
  const [eventDates, setEventDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getPageSettings();
      setTimeSlots(settings.timeSlots);
      setCars(settings.cars.map(c => c.name));
      setEventDates(settings.eventDates);
      if (settings.eventDates.length > 0) {
        setSelectedDate(settings.eventDates[0]);
      }
    };
    loadSettings();
  }, []);



  const getBookingForSlot = (carName: string, timeSlot: string) => {
    return registrations.find(
      (r) => r.car?.name === carName && r.timeSlot === timeSlot && r.date === selectedDate
    );
  };

  const getBookingsForDate = () => {
    return registrations.filter(r => r.date === selectedDate);
  };

  const getBookingsForCar = (carName: string) => {
    return registrations.filter(r => r.car?.name === carName && r.date === selectedDate);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Selector */}
      <div className="flex items-center gap-3 sm:gap-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {eventDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-3 sm:px-6 py-2 rounded-lg transition-all text-sm ${selectedDate === date
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-blue-100'
                }`}
            >
              <span className="hidden sm:inline">{formatDateDisplay(date)}</span>
              <span className="sm:hidden">{formatDateShort(date)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile View - Card Based */}
      <div className="block lg:hidden space-y-4">
        {/* Car Selector for Mobile */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <label className="text-slate-700 text-sm mb-2 block">Filter by Vehicle</label>
          <select
            value={selectedCar || ''}
            onChange={(e) => setSelectedCar(e.target.value || null)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Vehicles</option>
            {cars.map((car) => (
              <option key={car} value={car}>
                {car}
              </option>
            ))}
          </select>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {(selectedCar ? getBookingsForCar(selectedCar) : getBookingsForDate()).length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-slate-500">
                {selectedCar ? `No bookings for ${selectedCar} on this date` : 'No bookings on this date'}
              </p>
            </div>
          ) : (
            (selectedCar ? getBookingsForCar(selectedCar) : getBookingsForDate())
              .sort((a, b) => {
                const timeA = timeSlots.indexOf(a.timeSlot || '');
                const timeB = timeSlots.indexOf(b.timeSlot || '');
                return timeA - timeB;
              })
              .map((booking) => (
                <div
                  key={booking.registrationId}
                  onClick={() => onSelectBooking(booking)}
                  className={`rounded-xl shadow-lg p-4 border-2 hover:border-blue-300 transition-colors cursor-pointer ${booking.completed
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-200 bg-white'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-medium truncate">
                        {booking.firstName} {booking.lastName}
                      </p>
                      <p className="text-slate-600 text-sm truncate">{booking.email}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs flex-shrink-0 ${booking.completed
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-100 text-blue-700'
                      }`}>
                      {booking.completed ? 'Completed' : 'Booked'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Car className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{booking.car?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{booking.timeSlot}</span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Desktop View - Grid */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-x-auto">
        <div className="min-w-max">
          <div
            className="grid border-b-2 border-slate-200"
            style={{ gridTemplateColumns: `200px repeat(${timeSlots.length}, 80px)` }}
          >
            <div className="sticky left-0 bg-slate-100 p-3 border-r-2 border-slate-200">
              <span className="text-slate-700">Vehicle</span>
            </div>
            {timeSlots.map((time) => (
              <div
                key={time}
                className="bg-slate-100 p-2 text-center border-r border-slate-200"
              >
                <span className="text-slate-700 text-xs">{time}</span>
              </div>
            ))}
          </div>

          {cars.map((car, carIndex) => (
            <div
              key={car}
              className={`grid border-b border-slate-200 ${carIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              style={{ gridTemplateColumns: `200px repeat(${timeSlots.length}, 80px)` }}
            >
              <div className="sticky left-0 bg-inherit p-3 border-r-2 border-slate-200">
                <p className="text-slate-900 text-sm">{car}</p>
              </div>
              {timeSlots.map((timeSlot) => {
                const booking = getBookingForSlot(car, timeSlot);
                return (
                  <div
                    key={timeSlot}
                    className="border-r border-slate-200 p-1 min-h-[60px] flex items-center justify-center"
                  >
                    {booking ? (
                      <button
                        onClick={() => onSelectBooking(booking)}
                        className={`w-full h-full rounded text-xs p-1 transition-colors flex flex-col items-center justify-center ${booking.completed
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        title={`${booking.firstName} ${booking.lastName}${booking.completed ? ' (Completed)' : ''}`}
                      >
                        <span className="truncate max-w-full">
                          {booking.firstName}
                        </span>
                        <span className="truncate max-w-full">
                          {booking.lastName}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="text-xs">-</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}