import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { RegistrationData } from '../../App';

interface LicenseVerificationModalProps {
    registration: RegistrationData;
    onClose: () => void;
    onVerify: (registrationId: string, initials: string) => void;
}

export function LicenseVerificationModal({ registration, onClose, onVerify }: LicenseVerificationModalProps) {
    const [verifyInitials, setVerifyInitials] = useState('');

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-slate-900 font-semibold">Verify Driver's License</h3>
                            <p className="text-slate-600 text-sm">
                                {registration.firstName} {registration.lastName}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="initials" className="block text-slate-700 mb-2">
                                Staff Initials *
                            </label>
                            <input
                                id="initials"
                                type="text"
                                value={verifyInitials}
                                onChange={(e) => setVerifyInitials(e.target.value.toUpperCase())}
                                maxLength={4}
                                placeholder="e.g., JD"
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 uppercase"
                                autoFocus
                            />
                            <p className="text-slate-500 text-xs mt-1">
                                Enter your initials to confirm you've verified the physical driver's license on-site.
                            </p>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <h4 className="text-slate-900 text-sm font-medium mb-2">Verification Checklist</h4>
                            <ul className="space-y-1 text-slate-700 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600">✓</span>
                                    <span>Physical license card inspected</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600">✓</span>
                                    <span>License is valid and not expired</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600">✓</span>
                                    <span>G2 or above license class confirmed</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600">✓</span>
                                    <span>Photo and name match customer</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (verifyInitials.trim().length >= 2) {
                                        onVerify(registration.registrationId!, verifyInitials.trim());
                                    }
                                }}
                                disabled={verifyInitials.trim().length < 2}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Verify License
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
