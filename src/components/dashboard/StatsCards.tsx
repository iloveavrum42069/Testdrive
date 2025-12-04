import { Calendar, BellRing, TrendingUp } from 'lucide-react';
import { RegistrationData } from '../../App';
import { formatDate } from '../../utils/formatters';

interface StatsCardsProps {
    registrations: RegistrationData[];
}

export function StatsCards({ registrations }: StatsCardsProps) {
    // Calculate opt-in statistics
    const totalOptIns = registrations.filter(r => r.communicationOptIn).length;
    const totalOptInsPercentage = registrations.length > 0
        ? Math.round((totalOptIns / registrations.length) * 100)
        : 0;

    // Get unique dates and calculate opt-ins per date
    const uniqueDates = [...new Set(registrations.map(r => r.date))].filter(Boolean);
    const getOptInsForDate = (date: string) => {
        return registrations.filter(r => r.date === date && r.communicationOptIn).length;
    };
    const getTotalForDate = (date: string) => {
        return registrations.filter(r => r.date === date).length;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-slate-600 text-sm">Total Registrations</p>
                        <p className="text-slate-900 text-2xl font-semibold">{registrations.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <BellRing className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-slate-600 text-sm">Total Opt-Ins</p>
                        <p className="text-slate-900 text-2xl font-semibold">{totalOptIns}</p>
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-green-600 h-full transition-all duration-500"
                            style={{ width: `${totalOptInsPercentage}%` }}
                        />
                    </div>
                    <span className="text-slate-600 text-xs font-medium">{totalOptInsPercentage}%</span>
                </div>
            </div>

            {uniqueDates.slice(0, 2).map((date) => (
                <div key={date} className="bg-white rounded-xl shadow-lg p-4 border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-600 text-sm truncate">{formatDate(date)} Opt-Ins</p>
                            <p className="text-slate-900 text-2xl font-semibold">
                                {getOptInsForDate(date || '')} / {getTotalForDate(date || '')}
                            </p>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-purple-600 h-full transition-all duration-500"
                                style={{
                                    width: `${getTotalForDate(date || '') > 0 ? Math.round((getOptInsForDate(date || '') / getTotalForDate(date || '')) * 100) : 0}%`
                                }}
                            />
                        </div>
                        <span className="text-slate-600 text-xs font-medium">
                            {getTotalForDate(date || '') > 0 ? Math.round((getOptInsForDate(date || '') / getTotalForDate(date || '')) * 100) : 0}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
