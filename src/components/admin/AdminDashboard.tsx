import { useState, useEffect } from 'react';
import { RegistrationData } from '../../App';
import { LogOut, Search, Download, Grid3x3, List, Settings, Plus } from 'lucide-react';
import { ScheduleGrid } from './ScheduleGrid';
import { PageEditor, getPageSettings } from './PageEditor';
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
import { formatDateLong } from '../../utils/formatters';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // Event management state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Pass eventId to useRegistrations for event-filtered data
  const {
    registrations,
    deleteRegistration,
    toggleComplete,
    addRegistration,
    verifyLicense
  } = useRegistrations(selectedEventId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'schedule' | 'editor'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  const filteredRegistrations = registrations.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    return (
      r.firstName?.toLowerCase().includes(searchLower) ||
      r.lastName?.toLowerCase().includes(searchLower) ||
      r.email?.toLowerCase().includes(searchLower) ||
      r.car?.name?.toLowerCase().includes(searchLower) ||
      r.registrationId?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = (id: string) => {
    if (deleteRegistration(id)) {
      setSelectedRegistration(null);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const registration = registrations.find(r => r.registrationId === id);
    const wasCompleted = registration?.completed;

    const updated = await toggleComplete(id);
    if (selectedRegistration?.registrationId === id && updated) {
      setSelectedRegistration(updated);
    }

    // Send completion SMS if marking as complete (not incomplete) and feature is enabled
    if (!wasCompleted && updated?.completed && registration?.phone) {
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
    const updated = verifyLicense(id, initials);
    if (selectedRegistration?.registrationId === id && updated) {
      setSelectedRegistration(updated);
    }
    setShowVerifyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Event Manager - Only show for super admins */}
      {isSuperAdmin && (
        <EventManager
          selectedEventId={selectedEventId}
          onEventChange={setSelectedEventId}
        />
      )}

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, car, or ID..."
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
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
            <button
              onClick={() => setViewMode('schedule')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${viewMode === 'schedule' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule View</span>
              <span className="sm:hidden">Schedule</span>
            </button>

            {/* Only show Page Editor to super_admin */}
            {isSuperAdmin && (
              <button
                onClick={() => setViewMode('editor')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${viewMode === 'editor' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Page Editor</span>
                <span className="sm:hidden">Editor</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Registration</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <RegistrationList
            registrations={filteredRegistrations}
            onSelect={setSelectedRegistration}
            onDelete={handleDelete}
          />
        )}

        {viewMode === 'schedule' && (
          <ScheduleGrid
            registrations={registrations}
            onSelectBooking={setSelectedRegistration}
          />
        )}

        {viewMode === 'editor' && isSuperAdmin && (
          <PageEditor />
        )}
      </div>

      {selectedRegistration && (
        <RegistrationDetailModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onVerifyLicense={() => setShowVerifyModal(true)}
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