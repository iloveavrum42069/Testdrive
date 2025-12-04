import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { RegistrationData, Car } from '../App';
import { getPageSettings } from './PageEditor';
import { storageService } from '../services/storageService';

interface AddRegistrationModalProps {
  onClose: () => void;
  onSave: (registration: RegistrationData) => void;
}

export function AddRegistrationModal({ onClose, onSave }: AddRegistrationModalProps) {
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getPageSettings();
      setAvailableCars(settings.cars);
      setAvailableDates(settings.eventDates);
      setAvailableTimeSlots(settings.timeSlots);
    };
    loadSettings();
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    carId: '',
    date: '',
    timeSlot: '',
    agreedToTOS: true,
    optInMarketing: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  // Load booked slots when car or date changes (optimized - only 2 DB queries)
  useEffect(() => {
    const loadBookedSlots = async () => {
      if (formData.carId && formData.date) {
        const status = await storageService.getSlotStatusBatch(formData.carId, formData.date, 'admin');
        // Combine booked and held slots for admin view
        const allUnavailable = new Set([...status.bookedSlots, ...status.heldSlots]);
        setBookedSlots(allUnavailable);
      }
    };
    loadBookedSlots();
  }, [formData.carId, formData.date]);

  const isSlotBooked = (slot: string) => {
    return bookedSlots.has(slot);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.carId) newErrors.carId = 'Please select a vehicle';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Please select a time slot';
    } else if (isSlotBooked(formData.timeSlot)) {
      newErrors.timeSlot = 'This time slot is already booked';
    }
    if (!formData.agreedToTOS) newErrors.agreedToTOS = 'You must agree to the terms of service';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const selectedCar = availableCars.find(car => car.id === formData.carId);

    const registration: RegistrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      car: selectedCar,
      date: formData.date,
      timeSlot: formData.timeSlot,
      signature: 'Admin Added',
      registrationId: `TD${Date.now()}`,
      registeredAt: new Date().toISOString(),
      agreedToTOS: formData.agreedToTOS,
      communicationOptIn: formData.optInMarketing,
    };

    onSave(registration);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-slate-900">Add Test Drive Registration</h3>
              <p className="text-slate-600 text-sm">Manually add a new registration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-slate-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.firstName ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                />
                {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-slate-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.lastName ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                />
                {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-slate-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <h4 className="text-slate-900 mb-4">Vehicle Selection</h4>
            <div>
              <label className="block text-slate-700 mb-2">Select Vehicle *</label>
              <select
                name="carId"
                value={formData.carId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.carId ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
              >
                <option value="">Choose a vehicle...</option>
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name} - {car.model}
                  </option>
                ))}
              </select>
              {errors.carId && <p className="text-red-600 text-sm mt-1">{errors.carId}</p>}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="text-slate-900 mb-4">Schedule</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-2">Date *</label>
                <select
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.date ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                >
                  <option value="">Select date...</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-slate-700 mb-2">Time Slot *</label>
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${errors.timeSlot ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  disabled={!formData.carId || !formData.date}
                >
                  <option value="">
                    {!formData.carId || !formData.date
                      ? 'Select vehicle and date first...'
                      : 'Select time...'
                    }
                  </option>
                  {availableTimeSlots.map((slot) => {
                    const booked = isSlotBooked(slot);
                    return (
                      <option key={slot} value={slot} disabled={booked}>
                        {slot} {booked ? '(Booked)' : ''}
                      </option>
                    );
                  })}
                </select>
                {errors.timeSlot && <p className="text-red-600 text-sm mt-1">{errors.timeSlot}</p>}
                {formData.carId && formData.date && bookedSlots.size > 0 && (
                  <p className="text-amber-600 text-sm mt-1">
                    {bookedSlots.size} slot(s) already booked for this vehicle/date
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Terms of Service and Marketing Opt-In */}
          <div>
            <h4 className="text-slate-900 mb-4">Terms of Service and Marketing Opt-In</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-2">Agree to Terms of Service *</label>
                <input
                  type="checkbox"
                  name="agreedToTOS"
                  checked={formData.agreedToTOS}
                  onChange={handleCheckboxChange}
                  className={`w-4 h-4 border-2 rounded-lg focus:outline-none transition-colors ${errors.agreedToTOS ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                />
                {errors.agreedToTOS && <p className="text-red-600 text-sm mt-1">{errors.agreedToTOS}</p>}
              </div>

              <div>
                <label className="block text-slate-700 mb-2">Opt-In to Marketing</label>
                <input
                  type="checkbox"
                  name="optInMarketing"
                  checked={formData.optInMarketing}
                  onChange={handleCheckboxChange}
                  className={`w-4 h-4 border-2 rounded-lg focus:outline-none transition-colors ${errors.agreedToTOS ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}