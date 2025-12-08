import { useState } from 'react';
import { ChevronLeft, User, Mail, Phone, Plus, X, Users, Check } from 'lucide-react';
import { TermsOfServiceModal } from '../shared/TermsOfServiceModal';
import { PrivacyPolicyModal } from '../shared/PrivacyPolicyModal';

interface Passenger {
  name: string;
  isOver18: boolean;
  meetsRequirements: boolean;
  signature?: string;
  guardianRelationship?: 'parent' | 'guardian';
  agreedToWaiver?: boolean;
}

interface PersonalInfoProps {
  onNext: (info: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    agreedToTOS: boolean;
    optInMarketing: boolean;
    hasValidLicense: boolean;
    additionalPassengers: Passenger[];
  }) => void;
  onBack: () => void;
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    agreedToTOS?: boolean;
    optInMarketing?: boolean;
    hasValidLicense?: boolean;
    additionalPassengers?: Passenger[];
  };
}

export function PersonalInfo({ onNext, onBack, data }: PersonalInfoProps) {
  const [firstName, setFirstName] = useState(data.firstName || '');
  const [lastName, setLastName] = useState(data.lastName || '');
  const [email, setEmail] = useState(data.email || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [agreedToTOS, setAgreedToTOS] = useState(data.agreedToTOS || false);
  const [optInMarketing, setOptInMarketing] = useState(data.optInMarketing || false);
  const [hasValidLicense, setHasValidLicense] = useState(data.hasValidLicense || false);
  const [additionalPassengers, setAdditionalPassengers] = useState<Passenger[]>(data.additionalPassengers || []);
  const [showTOSModal, setShowTOSModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = phone.length >= 10;

  const addPassenger = () => {
    setAdditionalPassengers([...additionalPassengers, { name: '', isOver18: false, meetsRequirements: false }]);
  };

  const removePassenger = (index: number) => {
    setAdditionalPassengers(additionalPassengers.filter((_, i) => i !== index));
  };

  const updatePassengerName = (index: number, name: string) => {
    const updated = [...additionalPassengers];
    updated[index].name = name;
    setAdditionalPassengers(updated);
  };

  const updatePassengerRequirements = (index: number, meetsRequirements: boolean) => {
    const updated = [...additionalPassengers];
    updated[index].meetsRequirements = meetsRequirements;
    setAdditionalPassengers(updated);
  };

  const updatePassengerAge = (index: number, isOver18: boolean) => {
    const updated = [...additionalPassengers];
    updated[index].isOver18 = isOver18;
    // If setting to over 18, automatically set meetsRequirements to true
    if (isOver18) {
      updated[index].meetsRequirements = true;
    }
    setAdditionalPassengers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all passengers have names and checked requirements
    const allPassengersValid = additionalPassengers.every(passenger =>
      passenger.name.trim() !== '' && (passenger.isOver18 || passenger.meetsRequirements)
    );

    if (firstName && lastName && isEmailValid && isPhoneValid && agreedToTOS && hasValidLicense && allPassengersValid) {
      onNext({ firstName, lastName, email, phone, agreedToTOS, optInMarketing, hasValidLicense, additionalPassengers });
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-slate-900 mb-2">Personal Information</h2>
        <p className="text-slate-600">Please provide your contact details</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="flex items-center gap-2 text-slate-700 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>First Name</span>
              {firstName && <Check className="w-4 h-4 text-green-600 ml-auto animate-in zoom-in duration-200" />}
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              placeholder="John"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="flex items-center gap-2 text-slate-700 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Last Name</span>
              {lastName && <Check className="w-4 h-4 text-green-600 ml-auto animate-in zoom-in duration-200" />}
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="flex items-center gap-2 text-slate-700 mb-2">
            <Mail className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Email Address</span>
            {email && isEmailValid && <Check className="w-4 h-4 text-green-600 ml-auto animate-in zoom-in duration-200" aria-hidden="true" />}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            aria-invalid={emailTouched && !isEmailValid}
            aria-describedby={emailTouched && !isEmailValid ? "email-error" : undefined}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 ${emailTouched && !isEmailValid
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
              }`}
            placeholder="john.doe@example.com"
            onBlur={() => setEmailTouched(true)}
          />
          {emailTouched && !isEmailValid && (
            <p id="email-error" role="alert" className="text-red-600 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">
              Please enter a valid email address.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="flex items-center gap-2 text-slate-700 mb-2">
            <Phone className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Phone Number</span>
            {phone && isPhoneValid && <Check className="w-4 h-4 text-green-600 ml-auto animate-in zoom-in duration-200" aria-hidden="true" />}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            aria-required="true"
            aria-invalid={phoneTouched && !isPhoneValid}
            aria-describedby={phoneTouched && !isPhoneValid ? "phone-error" : undefined}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 ${phoneTouched && !isPhoneValid
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
              }`}
            placeholder="(555) 123-4567"
            onBlur={() => setPhoneTouched(true)}
          />
          {phoneTouched && !isPhoneValid && (
            <p id="phone-error" role="alert" className="text-red-600 text-sm mt-1 animate-in slide-in-from-top-1 duration-200">
              Please enter a valid phone number (at least 10 digits).
            </p>
          )}
        </div>

        {/* Terms of Service & Opt-in Section */}
        <div className="border-t-2 border-slate-200 pt-6 mt-8 space-y-4">
          <div className="flex items-start gap-3">
            <input
              id="agreedToTOS"
              type="checkbox"
              checked={agreedToTOS}
              onChange={(e) => setAgreedToTOS(e.target.checked)}
              required
              className="flex-shrink-0 mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:outline-none cursor-pointer"
            />
            <label htmlFor="agreedToTOS" className="text-slate-700 text-sm cursor-pointer">
              I agree to the{' '}
              <a
                href="#"
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTOSModal(true);
                }}
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="#"
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacyModal(true);
                }}
              >
                Privacy Policy
              </a>
              . I understand that my information will be used for this test drive event and acknowledge the{' '}
              <a href="#" className="text-blue-600 hover:underline">
                waiver and liability release
              </a>
              . *
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="hasValidLicense"
              type="checkbox"
              checked={hasValidLicense}
              onChange={(e) => setHasValidLicense(e.target.checked)}
              required
              className="flex-shrink-0 mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:outline-none cursor-pointer"
            />
            <label htmlFor="hasValidLicense" className="text-slate-700 text-sm cursor-pointer">
              I confirm that I possess a valid Canadian driver's license (G2 equivalent or above) and will present it at the event. *
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="optInMarketing"
              type="checkbox"
              checked={optInMarketing}
              onChange={(e) => setOptInMarketing(e.target.checked)}
              className="flex-shrink-0 mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:outline-none cursor-pointer"
            />
            <label htmlFor="optInMarketing" className="text-slate-700 text-sm cursor-pointer">
              Yes, I would like to receive updates about future events, exclusive offers, and new vehicle announcements from Traxion Events and Ford Motor Company via email and phone.
            </label>
          </div>

          <p className="text-slate-500 text-xs">
            * Required field. You can unsubscribe from marketing communications at any time.
          </p>
        </div>

        {/* Additional Passengers Section */}
        <div className="border-t-2 border-slate-200 pt-6 mt-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-700" />
              <h3 className="text-slate-900">Additional Passengers (Optional)</h3>
            </div>
            <button
              type="button"
              onClick={addPassenger}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Passenger
            </button>
          </div>

          <p className="text-slate-600 text-sm mb-4">
            Add anyone who will be riding along during the test drive. All passengers will need to sign a waiver.
          </p>

          {additionalPassengers.length > 0 && (
            <div className="space-y-3">
              {additionalPassengers.map((passenger, index) => (
                <div key={index} className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-1">
                      <label className="text-slate-700 text-sm mb-2 block">
                        Passenger {index + 1} Name *
                      </label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => updatePassengerName(index, e.target.value)}
                        required={additionalPassengers.length > 0}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Enter full name"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove passenger"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Age verification */}
                  <div className="mb-4">
                    <label className="text-slate-700 text-sm mb-2 block">
                      Is this passenger over 18 years old? *
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => updatePassengerAge(index, true)}
                        className={`flex-1 px-4 py-2 border-2 rounded-lg transition-all duration-200 ${passenger.isOver18
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-300 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePassengerAge(index, false)}
                        className={`flex-1 px-4 py-2 border-2 rounded-lg transition-all duration-200 ${!passenger.isOver18
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-300 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Show age/weight confirmation only if under 18 */}
                  {!passenger.isOver18 && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <input
                        id={`passenger-requirements-${index}`}
                        type="checkbox"
                        checked={passenger.meetsRequirements}
                        onChange={(e) => updatePassengerRequirements(index, e.target.checked)}
                        required={additionalPassengers.length > 0}
                        className="flex-shrink-0 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:outline-none cursor-pointer"
                      />
                      <label htmlFor={`passenger-requirements-${index}`} className="text-slate-700 text-sm cursor-pointer">
                        I confirm this passenger is over 8 years old and weighs above 80 lbs. *
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {additionalPassengers.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No additional passengers added. Click "Add Passenger" to include passengers.
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:shadow-md active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            Continue
          </button>
        </div>
      </form>

      {/* Modals */}
      {showTOSModal && <TermsOfServiceModal onClose={() => setShowTOSModal(false)} />}
      {showPrivacyModal && <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />}
    </div>
  );
}