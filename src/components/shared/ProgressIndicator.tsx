import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isTimed?: boolean;
}

const timedSteps = [
  { number: 1, label: 'Select Car' },
  { number: 2, label: 'Choose Time' },
  { number: 3, label: 'Personal Info' },
  { number: 4, label: 'Waiver' },
  { number: 5, label: 'Confirm' },
];

const nonTimedSteps = [
  { number: 1, label: 'Select Car' },
  { number: 2, label: 'Personal Info' },
  { number: 3, label: 'Waiver' },
  { number: 4, label: 'Confirm' },
];

export function ProgressIndicator({ currentStep, totalSteps, isTimed = true }: ProgressIndicatorProps) {
  const steps = isTimed ? timedSteps : nonTimedSteps;
  return (
    <div className="mb-12" role="group" aria-label={`Registration progress: Step ${currentStep} of ${steps.length}, ${steps[currentStep - 1]?.label}`}>
      {/* Mobile Progress Bar */}
      <div className="lg:hidden mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-slate-600">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-in fade-in duration-500" aria-current="step">
            {steps[currentStep - 1]?.label}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={steps.length} aria-label={`${Math.round((currentStep / steps.length) * 100)}% complete`}>
          <div
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-2 text-right">
          <span className="text-xs text-slate-500" aria-hidden="true">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>
      </div>


      {/* Desktop Step Indicator */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200" style={{ marginLeft: '2rem', marginRight: '2rem' }} />

          {/* Progress Line with gradient */}
          <div
            className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 transition-all duration-700 ease-out shadow-lg"
            style={{
              marginLeft: '2rem',
              width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${((currentStep - 1) / (steps.length - 1)) * 4}rem)`
            }}
          />

          <div className="relative flex items-start justify-between max-w-5xl mx-auto" role="list">
            {steps.map((step, index) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              const isPending = step.number > currentStep;

              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center"
                  style={{ flex: '0 0 auto' }}
                  role="listitem"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {/* Step Circle */}
                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${isCompleted
                        ? 'bg-gradient-to-br from-green-400 to-green-600 scale-100 animate-in zoom-in'
                        : isCurrent
                          ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 scale-110 shadow-blue-400/50 shadow-xl'
                          : 'bg-white border-2 border-slate-300 scale-90'
                        }`}
                      aria-label={`Step ${step.number}: ${step.label}${isCompleted ? ', completed' : isCurrent ? ', current step' : ', pending'}`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white animate-in zoom-in duration-300" strokeWidth={3} aria-hidden="true" />
                      ) : (
                        <span className={`transition-colors duration-300 ${isCurrent ? 'text-white' : 'text-slate-400'}`} aria-hidden="true">
                          {step.number}
                        </span>
                      )}
                    </div>

                    {/* Current Step Pulse Animation */}
                    {isCurrent && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" aria-hidden="true" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 animate-pulse opacity-30" aria-hidden="true" />
                      </>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`mt-3 text-sm text-center transition-all duration-300 ${isCompleted || isCurrent
                      ? 'text-slate-900'
                      : 'text-slate-400'
                      }`}
                  >
                    {step.label}
                  </span>

                  {/* Active Indicator */}
                  {isCurrent && (
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}