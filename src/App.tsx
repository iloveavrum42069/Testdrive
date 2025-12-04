import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarSelection } from './components/CarSelection';
import { TimeSlotSelection } from './components/TimeSlotSelection';
import { PersonalInfo } from './components/PersonalInfo';
import { WaiverSignature } from './components/WaiverSignature';
import { Confirmation } from './components/Confirmation';
import { ProgressIndicator } from './components/ProgressIndicator';
import { AdminLogin } from './components/AdminLogin';
// Lazy load AdminDashboard to reduce initial bundle size
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
import { getPageSettings, DEFAULT_SETTINGS } from './components/PageEditor';
import { Toaster } from './components/ui/sonner';
import { storageService } from './services/storageService';
import { pdfService } from './services/pdfService';
import { authService } from './services/authService';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';
import { Car, Passenger, RegistrationData } from './types';

// Re-export types for backward compatibility
export type { Car, Passenger, RegistrationData } from './types';

export default function App() {
  const [step, setStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const [view, setView] = useState<'registration' | 'admin-login' | 'admin-dashboard'>('registration');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [pageSettings, setPageSettings] = useState(DEFAULT_SETTINGS);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Check for existing auth session on load
  useEffect(() => {
    const checkAuth = async () => {
      const session = await authService.getSession();
      if (session) {
        setIsAdminAuthenticated(true);
        setView('admin-dashboard');
      }
      setIsAuthLoading(false);
    };
    checkAuth();

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((session) => {
      setIsAdminAuthenticated(!!session);
      if (!session && view === 'admin-dashboard') {
        setView('registration');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await storageService.getPageSettings(DEFAULT_SETTINGS);
      setPageSettings(settings);
    };

    loadSettings();

    // Listen for settings changes via Supabase real-time
    const channel = supabase
      .channel('settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalSteps = 5;

  const nextStep = () => {
    setDirection(1);
    setStep(step + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const updateData = (data: Partial<RegistrationData>) => {
    setRegistrationData({ ...registrationData, ...data });
  };

  const resetRegistration = async () => {
    // Release any held slots
    await storageService.releaseAllHolds(sessionId);
    setDirection(-1);
    setRegistrationData({});
    setStep(1);
  };

  const saveRegistration = async (data: RegistrationData): Promise<boolean> => {
    // Final availability check before booking
    if (data.car?.id && data.date && data.timeSlot) {
      const availability = await storageService.checkSlotAvailableForBooking(
        data.car.id,
        data.date,
        data.timeSlot
      );

      if (!availability.available) {
        toast.error(availability.message || 'This time slot is no longer available.');
        return false;
      }
    }

    const newRegistration = {
      ...data,
      registrationId: `TD-${Date.now()}`,
      registeredAt: new Date().toISOString(),
    };

    // Generate PDF Waiver
    try {
      const pdfBlob = await pdfService.generateWaiverPdf(newRegistration, pageSettings);
      const driverName = `${newRegistration.firstName}_${newRegistration.lastName}`;
      const pdfUrl = await storageService.uploadWaiver(pdfBlob, driverName, newRegistration.date || new Date().toISOString().split('T')[0]);

      if (pdfUrl) {
        newRegistration.waiverPdfUrl = pdfUrl;
      }
    } catch (error) {
      console.error('Failed to generate or upload waiver PDF:', error);
    }

    const success = await storageService.addRegistration(newRegistration);
    if (!success) {
      console.error('Failed to save registration');
      toast.error('Failed to save registration. Please try again.');
      return false;
    }

    // Send confirmation SMS (non-blocking, don't fail registration if SMS fails)
    if (data.phone && data.firstName && data.date && data.timeSlot && data.car) {
      import('./services/smsService').then(({ smsService }) => {
        smsService.sendConfirmationSms({
          phone: data.phone!,
          firstName: data.firstName!,
          lastName: data.lastName || '',
          date: data.date!,
          time: data.timeSlot!,
          carName: `${data.car!.name} ${data.car!.model}`,
        });
      }).catch(err => console.error('SMS service load error:', err));
    } else {
      // console.warn('Skipping SMS: Missing required data fields'); // Removed debug log
    }

    // Release the hold after successful booking
    if (data.car?.id && data.date && data.timeSlot) {
      await storageService.releaseSlotHold(data.car.id, data.date, data.timeSlot, sessionId);
    }

    return true;
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setView('admin-dashboard');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsAdminAuthenticated(false);
    setView('registration');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-slate-900 mb-2">
            {view === 'admin-login' || view === 'admin-dashboard'
              ? 'Admin Portal'
              : pageSettings.heroTitle}
          </h1>
          <p className="text-slate-600">
            {view === 'admin-login'
              ? 'Secure access for authorized personnel only'
              : view === 'admin-dashboard'
                ? 'Manage and view all test drive registrations'
                : pageSettings.heroSubtitle}
          </p>
        </header>

        {view === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setView('registration')}
          />
        )}

        {view === 'admin-dashboard' && (
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <AdminDashboard onLogout={handleLogout} />
          </Suspense>
        )}

        {view === 'registration' && (
          <>
            <ProgressIndicator currentStep={step} totalSteps={totalSteps} />

            <div className="relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -50 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="bg-white rounded-2xl shadow-xl p-8 mb-8"
                >
                  {step === 1 && (
                    <CarSelection
                      onNext={(car) => {
                        updateData({ car });
                        nextStep();
                      }}
                      selectedCar={registrationData.car}
                    />
                  )}

                  {step === 2 && (
                    <TimeSlotSelection
                      car={registrationData.car!}
                      onNext={(date, timeSlot) => {
                        updateData({ date, timeSlot });
                        nextStep();
                      }}
                      onBack={prevStep}
                      selectedDate={registrationData.date}
                      selectedTimeSlot={registrationData.timeSlot}
                      sessionId={sessionId}
                    />
                  )}

                  {step === 3 && (
                    <PersonalInfo
                      onNext={(info) => {
                        updateData({
                          firstName: info.firstName,
                          lastName: info.lastName,
                          email: info.email,
                          phone: info.phone,
                          hasValidLicense: info.hasValidLicense,
                          additionalPassengers: info.additionalPassengers,
                          communicationOptIn: info.optInMarketing
                        });
                        nextStep();
                      }}
                      onBack={prevStep}
                      data={{
                        firstName: registrationData.firstName,
                        lastName: registrationData.lastName,
                        email: registrationData.email,
                        phone: registrationData.phone,
                        hasValidLicense: registrationData.hasValidLicense,
                        additionalPassengers: registrationData.additionalPassengers,
                        optInMarketing: registrationData.communicationOptIn,
                      }}
                    />
                  )}

                  {step === 4 && (
                    <WaiverSignature
                      onNext={async (signature, passengerSignatures) => {
                        const completeData = { ...registrationData, signature, additionalPassengers: passengerSignatures };
                        updateData({ signature, additionalPassengers: passengerSignatures });
                        const success = await saveRegistration(completeData);
                        if (success) {
                          nextStep();
                        } else {
                          // Go back to time slot selection if booking failed
                          setStep(2);
                        }
                      }}
                      onBack={prevStep}
                      signature={registrationData.signature}
                      additionalPassengers={registrationData.additionalPassengers || []}
                    />
                  )}

                  {step === 5 && (
                    <Confirmation data={registrationData} onReset={resetRegistration} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}

        <footer className="text-center text-slate-500 text-sm">
          <p>{pageSettings.footerText}</p>
          {view === 'registration' && (
            <button
              onClick={() => setView('admin-login')}
              className="mt-3 text-slate-400 hover:text-slate-600 text-xs underline transition-colors duration-200"
            >
              Admin Access
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}