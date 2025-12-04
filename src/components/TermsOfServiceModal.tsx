import { X } from 'lucide-react';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export function TermsOfServiceModal({ onClose }: TermsOfServiceModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-slate-200">
          <h2 className="text-slate-900">Terms of Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          <p className="text-slate-600 text-sm">
            <strong>Last Updated:</strong> December 2, 2025
          </p>

          <section>
            <h3 className="text-slate-900 mb-2">1. Acceptance of Terms</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              By registering for a test drive event with Traxion Events, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not register for our events.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">2. Eligibility Requirements</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              To participate in a test drive event, you must:
            </p>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1 ml-4">
              <li>Be at least 18 years of age</li>
              <li>Possess a valid Canadian driver's license (G2 equivalent or above)</li>
              <li>Present your physical driver's license at the event</li>
              <li>Comply with all safety requirements and instructions</li>
            </ul>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">3. Event Registration</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Registration for test drive events is subject to availability. We reserve the right to cancel or reschedule 
              events with reasonable notice. You will be notified of any changes to your scheduled time slot via the email 
              address provided during registration.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">4. Additional Passengers</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Additional passengers must be at least 8 years old and weigh more than 80 lbs for safety reasons. All passengers 
              participate at their own risk and must comply with safety instructions provided by event staff.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">5. Cancellation Policy</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              If you need to cancel your registration, please contact us at least 24 hours before your scheduled time slot. 
              Failure to show up for your scheduled test drive without prior notice may affect your ability to register 
              for future events.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">6. Liability and Insurance</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              All participants must sign a liability waiver before participating in any test drive. Vehicles are insured 
              during test drives; however, participants may be responsible for deductibles in case of accidents caused by 
              negligence or violation of safety instructions.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">7. Conduct and Safety</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Participants must follow all traffic laws and safety instructions. Traxion Events reserves the right to 
              terminate a test drive or remove participants from the event for unsafe behavior, intoxication, or 
              violation of these terms.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">8. Data Collection and Use</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Information collected during registration will be used to manage your test drive appointment and may be 
              shared with Ford Motor Company for event purposes. See our Privacy Policy for more details.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">9. Photography and Media</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              By attending our events, you consent to being photographed or recorded for promotional purposes. If you do 
              not wish to be included in promotional materials, please inform event staff.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">10. Limitation of Liability</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Traxion Events and Ford Motor Company shall not be liable for any indirect, incidental, special, or 
              consequential damages arising from your participation in test drive events.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">11. Changes to Terms</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately 
              upon posting to our website or notification to registered participants.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">12. Contact Information</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-slate-700 text-sm ml-4">
              Email: info@traxionevents.com<br />
              Phone: 1-800-TRAXION
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}