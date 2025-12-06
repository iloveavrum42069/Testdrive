import { useState, useEffect } from 'react';
import { Calendar, Archive, Plus, ChevronDown, Check, X } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Event } from '../../types';
import { formatDateLong } from '../../utils/formatters';

interface EventManagerProps {
    selectedEventId: string | null;
    onEventChange: (eventId: string | null) => void;
}

export function EventManager({ selectedEventId, onEventChange }: EventManagerProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [newEventStartDate, setNewEventStartDate] = useState('');
    const [newEventEndDate, setNewEventEndDate] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const loadedEvents = await storageService.getEvents();
            setEvents(loadedEvents);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEventName.trim()) return;

        setIsCreating(true);
        try {
            const newEvent = await storageService.createEvent(
                newEventName.trim(),
                newEventStartDate || undefined,
                newEventEndDate || undefined
            );

            if (newEvent) {
                setEvents(prev => [newEvent, ...prev]);
                onEventChange(newEvent.id);
                setShowCreateModal(false);
                setNewEventName('');
                setNewEventStartDate('');
                setNewEventEndDate('');
            }
        } catch (error) {
            console.error('Failed to create event:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleArchiveEvent = async (eventId: string) => {
        const confirmed = window.confirm(
            'Are you sure you want to archive this event?\n\n' +
            'Archived events become read-only and new registrations cannot be added.'
        );

        if (!confirmed) return;

        try {
            const success = await storageService.archiveEvent(eventId);
            if (success) {
                setEvents(prev => prev.map(e =>
                    e.id === eventId
                        ? { ...e, status: 'archived' as const, archivedAt: new Date().toISOString() }
                        : e
                ));

                if (selectedEventId === eventId) {
                    const nextActive = events.find(e => e.id !== eventId && e.status === 'active');
                    onEventChange(nextActive?.id || null);
                }
            }
        } catch (error) {
            console.error('Failed to archive event:', error);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setNewEventName('');
        setNewEventStartDate('');
        setNewEventEndDate('');
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const activeEvents = events.filter(e => e.status === 'active');
    const archivedEvents = events.filter(e => e.status === 'archived');

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="animate-pulse flex items-center gap-3">
                    <div className="w-5 h-5 bg-slate-200 rounded" />
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between gap-4">
                    {/* Event Selector */}
                    <div className="relative flex-1">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <div className="text-left">
                                    <div className="text-xs text-slate-500">Current Event</div>
                                    <div className="font-medium text-slate-800">
                                        {selectedEvent?.name || 'Select an event'}
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-80 overflow-y-auto">
                                {/* All Registrations Option */}
                                <button
                                    onClick={() => {
                                        onEventChange(null);
                                        setShowDropdown(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-slate-700 font-medium">All Registrations</span>
                                    </div>
                                    {selectedEventId === null && (
                                        <Check className="w-4 h-4 text-blue-500" />
                                    )}
                                </button>

                                {/* Active Events */}
                                {activeEvents.length > 0 && (
                                    <div>
                                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                                            Active Events
                                        </div>
                                        {activeEvents.map(event => (
                                            <button
                                                key={event.id}
                                                onClick={() => {
                                                    onEventChange(event.id);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-slate-700">{event.name}</span>
                                                </div>
                                                {event.id === selectedEventId && (
                                                    <Check className="w-4 h-4 text-blue-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Archived Events */}
                                {archivedEvents.length > 0 && (
                                    <div>
                                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                                            Archived Events
                                        </div>
                                        {archivedEvents.map(event => (
                                            <button
                                                key={event.id}
                                                onClick={() => {
                                                    onEventChange(event.id);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors opacity-60"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                                                    <span className="text-slate-500">{event.name}</span>
                                                </div>
                                                {event.id === selectedEventId && (
                                                    <Check className="w-4 h-4 text-blue-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {events.length === 0 && (
                                    <div className="px-4 py-6 text-center text-slate-400">
                                        No events yet. Create your first event!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Event</span>
                        </button>

                        {selectedEvent && selectedEvent.status === 'active' && (
                            <button
                                onClick={() => handleArchiveEvent(selectedEvent.id)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors font-medium"
                            >
                                <Archive className="w-4 h-4" />
                                <span className="hidden sm:inline">Archive</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Event Info Footer */}
                {selectedEvent && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedEvent.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                            }`}>
                            {selectedEvent.status === 'active' ? 'Active' : 'Archived'}
                        </span>
                        {selectedEvent.startDate && (
                            <span>Starts: {formatDateLong(selectedEvent.startDate)}</span>
                        )}
                        {selectedEvent.endDate && (
                            <span>Ends: {formatDateLong(selectedEvent.endDate)}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 isolate"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-[10000]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Create New Event</h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Create a new event to organize registrations
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Event Name *
                                </label>
                                <input
                                    type="text"
                                    value={newEventName}
                                    onChange={(e) => setNewEventName(e.target.value)}
                                    placeholder="e.g., Mercedes December 2024"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Start Date (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={newEventStartDate}
                                        onChange={(e) => setNewEventStartDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        End Date (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={newEventEndDate}
                                        onChange={(e) => setNewEventEndDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                disabled={!newEventName.trim() || isCreating}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                            >
                                {isCreating ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

