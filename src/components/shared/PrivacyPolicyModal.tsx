import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-slate-200">
          <h2 className="text-slate-900">Privacy Policy</h2>
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
            <h3 className="text-slate-900 mb-2">1. Introduction</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Traxion Events ("we," "us," or "our") respects your privacy and is committed to protecting your personal 
              information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you register for our test drive events.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">2. Information We Collect</h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              We collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1 ml-4">
              <li><strong>Personal Identification:</strong> First name, last name</li>
              <li><strong>Contact Information:</strong> Email address, phone number</li>
              <li><strong>Event Details:</strong> Selected vehicle, date, and time slot preferences</li>
              <li><strong>License Attestation:</strong> Confirmation that you possess a valid Canadian driver's license (G2 or above)</li>
              <li><strong>Additional Passengers:</strong> Names and age/weight confirmations of passengers</li>
              <li><strong>Consent Records:</strong> Marketing preferences and waiver signatures</li>
            </ul>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">3. How We Use Your Information</h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1 ml-4">
              <li>Process and manage your test drive registration</li>
              <li>Send you confirmation emails and event reminders</li>
              <li>Verify eligibility and safety requirements at the event</li>
              <li>Communicate important updates about your scheduled appointment</li>
              <li>Send marketing communications (only if you opt in)</li>
              <li>Improve our events and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">4. Information Sharing and Disclosure</h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1 ml-4">
              <li><strong>Ford Motor Company:</strong> As the vehicle manufacturer and event sponsor</li>
              <li><strong>Event Staff:</strong> To manage check-in and verify eligibility on-site</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist with event operations</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect rights and safety</li>
            </ul>
            <p className="text-slate-700 text-sm leading-relaxed mt-2">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">5. Driver's License Verification</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              We do NOT collect or store copies of driver's licenses during online registration. You attest to having a 
              valid license during registration, and event staff will verify your physical license on-site at the event. 
              Your license information is only viewed for verification purposes and is not recorded or stored.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">6. Data Security</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              We implement reasonable security measures to protect your information from unauthorized access, alteration, 
              disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we 
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">7. Data Retention</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
              Privacy Policy, unless a longer retention period is required by law. Event registration data is typically 
              retained for 12 months after the event date.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">8. Your Rights and Choices</h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-700 text-sm space-y-1 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information (subject to legal requirements)</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Withdraw consent for data processing where applicable</li>
            </ul>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">9. Marketing Communications</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              If you opt in to receive marketing communications, we may send you emails and phone messages about future 
              events, vehicle announcements, and special offers. You can unsubscribe at any time by clicking the 
              unsubscribe link in our emails or contacting us directly.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">10. Children's Privacy</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal 
              information from children. While we collect names of additional passengers (including minors), this information 
              is provided by the adult registrant who is responsible for the passengers.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">11. Changes to This Privacy Policy</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on our website and updating the "Last Updated" date. Your continued use of our services 
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">12. Contact Us</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-slate-700 text-sm ml-4">
              Email: privacy@traxionevents.com<br />
              Phone: 1-800-TRAXION<br />
              Address: Traxion Events Privacy Office
            </p>
          </section>

          <section>
            <h3 className="text-slate-900 mb-2">13. Compliance</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              We comply with applicable Canadian privacy laws, including the Personal Information Protection and 
              Electronic Documents Act (PIPEDA) where applicable.
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