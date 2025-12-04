import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarSelection } from './components/CarSelection';
import { TimeSlotSelection } from './components/TimeSlotSelection';
import { PersonalInfo } from './components/PersonalInfo';
import { WaiverSignature } from './components/WaiverSignature';
import { Confirmation } from './components/Confirmation';
import { ProgressIndicator } from './components/ProgressIndicator';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { getPageSettings, DEFAULT_SETTINGS } from './components/PageEditor';
import { Toaster } from './components/ui/sonner';
import { storageService } from './services/storageService';
import { pdfService } from './services/pdfService';
import { authService } from './services/authService';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';

export interface Car {
  id: string;
  name: string;
  model: string;
  year: number;
  type: string;
  image: string;
}

export interface Passenger {
  name: string;
  isOver18: boolean;
  meetsRequirements: boolean;
  signature?: string;
  parentalConsentSignature?: string;
  guardianRelationship?: 'parent' | 'guardian';
  guardianName?: string;
  agreedToWaiver?: boolean;
  agreedToParentalConsent?: boolean;
}

export interface RegistrationData {
  car?: Car;
  date?: string;
  timeSlot?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  hasValidLicense?: boolean;
  additionalPassengers?: Passenger[];
  signature?: string;
  registrationId?: string;
  registeredAt?: string;
  completed?: boolean;
  communicationOptIn?: boolean;
  licenseVerified?: boolean;
  licenseVerifiedBy?: string;
  licenseVerifiedAt?: string;
  agreedToTOS?: boolean;
  waiverPdfUrl?: string;
}

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
          <AdminDashboard onLogout={handleLogout} />
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