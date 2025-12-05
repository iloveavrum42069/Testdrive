import { Car, Calendar, Clock, User, Mail, Phone, CheckCircle, BellRing, ShieldCheck, Users, Trash2, Download } from 'lucide-react';
import { RegistrationData } from '../../../App';
import { formatDate, formatDateTime } from '../../../utils/formatters';

interface RegistrationDetailModalProps {
    registration: RegistrationData;
    onClose: () => void;
    onToggleComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onVerifyLicense: () => void;
}

export function RegistrationDetailModal({
    registration,
    onClose,
    onToggleComplete,
    onDelete,
    onVerifyLicense
}: RegistrationDetailModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between z-10">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-slate-900 mb-1 truncate">Registration Details</h3>
                        <p className="text-slate-600 text-xs sm:text-sm truncate">{registration.registrationId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 text-2xl leading-none ml-4 flex-shrink-0"
                    >
                        ×
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4 mb-4">
                            <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-slate-900 mb-1">Vehicle Information</h4>
                                <p className="text-slate-700">
                                    {registration.car?.name} {registration.car?.model}
                                </p>
                                <p className="text-slate-600 text-sm">
                                    {registration.car?.year} • {registration.car?.type}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-slate-700 text-sm">Date</p>
                                    <p className="text-slate-900">{formatDate(registration.date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-slate-700 text-sm">Time</p>
                                    <p className="text-slate-900">{registration.timeSlot}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 sm:p-6">
                        <h4 className="text-slate-900 mb-4">Customer Information</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-slate-700 text-sm">Name</p>
                                    <p className="text-slate-900 break-words">
                                        {registration.firstName} {registration.lastName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-slate-700 text-sm">Email</p>
                                    <p className="text-slate-900 break-words text-sm sm:text-base">{registration.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-slate-700 text-sm">Phone</p>
                                    <p className="text-slate-900">{registration.phone}</p>
                                </div>
                            </div>

                            {registration.hasValidLicense && (
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-slate-700 text-sm">License Status</p>
                                        <p className="text-slate-900 text-sm sm:text-base">Valid Canadian License (G2+) Confirmed</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <BellRing className={`w-5 h-5 mt-1 flex-shrink-0 ${registration.communicationOptIn ? 'text-green-600' : 'text-slate-400'}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-slate-700 text-sm">Communication Preferences</p>
                                    <p className={`text-sm sm:text-base ${registration.communicationOptIn ? 'text-green-700 font-medium' : 'text-slate-500'}`}>
                                        {registration.communicationOptIn ? '✓ Opted in to receive communications' : 'Not opted in'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* License Verification Section */}
                    <div className={`border-2 rounded-xl p-4 sm:p-6 ${registration.licenseVerified
                        ? 'bg-green-50 border-green-300'
                        : 'bg-amber-50 border-amber-300'
                        }`}>
                        <div className="flex items-start gap-3 mb-4">
                            <ShieldCheck className={`w-5 h-5 mt-1 flex-shrink-0 ${registration.licenseVerified ? 'text-green-600' : 'text-amber-600'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-slate-900 mb-1">Driver's License Verification</h4>
                                {registration.licenseVerified ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <p className="text-green-700 font-medium text-sm sm:text-base">
                                                License Verified On-Site
                                            </p>
                                        </div>
                                        <div className="text-slate-700 text-sm space-y-1">
                                            <p>Verified by: <span className="font-semibold">{registration.licenseVerifiedBy}</span></p>
                                            <p>Verified at: <span className="font-medium">{formatDateTime(registration.licenseVerifiedAt)}</span></p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-amber-800 text-sm">
                                            Customer has attested to having a valid license. Staff verification required before test drive.
                                        </p>
                                        <button
                                            onClick={onVerifyLicense}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            Verify License Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {registration.additionalPassengers && registration.additionalPassengers.length > 0 && (
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-slate-600 flex-shrink-0" />
                                <h4 className="text-slate-900">Additional Passengers ({registration.additionalPassengers.length})</h4>
                            </div>
                            <div className="space-y-2">
                                {registration.additionalPassengers.map((passenger, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-900 truncate">{passenger.name}</p>
                                            <p className="text-slate-600 text-xs">
                                                {passenger.isOver18 ? 'Adult (18+)' : 'Minor - Parent/Guardian signature required'}
                                            </p>
                                        </div>
                                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Driver Signature */}
                    {registration.signature && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
                            <h4 className="text-slate-900 mb-4">Primary Driver - Liability Waiver Signature</h4>
                            <div className="bg-white border-2 border-slate-300 rounded-lg p-4">
                                <img
                                    src={registration.signature}
                                    alt="Driver Signature"
                                    className="max-w-full h-24 sm:h-32 object-contain mx-auto"
                                />
                            </div>
                            <p className="text-slate-600 text-sm mt-2 break-words">
                                {registration.firstName} {registration.lastName}
                            </p>
                        </div>
                    )}

                    {/* Passenger Signatures */}
                    {registration.additionalPassengers && registration.additionalPassengers.some(p => p.signature) && (
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 sm:p-6">
                            <h4 className="text-slate-900 mb-4">Passenger Liability Waiver Signatures</h4>
                            <div className="space-y-4 sm:space-y-6">
                                {registration.additionalPassengers.map((passenger, index) => (
                                    passenger.signature && (
                                        <div key={index} className="space-y-4">
                                            <div className={`border-2 rounded-lg p-3 sm:p-4 ${!passenger.isOver18 ? 'border-amber-300 bg-amber-50' : 'border-slate-300 bg-white'}`}>
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-slate-900 break-words">{passenger.name}</p>
                                                        <p className="text-slate-600 text-xs">
                                                            {passenger.isOver18 ? 'Adult Passenger' : `Minor - Signed by ${passenger.guardianRelationship || 'guardian'}`}
                                                        </p>
                                                        {!passenger.isOver18 && passenger.guardianName && (
                                                            <p className="text-slate-600 text-xs mt-1 break-words">
                                                                {passenger.guardianRelationship === 'parent' ? 'Parent' : 'Guardian'} Name: <span className="font-medium">{passenger.guardianName}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                    {!passenger.isOver18 && (
                                                        <span className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded-full flex-shrink-0">
                                                            Minor
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="bg-white border-2 border-slate-300 rounded-lg p-3 sm:p-4">
                                                    <img
                                                        src={passenger.signature}
                                                        alt={`${passenger.name} Waiver Signature`}
                                                        className="max-w-full h-20 sm:h-28 object-contain mx-auto"
                                                    />
                                                </div>
                                            </div>

                                            {/* Parental Consent Signature for Minors */}
                                            {!passenger.isOver18 && passenger.parentalConsentSignature && (
                                                <div className="border-2 border-amber-300 bg-amber-50 rounded-lg p-3 sm:p-4 ml-2 sm:ml-4">
                                                    <div className="flex items-start gap-2 mb-3">
                                                        <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-slate-900 text-sm sm:text-base">Parental Consent Form Signature</p>
                                                            <p className="text-slate-600 text-xs">
                                                                Signed by {passenger.guardianRelationship || 'guardian'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white border-2 border-amber-300 rounded-lg p-3 sm:p-4">
                                                        <img
                                                            src={passenger.parentalConsentSignature}
                                                            alt={`${passenger.name} Parental Consent Signature`}
                                                            className="max-w-full h-20 sm:h-28 object-contain mx-auto"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-center pt-4">
                        <p className="text-slate-500 text-sm">
                            Registered on {formatDateTime(registration.registeredAt)}
                        </p>
                    </div>

                    <div className="border-t-2 border-slate-200 pt-6 space-y-3">
                        {registration.waiverPdfUrl && (
                            <a
                                href={registration.waiverPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Download Signed Waiver PDF
                            </a>
                        )}
                        <button
                            onClick={() => onToggleComplete(registration.registrationId!)}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${registration.completed
                                ? 'bg-slate-600 text-white hover:bg-slate-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            <CheckCircle className="w-5 h-5" />
                            {registration.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                        </button>
                        <button
                            onClick={() => onDelete(registration.registrationId!)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Registration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
