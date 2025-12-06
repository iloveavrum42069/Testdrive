import { useState, useEffect } from 'react';
import { RegistrationData } from '../../App';
import { Event } from '../../types';
import { LogOut, Search, Download, Grid3x3, List, Settings, Plus, RefreshCw } from 'lucide-react';
import { ScheduleGrid } from './ScheduleGrid';
import { PageEditor, getPageSettings, DEFAULT_SETTINGS } from './PageEditor';
import { AddRegistrationModal } from './AddRegistrationModal';
import { EventManager } from './EventManager';
import { useRegistrations } from '../../hooks/useRegistrations';
import { exportToCSV } from '../../utils/csvExport';
import { StatsCards } from './dashboard/StatsCards';
import { RegistrationList } from './dashboard/RegistrationList';
import { RegistrationDetailModal } from './dashboard/RegistrationDetailModal';
import { LicenseVerificationModal } from './dashboard/LicenseVerificationModal';
import { smsService } from '../../services/smsService';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { formatDateLong } from '../../utils/formatters';
import { toast } from 'sonner';
import { PageSettings } from '../../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // Event management state (super_admin only)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Get registrations - filtered by event if super_admin has one selected
  const {
    registrations,
    deleteRegistration,
    toggleComplete,
    addRegistration,
    verifyLicense,
    loadRegistrations
  } = useRegistrations(selectedEventId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'schedule' | 'editor'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [eventSettings, setEventSettings] = useState<PageSettings>(DEFAULT_SETTINGS);

  // Check for super_admin role
  useEffect(() => {
    const checkRole = async () => {
      const user = await authService.getUser();
      if (user?.user_metadata?.role === 'super_admin') {
        setIsSuperAdmin(true);
      }
    };
    checkRole();
  }, []);

  // Load event-specific settings when selectedEventId changes
  useEffect(() => {
    const loadEventSettings = async () => {
      if (selectedEventId) {
        const settings = await storageService.getEventSettings(selectedEventId, DEFAULT_SETTINGS);
        setEventSettings(settings);
      } else {
        // No event selected, use global settings
        const settings = await getPageSettings();
        setEventSettings(settings);
      }
    };
    loadEventSettings();
  }, [selectedEventId]);

  const filteredRegistrations = registrations.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      r.firstName?.toLowerCase().includes(searchLower) ||
      r.lastName?.toLowerCase().includes(searchLower) ||
      r.email?.toLowerCase().includes(searchLower) ||
      r.car?.name?.toLowerCase().includes(searchLower) ||
      r.registrationId?.toLowerCase().includes(searchLower)
    );

    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (deleteRegistration(id)) {
      setSelectedRegistration(null);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const registration = registrations.find(r => r.registrationId === id);
    if (!registration) return;

    const wasCompleted = registration.completed;
    const newStatus = !wasCompleted;

    // Call mutation (returns void now)
    await toggleComplete(id);

    // Optimistically update selected registration if it's the one open
    if (selectedRegistration?.registrationId === id) {
      setSelectedRegistration({ ...selectedRegistration, completed: newStatus });
    }

    // Send completion SMS if marking as complete (not incomplete) and feature is enabled
    // Note: We use newStatus here instead of updated?.completed
    if (!wasCompleted && newStatus && registration.phone) {
      try {
        const settings = await getPageSettings();
        if (settings.completionSmsEnabled && settings.completionSmsMessage) {
          const success = await smsService.sendCompletionSms({
            phone: registration.phone,
            messageTemplate: settings.completionSmsMessage,
            firstName: registration.firstName || '',
            lastName: registration.lastName || '',
            carName: registration.car ? `${registration.car.name} ${registration.car.model}` : '',
            date: registration.date ? formatDateLong(registration.date) : '',
            time: registration.timeSlot || '',
          });

          if (success) {
            toast.success('Completion SMS sent!');
          }
        }
      } catch (error) {
        console.error('Failed to send completion SMS:', error);
      }
    }
  };

  const handleVerify = (id: string, initials: string) => {
    verifyLicense(id, initials);
    // React Query will update the UI automatically
    setShowVerifyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Event Manager - Show to all admins */}
      <EventManager
        selectedEventId={selectedEventId}
        onEventChange={(id, event) => {
          setSelectedEventId(id);
          setSelectedEvent(event);
          // Force exit editor mode if switching to archived event
          if (event?.status === 'archived' && viewMode === 'editor') {
            setViewMode('list');
          }
          // Force exit schedule mode if switching to non-timed event
          if (event?.eventType === 'non_timed' && viewMode === 'schedule') {
            setViewMode('list');
          }
        }}
      />

      <StatsCards registrations={registrations} />

      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-slate-900 mb-1">Test Drive Registrations</h2>
            <p className="text-slate-600 text-sm">
              Total registrations: <span className="font-semibold">{registrations.length}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadRegistrations()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              title="Refresh registrations"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => exportToCSV(registrations)}
              disabled={registrations.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex-1 sm:flex-none"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search registrations by name, email, vehicle, or ID..."
              className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-slate-300 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-slate-500">
              Found <span className="font-semibold text-blue-600">{filteredRegistrations.length}</span> result{filteredRegistrations.length !== 1 ? 's' : ''} for "{searchTerm}"
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
              <span className="sm:hidden">List</span>
            </button>
            {/* Schedule View - Only show for timed events */}
            {selectedEvent?.eventType !== 'non_timed' && (
              <button
                onClick={() => setViewMode('schedule')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${viewMode === 'schedule' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="hidden sm:inline">Schedule View</span>
                <span className="sm:hidden">Schedule</span>
              </button>
            )}

            {/* Only show Page Editor to super_admin */}
            {isSuperAdmin && (
              <div className="relative group">
                <button
                  onClick={() => setViewMode('editor')}
                  disabled={selectedEvent?.status === 'archived'}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${viewMode === 'editor'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    } ${selectedEvent?.status === 'archived' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Page Editor</span>
                  <span className="sm:hidden">Editor</span>
                </button>
                {selectedEvent?.status === 'archived' && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center">
                    Page Editor disabled for archived events
                  </div>
                )}
              </div>
            )}

            <div className="relative group">
              <button
                onClick={() => setShowAddModal(true)}
                disabled={selectedEvent?.status === 'archived'}
                className={`flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm ${selectedEvent?.status === 'archived' ? 'opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400' : ''
                  }`}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Registration</span>
                <span className="sm:hidden">Add</span>
              </button>
              {selectedEvent?.status === 'archived' && (
                <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center">
                  Cannot add registrations to archived events
                </div>
              )}
            </div>
          </div>
        </div>

        {viewMode === 'list' && (
          <RegistrationList
            registrations={filteredRegistrations}
            onSelect={setSelectedRegistration}
            onDelete={handleDelete}
            isReadOnly={selectedEvent?.status === 'archived'}
          />
        )}

        {viewMode === 'schedule' && (
          <ScheduleGrid
            registrations={registrations}
            onSelectBooking={setSelectedRegistration}
            eventDates={eventSettings.eventDates}
            timeSlots={eventSettings.timeSlots}
            cars={eventSettings.cars}
          />
        )}

        {viewMode === 'editor' && isSuperAdmin && (
          <PageEditor
            eventId={selectedEventId}
            isReadOnly={selectedEvent?.status === 'archived'}
          />
        )}
      </div>

      {selectedRegistration && (
        <RegistrationDetailModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onVerifyLicense={() => setShowVerifyModal(true)}
          isReadOnly={selectedEvent?.status === 'archived'}
        />
      )}

      {showAddModal && (
        <AddRegistrationModal
          onClose={() => setShowAddModal(false)}
          onSave={addRegistration}
        />
      )}

      {showVerifyModal && selectedRegistration && (
        <LicenseVerificationModal
          registration={selectedRegistration}
          onClose={() => setShowVerifyModal(false)}
          onVerify={handleVerify}
        />
      )}
    </div>
  );
}