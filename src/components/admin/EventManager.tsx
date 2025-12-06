import { useState, useEffect } from 'react';
import { Calendar, Archive, Plus, ChevronDown, Check } from 'lucide-react';
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
        const loadedEvents = await storageService.getEvents();
        setEvents(loadedEvents);

        // If no event is selected, select the active one
        if (!selectedEventId && loadedEvents.length > 0) {
            const activeEvent = loadedEvents.find(e => e.status === 'active');
            if (activeEvent) {
                onEventChange(activeEvent.id);
            }
        }
        setIsLoading(false);
    };

    const handleCreateEvent = async () => {
        if (!newEventName.trim()) return;

        setIsCreating(true);
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
        setIsCreating(false);
    };

    const handleArchiveEvent = async (eventId: string) => {
        const confirmed = window.confirm(
            'Are you sure you want to archive this event?\n\n' +
            'Archived events become read-only and new registrations cannot be added.'
        );

        if (!confirmed) return;

        const success = await storageService.archiveEvent(eventId);
        if (success) {
            setEvents(prev => prev.map(e =>
                e.id === eventId
                    ? { ...e, status: 'archived' as const, archivedAt: new Date().toISOString() }
                    : e
            ));

            // If we archived the selected event, switch to another active one
            if (selectedEventId === eventId) {
                const nextActive = events.find(e => e.id !== eventId && e.status === 'active');
                onEventChange(nextActive?.id || null);
            }
        }
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const activeEvents = events.filter(e => e.status === 'active');
    const archivedEvents = events.filter(e => e.status === 'archived');

    if (isLoading) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 mb-6">
                <div className="animate-pulse flex items-center gap-3">
                    <div className="w-5 h-5 bg-slate-700 rounded" />
                    <div className="h-4 w-32 bg-slate-700 rounded" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 mb-6">
                <div className="flex items-center justify-between gap-4">
                    {/* Event Selector */}
                    <div className="relative flex-1">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                <div className="text-left">
                                    <div className="text-sm text-slate-400">Current Event</div>
                                    <div className="font-medium text-white">
                                        {selectedEvent?.name || 'No event selected'}
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-50 max-h-80 overflow-y-auto">
                                {/* Active Events */}
                                {activeEvents.length > 0 && (
                                    <div>
                                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-700/30">
                                            Active Events
                                        </div>
                                        {activeEvents.map(event => (
                                            <button
                                                key={event.id}
                                                onClick={() => {
                                                    onEventChange(event.id);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-white">{event.name}</span>
                                                </div>
                                                {event.id === selectedEventId && (
                                                    <Check className="w-4 h-4 text-blue-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Archived Events */}
                                {archivedEvents.length > 0 && (
                                    <div>
                                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-700/30">
                                            Archived Events
                                        </div>
                                        {archivedEvents.map(event => (
                                            <button
                                                key={event.id}
                                                onClick={() => {
                                                    onEventChange(event.id);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors opacity-60"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                                                    <span className="text-slate-300">{event.name}</span>
                                                </div>
                                                {event.id === selectedEventId && (
                                                    <Check className="w-4 h-4 text-blue-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* No events message */}
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
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Event</span>
                        </button>

                        {selectedEvent && selectedEvent.status === 'active' && (
                            <button
                                onClick={() => handleArchiveEvent(selectedEvent.id)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg transition-colors font-medium border border-amber-600/30"
                            >
                                <Archive className="w-4 h-4" />
                                <span className="hidden sm:inline">Archive</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Event Info Footer */}
                {selectedEvent && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-4 text-sm text-slate-400">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedEvent.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700 text-slate-400'
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl shadow-xl max-w-md w-full border border-slate-700">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">Create New Event</h2>
                            <p className="text-slate-400 text-sm mt-1">
                                Create a new event to organize registrations
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Event Name *
                                </label>
                                <input
                                    type="text"
                                    value={newEventName}
                                    onChange={(e) => setNewEventName(e.target.value)}
                                    placeholder="e.g., Mercedes December 2024"
                                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Start Date (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={newEventStartDate}
                                        onChange={(e) => setNewEventStartDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        End Date (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={newEventEndDate}
                                        onChange={(e) => setNewEventEndDate(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewEventName('');
                                    setNewEventStartDate('');
                                    setNewEventEndDate('');
                                }}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                disabled={!newEventName.trim() || isCreating}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
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
