import { RegistrationData } from '../App';
import { CheckCircle2, Calendar, Clock, Car, User, Mail, Phone, Users, CheckCircle } from 'lucide-react';
import { formatDateLong } from '../utils/formatters';

interface ConfirmationProps {
  data: RegistrationData;
  onReset: () => void;
}

export function Confirmation({ data, onReset }: ConfirmationProps) {

  return (
    <div>
      <div className="text-center mb-8 animate-in fade-in zoom-in duration-700">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4 shadow-lg animate-in zoom-in duration-500 delay-100">
          <CheckCircle2 className="w-14 h-14 text-white animate-in zoom-in duration-300 delay-300" strokeWidth={2.5} />
        </div>
        <h2 className="text-slate-900 mb-2 animate-in slide-in-from-bottom-4 duration-500 delay-200">Registration Complete!</h2>
        <p className="text-slate-600 animate-in slide-in-from-bottom-4 duration-500 delay-300">
          Your test drive has been successfully scheduled
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 animate-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="flex items-start gap-4 mb-4">
            <Car className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-slate-900 mb-1">Vehicle</h3>
              <p className="text-slate-700">
                {data.car?.name} {data.car?.model} ({data.car?.year})
              </p>
              <p className="text-slate-600 text-sm">{data.car?.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="text-slate-700">Date</h4>
                <p className="text-slate-900">{formatDateLong(data.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="text-slate-700">Time</h4>
                <p className="text-slate-900">{data.timeSlot}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-slate-900 mb-4">Your Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-slate-700 text-sm">Name</p>
                <p className="text-slate-900">
                  {data.firstName} {data.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-slate-700 text-sm">Email</p>
                <p className="text-slate-900">{data.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-slate-700 text-sm">Phone</p>
                <p className="text-slate-900">{data.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-slate-700 text-sm">License Status</p>
                <p className="text-slate-900">Valid Canadian License Confirmed</p>
              </div>
            </div>
          </div>
        </div>

        {data.additionalPassengers && data.additionalPassengers.length > 0 && (
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-slate-600" />
              <h3 className="text-slate-900">Additional Passengers ({data.additionalPassengers.length})</h3>
            </div>
            <div className="space-y-3">
              {data.additionalPassengers.map((passenger, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900">{passenger.name}</p>
                    <p className="text-slate-600 text-xs">Meets age and weight requirements</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <h4 className="text-amber-900 mb-2">Important Reminders</h4>
          <ul className="space-y-2 text-amber-800 text-sm">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Please arrive 15 minutes before your scheduled time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Bring your valid physical driver's license</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>A confirmation email has been sent to {data.email}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Test drives are weather permitting and subject to availability</span>
            </li>
          </ul>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={onReset}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            Schedule Another Test Drive
          </button>
        </div>
      </div>
    </div>
  );
}