import { User, ShieldCheck, Car, Calendar, Trash2 } from 'lucide-react';
import { RegistrationData } from '../../App';
import { formatDate, formatDateTime } from '../../utils/formatters';

interface RegistrationListProps {
    registrations: RegistrationData[];
    onSelect: (registration: RegistrationData) => void;
    onDelete: (id: string) => void;
}

export function RegistrationList({ registrations, onSelect, onDelete }: RegistrationListProps) {
    if (registrations.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">No registrations found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {registrations.map((registration) => (
                <div
                    key={registration.registrationId}
                    className={`border-2 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer ${registration.completed
                            ? 'border-green-300 bg-green-50'
                            : 'border-slate-200'
                        }`}
                    onClick={() => onSelect(registration)}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm mb-1 flex-wrap">
                                    <User className="w-4 h-4" />
                                    <span>Customer</span>
                                    <div className="ml-auto flex items-center gap-2">
                                        {!registration.licenseVerified && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full border border-amber-300">
                                                <ShieldCheck className="w-3 h-3" />
                                                License Unverified
                                            </span>
                                        )}
                                        {registration.completed && (
                                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-900">
                                    {registration.firstName} {registration.lastName}
                                </p>
                                <p className="text-slate-600 text-sm">{registration.email}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                                    <Car className="w-4 h-4" />
                                    <span>Vehicle</span>
                                </div>
                                <p className="text-slate-900">{registration.car?.name}</p>
                                <p className="text-slate-600 text-sm">{registration.car?.model}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Schedule</span>
                                </div>
                                <p className="text-slate-900">{formatDate(registration.date)}</p>
                                <p className="text-slate-600 text-sm">{registration.timeSlot}</p>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(registration.registrationId!);
                            }}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-slate-500 text-xs">ID: {registration.registrationId}</p>
                        <p className="text-slate-500 text-xs">
                            Registered: {formatDateTime(registration.registeredAt)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
