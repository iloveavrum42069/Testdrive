import { useState, useEffect } from 'react';
import { Save, RotateCcw, Clock, MessageSquare } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { PageSettings, Car } from '../../types';

// Re-export for backward compatibility
export type { PageSettings } from '../../types';

export const DEFAULT_SETTINGS: PageSettings = {
  heroTitle: 'Traxion Events',
  heroSubtitle: '',
  eventDates: ['2025-12-05', '2025-12-06'],
  timeSlots: [
    '10:00 AM',
    '10:20 AM',
    '10:40 AM',
    '11:00 AM',
    '11:20 AM',
    '11:40 AM',
    '12:00 PM',
    '12:20 PM',
    '12:40 PM',
    '1:00 PM',
    '1:20 PM',
    '1:40 PM',
    '2:00 PM',
    '2:20 PM',
    '2:40 PM',
    '3:00 PM',
    '3:20 PM',
    '3:40 PM',
    '4:00 PM',
    '4:20 PM',
    '4:40 PM',
    '5:00 PM',
  ],
  waiverText: `I hereby acknowledge that I am participating in a test drive event at my own risk. I understand that driving involves inherent risks and I accept full responsibility for any injuries or damages that may occur during the test drive.

I confirm that I hold a valid driver's license and am legally permitted to operate a motor vehicle. I agree to follow all traffic laws and instructions provided by the event staff.

I release the event organizers, Ford Motor Company, and all affiliated parties from any liability for accidents, injuries, or damages that may occur during or as a result of the test drive.

I consent to the collection and use of my personal information for the purposes of this test drive event and future communications about Ford products and services.`,
  footerText: '© 2025 Traxion Events. All rights reserved.',
  parentalConsentText: 'I, the undersigned, am the parent or legal guardian of the minor named above. I hereby give my consent for them to participate in the test drive event as a passenger.',
  cars: [
    {
      id: '1',
      name: 'Ford Mustang Mach-E',
      model: 'Premium AWD',
      year: 2024,
      type: 'Electric SUV',
      image: 'https://images.unsplash.com/photo-1674432007374-07be6a6f3022?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '2',
      name: 'Ford F-150 Lightning',
      model: 'Lariat',
      year: 2024,
      type: 'Electric Truck',
      image: 'https://images.unsplash.com/photo-1712095314604-a9fd6c3a3a58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '3',
      name: 'Ford Bronco',
      model: 'Badlands',
      year: 2024,
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1673376450323-8e335f5b4817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '4',
      name: 'Ford Bronco Sport',
      model: 'Outer Banks',
      year: 2024,
      type: 'Compact SUV',
      image: 'https://images.unsplash.com/photo-1683030727368-fd95691cb169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '5',
      name: 'Ford Mustang',
      model: 'GT Premium',
      year: 2024,
      type: 'Sports Car',
      image: 'https://images.unsplash.com/photo-1702451122321-165764887222?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '6',
      name: 'Ford Expedition',
      model: 'Platinum',
      year: 2024,
      type: 'Full-Size SUV',
      image: 'https://images.unsplash.com/photo-1609361528533-6731d909ab6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
  ],
  // Completion SMS settings
  completionSmsEnabled: false,
  completionSmsMessage: 'Hi {firstName}! Thanks for test driving the {carName} with Traxion Events! We hope you enjoyed the experience.',
};

interface PageEditorProps {
  onSave?: () => void;
}

export function PageEditor({ onSave }: PageEditorProps) {
  const [settings, setSettings] = useState<PageSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'schedule' | 'cars' | 'waiver' | 'sms'>('general');

  // Time Slot Generator State
  const [genStartTime, setGenStartTime] = useState('');
  const [genEndTime, setGenEndTime] = useState('');
  const [genInterval, setGenInterval] = useState(20);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await storageService.getPageSettings(DEFAULT_SETTINGS);
    setSettings(saved);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    const success = await storageService.setPageSettings(settings);

    setTimeout(() => {
      setIsSaving(false);
      if (success) {
        if (onSave) onSave();
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings. Please try again.');
      }
    }, 500);
  };

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
      await storageService.setPageSettings(DEFAULT_SETTINGS);
      alert('Settings reset to defaults.');
    }
  };

  const updateCar = (index: number, field: string, value: string | number) => {
    const newCars = [...settings.cars];
    newCars[index] = { ...newCars[index], [field]: value };
    setSettings({ ...settings, cars: newCars });
  };

  const addCar = () => {
    const newCar = {
      id: String(Date.now()),
      name: 'New Vehicle',
      model: 'Model Name',
      year: 2024,
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    };
    setSettings({ ...settings, cars: [...settings.cars, newCar] });
  };

  const removeCar = (index: number) => {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      const newCars = settings.cars.filter((_, i) => i !== index);
      setSettings({ ...settings, cars: newCars });
    }
  };

  const addTimeSlot = () => {
    const newSlot = prompt('Enter new time slot (e.g., "6:00 PM"):');
    if (newSlot) {
      setSettings({ ...settings, timeSlots: [...settings.timeSlots, newSlot] });
    }
  };

  const removeTimeSlot = (index: number) => {
    const newSlots = settings.timeSlots.filter((_, i) => i !== index);
    setSettings({ ...settings, timeSlots: newSlots });
  };

  const generateTimeSlots = (startTime: string, endTime: string, intervalMinutes: number) => {
    const slots: string[] = [];

    // Parse time string like "10:00 AM" or "2:30 PM"
    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return null;

      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes; // Return total minutes from midnight
    };

    // Format minutes back to time string
    const formatTime = (totalMinutes: number) => {
      let hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';

      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;

      return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    if (!startMinutes || !endMinutes || startMinutes >= endMinutes) {
      alert('Invalid time range. Please check your start and end times.');
      return;
    }

    let currentMinutes = startMinutes;
    while (currentMinutes <= endMinutes) {
      slots.push(formatTime(currentMinutes));
      currentMinutes += intervalMinutes;
    }

    setSettings({ ...settings, timeSlots: slots });
  };

  const addEventDate = () => {
    const newDate = prompt('Enter new date (YYYY-MM-DD format):');
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      setSettings({ ...settings, eventDates: [...settings.eventDates, newDate] });
    } else if (newDate) {
      alert('Invalid date format. Please use YYYY-MM-DD');
    }
  };

  const removeEventDate = (index: number) => {
    const newDates = settings.eventDates.filter((_, i) => i !== index);
    setSettings({ ...settings, eventDates: newDates });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-slate-900 mb-1">Page Editor</h2>
            <p className="text-slate-600 text-sm sm:text-base">Customize all aspects of the registration page</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm flex-1 sm:flex-none"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset to Defaults</span>
              <span className="sm:hidden">Reset</span>
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm flex-1 sm:flex-none"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
          <div className="flex gap-1 sm:gap-2 border-b border-slate-200 min-w-max">
            {[
              { id: 'general', label: 'General' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'cars', label: 'Vehicles' },
              { id: 'waiver', label: 'Waiver' },
              { id: 'sms', label: 'SMS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-4 py-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-slate-700 mb-2">Hero Title</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2">Hero Subtitle</label>
              <input
                type="text"
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2">Footer Text</label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-slate-700">Event Dates</label>
                <button
                  onClick={addEventDate}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  + Add Date
                </button>
              </div>
              <div className="space-y-2">
                {settings.eventDates.map((date, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => {
                        const newDates = [...settings.eventDates];
                        newDates[index] = e.target.value;
                        setSettings({ ...settings, eventDates: newDates });
                      }}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => removeEventDate(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-slate-700">Time Slots</label>
              </div>

              {/* Time Slot Generator */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-slate-900 font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Automatic Time Slot Generator
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-slate-700 text-sm mb-1">Start Time</label>
                    <input
                      type="text"
                      value={genStartTime}
                      onChange={(e) => setGenStartTime(e.target.value)}
                      placeholder="e.g., 10:00 AM"
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1">End Time</label>
                    <input
                      type="text"
                      value={genEndTime}
                      onChange={(e) => setGenEndTime(e.target.value)}
                      placeholder="e.g., 5:00 PM"
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm mb-1">Interval (minutes)</label>
                    <input
                      type="number"
                      value={genInterval}
                      onChange={(e) => setGenInterval(parseInt(e.target.value) || 20)}
                      placeholder="e.g., 20"
                      min="1"
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (genStartTime && genEndTime && genInterval) {
                      generateTimeSlots(genStartTime, genEndTime, genInterval);
                    } else {
                      alert('Please fill in all fields (Start Time, End Time, and Interval)');
                    }
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  🎯 Generate Time Slots
                </button>
                <p className="text-slate-600 text-xs mt-2">
                  💡 Tip: Enter times in format "10:00 AM" or "2:30 PM"
                </p>
              </div>

              {/* Manual Controls */}
              <div className="flex items-center justify-between mb-3 bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-700 text-sm font-medium">
                  Current Slots: <span className="text-blue-600 font-bold">{settings.timeSlots.length}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={addTimeSlot}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    + Add Single Slot
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Clear all time slots?')) {
                        setSettings({ ...settings, timeSlots: [] });
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Time Slots Display */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {settings.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200 hover:border-blue-300 transition-colors">
                    <span className="flex-1 text-sm font-medium text-slate-700">{slot}</span>
                    <button
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {settings.timeSlots.length === 0 && (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No time slots configured</p>
                  <p className="text-sm">Use the generator above to create slots automatically</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cars Tab */}
        {activeTab === 'cars' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-600">Manage the vehicle lineup for test drives</p>
              <button
                onClick={addCar}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Vehicle
              </button>
            </div>

            {settings.cars.map((car, index) => (
              <div key={car.id} className="border-2 border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-slate-900">Vehicle {index + 1}</h4>
                  <button
                    onClick={() => removeCar(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove Vehicle
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm mb-1">Name</label>
                    <input
                      type="text"
                      value={car.name}
                      onChange={(e) => updateCar(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm mb-1">Model</label>
                    <input
                      type="text"
                      value={car.model}
                      onChange={(e) => updateCar(index, 'model', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm mb-1">Year</label>
                    <input
                      type="number"
                      value={car.year}
                      onChange={(e) => updateCar(index, 'year', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm mb-1">Type</label>
                    <input
                      type="text"
                      value={car.type}
                      onChange={(e) => updateCar(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 text-sm mb-1">Image URL</label>
                    <input
                      type="text"
                      value={car.image}
                      onChange={(e) => updateCar(index, 'image', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Waiver Tab */}
        {activeTab === 'waiver' && (
          <div>
            <div className="mb-6">
              <label className="block text-slate-700 mb-2">Waiver Text</label>
              <textarea
                value={settings.waiverText}
                onChange={(e) => setSettings({ ...settings, waiverText: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
              <p className="text-slate-500 text-sm mt-2">
                This text will be displayed on the waiver signature page
              </p>
            </div>

            <div>
              <label className="block text-slate-700 mb-2">Parental Consent Text (for Minors)</label>
              <textarea
                value={settings.parentalConsentText || ''}
                onChange={(e) => setSettings({ ...settings, parentalConsentText: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
              <p className="text-slate-500 text-sm mt-2">
                This text will be displayed on the PDF for minor passengers
              </p>
            </div>
          </div>
        )}

        {/* SMS Settings Tab */}
        {activeTab === 'sms' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <h4 className="text-slate-900 font-semibold mb-2">Completion SMS</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Send an automatic SMS to customers when you mark their test drive as complete.
                  </p>

                  {/* Toggle Switch - Enhanced with smooth animations */}
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, completionSmsEnabled: !settings.completionSmsEnabled })}
                    className="group inline-flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
                  >
                    <div className={`relative w-14 h-8 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl ${settings.completionSmsEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-slate-300 to-slate-400'}`}>
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${settings.completionSmsEnabled ? 'translate-x-6 scale-110' : 'translate-x-0 scale-100'}`}>
                        {/* Animated checkmark or x icon */}
                        <div className={`transition-all duration-200 ${settings.completionSmsEnabled ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                          <svg className="w-3 h-3 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                      {/* Animated glow effect */}
                      <div className={`absolute inset-0 rounded-full blur-sm transition-opacity duration-300 ${settings.completionSmsEnabled ? 'opacity-50 bg-green-400' : 'opacity-0'}`}></div>
                    </div>
                    <span className={`font-semibold transition-all duration-300 group-hover:translate-x-1 ${settings.completionSmsEnabled ? 'text-green-700' : 'text-slate-600'}`}>
                      {settings.completionSmsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Message Template */}
            <div className={`transition-opacity ${settings.completionSmsEnabled ? 'opacity-100' : 'opacity-50'}`}>
              <label className="block text-slate-700 mb-2 font-medium">Message Template</label>
              <textarea
                value={settings.completionSmsMessage ?? ''}
                onChange={(e) => setSettings({ ...settings, completionSmsMessage: e.target.value })}
                disabled={!settings.completionSmsEnabled}
                rows={4}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="Enter your completion message..."
              />

              {/* Placeholder Help */}
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 text-sm font-medium mb-2">Available Placeholders:</p>
                <div className="flex flex-wrap gap-2">
                  {['{firstName}', '{lastName}', '{carName}', '{date}', '{time}'].map((placeholder) => (
                    <code
                      key={placeholder}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                      onClick={() => {
                        if (settings.completionSmsEnabled) {
                          setSettings({
                            ...settings,
                            completionSmsMessage: (settings.completionSmsMessage ?? '') + placeholder
                          });
                        }
                      }}
                    >
                      {placeholder}
                    </code>
                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-2">Click a placeholder to add it to your message</p>
              </div>
            </div>

            {/* Preview */}
            {settings.completionSmsEnabled && (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                <p className="text-slate-700 text-sm font-medium mb-2">Preview (example):</p>
                <p className="text-slate-900 text-sm italic">
                  "{(settings.completionSmsMessage ?? '')
                    .replace('{firstName}', 'John')
                    .replace('{lastName}', 'Doe')
                    .replace('{carName}', 'Ford Mustang Mach-E')
                    .replace('{date}', 'Dec 5, 2025')
                    .replace('{time}', '2:00 PM')}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export async function getPageSettings(): Promise<PageSettings> {
  return await storageService.getPageSettings(DEFAULT_SETTINGS);
}