import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, X, Check } from 'lucide-react';
import { getPageSettings } from './PageEditor';
import { Passenger } from '../App';

interface WaiverSignatureProps {
  onNext: (signature: string, passengers: Passenger[]) => void;
  onBack: () => void;
  signature?: string;
  additionalPassengers: Passenger[];
}

export function WaiverSignature({ onNext, onBack, signature, additionalPassengers }: WaiverSignatureProps) {
  const [waiverText, setWaiverText] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getPageSettings();
      setWaiverText(settings.waiverText);
    };
    loadSettings();
  }, []);

  // Parental Consent Form text
  const parentalConsentText = `PARENTAL CONSENT AND ASSUMPTION OF RISK

I, the undersigned parent or legal guardian of the minor named above, hereby grant permission for my child to participate as a passenger in a test drive event conducted by Traxion Events.

I understand and acknowledge that:

1. NATURE OF ACTIVITY: My child will be a passenger in a motor vehicle during a test drive event, which involves inherent risks including but not limited to the risk of injury or death.

2. VOLUNTARY PARTICIPATION: I am voluntarily allowing my child to participate in this activity with full knowledge of the risks involved.

3. ASSUMPTION OF RISK: I knowingly and freely assume all risks, both known and unknown, associated with my child's participation, even if arising from the negligence of the releasees or others.

4. MEDICAL AUTHORIZATION: I authorize Traxion Events staff to seek emergency medical treatment for my child if necessary, and I agree to be financially responsible for any medical costs incurred.

5. PHYSICAL REQUIREMENTS: I confirm that my child meets the minimum physical requirements for participation (8 years of age and 80 lbs minimum weight).

6. RELEASE OF LIABILITY: I, for myself, my child, and our heirs, assigns, personal representatives and next of kin, hereby release and hold harmless Traxion Events, their officers, officials, agents, employees, and volunteers with respect to any and all injury, disability, death, or loss or damage to person or property, whether arising from the negligence of the releasees or otherwise.

7. INDEMNIFICATION: I agree to indemnify and hold harmless Traxion Events from any loss, liability, damage, or costs that may occur as a result of my child's participation in this activity.

I HAVE READ THIS PARENTAL CONSENT AND ASSUMPTION OF RISK AGREEMENT, FULLY UNDERSTAND ITS TERMS, AND UNDERSTAND THAT I AM GIVING UP SUBSTANTIAL RIGHTS, INCLUDING THE RIGHT TO SUE. I ACKNOWLEDGE THAT I AM SIGNING THIS AGREEMENT FREELY AND VOLUNTARILY.`;

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMainSignature, setHasMainSignature] = useState(!!signature);
  const [mainAgreed, setMainAgreed] = useState(false);

  // State for passengers
  const [passengers, setPassengers] = useState<Passenger[]>(additionalPassengers);
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(-1); // -1 means main driver
  const passengerCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const parentalConsentCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    if (signature && mainCanvasRef.current) {
      const canvas = mainCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = signature;
      }
    }
  }, [signature]);

  // Load existing passenger signatures
  useEffect(() => {
    passengers.forEach((passenger, index) => {
      if (passenger.signature) {
        const canvas = passengerCanvasRefs.current.get(index);
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
            };
            img.src = passenger.signature;
          }
        }
      }
    });
  }, [passengers]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (canvasRef === mainCanvasRef) {
      setHasMainSignature(true);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = (canvasRef: React.RefObject<HTMLCanvasElement>, isMain: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isMain) {
      setHasMainSignature(false);
    }
  };

  const updatePassengerSignature = (index: number, signature: string) => {
    const updated = [...passengers];
    updated[index].signature = signature;
    setPassengers(updated);
  };

  const updateGuardianRelationship = (index: number, relationship: 'parent' | 'guardian') => {
    const updated = [...passengers];
    updated[index].guardianRelationship = relationship;
    setPassengers(updated);
  };

  const updateGuardianName = (index: number, name: string) => {
    const updated = [...passengers];
    updated[index].guardianName = name;
    setPassengers(updated);
  };

  const updatePassengerAgreement = (index: number, agreed: boolean) => {
    const updated = [...passengers];
    updated[index].agreedToWaiver = agreed;
    setPassengers(updated);
  };

  const updateParentalConsentAgreement = (index: number, agreed: boolean) => {
    const updated = [...passengers];
    updated[index].agreedToParentalConsent = agreed;
    setPassengers(updated);
  };

  const hasPassengerSignature = (index: number): boolean => {
    const canvas = passengerCanvasRefs.current.get(index);
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return imageData.data.some(channel => channel !== 0);
  };

  const hasParentalConsentSignature = (index: number): boolean => {
    const canvas = parentalConsentCanvasRefs.current.get(index);
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return imageData.data.some(channel => channel !== 0);
  };

  const canSubmit = (): boolean => {
    // Main driver must sign and agree
    if (!hasMainSignature || !mainAgreed) return false;

    // All passengers must have signatures and agreement
    for (let i = 0; i < passengers.length; i++) {
      if (!hasPassengerSignature(i)) return false;
      if (!passengers[i].agreedToWaiver) return false;

      // Minors must have additional requirements
      if (!passengers[i].isOver18) {
        if (!passengers[i].guardianRelationship) return false;
        if (!passengers[i].guardianName || passengers[i].guardianName.trim() === '') return false;
        if (!hasParentalConsentSignature(i)) return false;
        if (!passengers[i].agreedToParentalConsent) return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;

    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;

    const mainSignatureData = mainCanvas.toDataURL();

    // Collect all passenger signatures
    const updatedPassengers = passengers.map((passenger, index) => {
      const waiverCanvas = passengerCanvasRefs.current.get(index);
      const consentCanvas = parentalConsentCanvasRefs.current.get(index);

      const result: Passenger = { ...passenger };

      if (waiverCanvas) {
        result.signature = waiverCanvas.toDataURL();
      }

      // Add parental consent signature for minors
      if (!passenger.isOver18 && consentCanvas) {
        result.parentalConsentSignature = consentCanvas.toDataURL();
      }

      return result;
    });

    onNext(mainSignatureData, updatedPassengers);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-slate-900 mb-2">Liability Waiver & Signatures</h2>
        <p className="text-slate-600">Please read and sign the waiver below</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Waiver Text */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-6 max-h-96 overflow-y-auto">
          <h3 className="text-slate-900 mb-4">Test Drive Liability Waiver</h3>
          <div className="space-y-4 text-slate-700 text-sm whitespace-pre-wrap">
            {waiverText}
          </div>
        </div>

        {/* Main Driver Signature */}
        <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50/30">
          <h3 className="text-slate-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">1</span>
            Primary Driver Signature
          </h3>

          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={mainAgreed}
              onChange={(e) => setMainAgreed(e.target.checked)}
              className="flex-shrink-0 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded cursor-pointer focus:outline-none"
            />
            <span className="text-slate-700 text-sm">
              I have read and agree to the terms of the liability waiver
            </span>
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-700">
                <span>Sign Here *</span>
              </label>
              {hasMainSignature && (
                <button
                  type="button"
                  onClick={() => clearSignature(mainCanvasRef, true)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
            <div className="border-2 border-slate-300 rounded-lg bg-white overflow-hidden">
              <canvas
                ref={mainCanvasRef}
                width={600}
                height={150}
                onMouseDown={(e) => startDrawing(e, mainCanvasRef)}
                onMouseMove={(e) => draw(e, mainCanvasRef)}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => startDrawing(e, mainCanvasRef)}
                onTouchMove={(e) => draw(e, mainCanvasRef)}
                onTouchEnd={stopDrawing}
                className="w-full h-32 sm:h-40 touch-none cursor-crosshair"
                style={{ touchAction: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Passenger Signatures */}
        {passengers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">2</span>
              Passenger Waivers {passengers.length > 0 && `(${passengers.length})`}
            </h3>

            {passengers.map((passenger, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-6 ${!passenger.isOver18 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-slate-50/30'
                  }`}
              >
                <div className="mb-4">
                  <h4 className="text-slate-900 mb-2 flex items-center gap-2">
                    {passenger.name}
                    {!passenger.isOver18 && (
                      <span className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded-full">
                        Minor - Guardian Signature Required
                      </span>
                    )}
                  </h4>

                  {!passenger.isOver18 && (
                    <div className="mb-4">
                      <label className="text-slate-700 text-sm mb-2 block">
                        I am signing as this minor's: *
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {(['parent', 'guardian'] as const).map((relationship) => (
                          <button
                            key={relationship}
                            type="button"
                            onClick={() => updateGuardianRelationship(index, relationship)}
                            className={`px-4 py-2 border-2 rounded-lg transition-all duration-200 capitalize ${passenger.guardianRelationship === relationship
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-slate-300 hover:border-blue-300 hover:bg-blue-50/50'
                              }`}
                          >
                            {relationship}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4">
                        <label className="text-slate-700 text-sm mb-2 block">
                          {passenger.guardianRelationship === 'parent' ? 'Parent' : 'Guardian'} Full Name *
                        </label>
                        <input
                          type="text"
                          value={passenger.guardianName || ''}
                          onChange={(e) => updateGuardianName(index, e.target.value)}
                          placeholder={`Enter ${passenger.guardianRelationship === 'parent' ? 'parent' : 'guardian'} full name`}
                          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passenger.agreedToWaiver || false}
                    onChange={(e) => updatePassengerAgreement(index, e.target.checked)}
                    className="flex-shrink-0 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded cursor-pointer focus:outline-none"
                  />
                  <span className="text-slate-700 text-sm">
                    I have read and agree to the terms of the liability waiver
                  </span>
                </label>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-700">
                      {!passenger.isOver18 ? 'Parent/Guardian Signature *' : 'Signature *'}
                    </label>
                    {hasPassengerSignature(index) && (
                      <button
                        type="button"
                        onClick={() => {
                          const canvas = passengerCanvasRefs.current.get(index);
                          if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.clearRect(0, 0, canvas.width, canvas.height);
                              updatePassengerSignature(index, '');
                            }
                          }
                        }}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="border-2 border-slate-300 rounded-lg bg-white overflow-hidden">
                    <canvas
                      ref={(el) => {
                        if (el) passengerCanvasRefs.current.set(index, el);
                      }}
                      width={600}
                      height={120}
                      onMouseDown={(e) => {
                        const canvas = passengerCanvasRefs.current.get(index);
                        if (canvas) {
                          const ref = { current: canvas };
                          startDrawing(e, ref);
                        }
                      }}
                      onMouseMove={(e) => {
                        const canvas = passengerCanvasRefs.current.get(index);
                        if (canvas) {
                          const ref = { current: canvas };
                          draw(e, ref);
                        }
                      }}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={(e) => {
                        const canvas = passengerCanvasRefs.current.get(index);
                        if (canvas) {
                          const ref = { current: canvas };
                          startDrawing(e, ref);
                        }
                      }}
                      onTouchMove={(e) => {
                        const canvas = passengerCanvasRefs.current.get(index);
                        if (canvas) {
                          const ref = { current: canvas };
                          draw(e, ref);
                        }
                      }}
                      onTouchEnd={stopDrawing}
                      className="w-full h-28 sm:h-32 touch-none cursor-crosshair"
                      style={{ touchAction: 'none' }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    {!passenger.isOver18
                      ? 'Parent/guardian must sign this waiver on behalf of the minor'
                      : 'Draw your signature using your mouse or finger'}
                  </p>
                </div>

                {/* Parental Consent Form */}
                {!passenger.isOver18 && (
                  <div className="mt-6 border-t-2 border-amber-200 pt-6">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 max-h-96 overflow-y-auto mb-4">
                      <h4 className="text-slate-900 mb-4">Parental Consent Form</h4>
                      <div className="space-y-2 text-slate-700 text-sm whitespace-pre-wrap">
                        {parentalConsentText}
                      </div>
                    </div>

                    <label className="flex items-center gap-3 mb-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={passenger.agreedToParentalConsent || false}
                        onChange={(e) => updateParentalConsentAgreement(index, e.target.checked)}
                        className="flex-shrink-0 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded cursor-pointer focus:outline-none"
                      />
                      <span className="text-slate-700 text-sm">
                        I have read and agree to the terms of the parental consent form
                      </span>
                    </label>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-slate-700">
                          <span>Parent/Guardian Consent Signature *</span>
                        </label>
                        {hasParentalConsentSignature(index) && (
                          <button
                            type="button"
                            onClick={() => {
                              const canvas = parentalConsentCanvasRefs.current.get(index);
                              if (canvas) {
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                                  updateParentalConsentAgreement(index, false);
                                }
                              }
                            }}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="border-2 border-slate-300 rounded-lg bg-white overflow-hidden">
                        <canvas
                          ref={(el) => {
                            if (el) parentalConsentCanvasRefs.current.set(index, el);
                          }}
                          width={600}
                          height={120}
                          onMouseDown={(e) => {
                            const canvas = parentalConsentCanvasRefs.current.get(index);
                            if (canvas) {
                              const ref = { current: canvas };
                              startDrawing(e, ref);
                            }
                          }}
                          onMouseMove={(e) => {
                            const canvas = parentalConsentCanvasRefs.current.get(index);
                            if (canvas) {
                              const ref = { current: canvas };
                              draw(e, ref);
                            }
                          }}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={(e) => {
                            const canvas = parentalConsentCanvasRefs.current.get(index);
                            if (canvas) {
                              const ref = { current: canvas };
                              startDrawing(e, ref);
                            }
                          }}
                          onTouchMove={(e) => {
                            const canvas = parentalConsentCanvasRefs.current.get(index);
                            if (canvas) {
                              const ref = { current: canvas };
                              draw(e, ref);
                            }
                          }}
                          onTouchEnd={stopDrawing}
                          className="w-full h-28 sm:h-32 touch-none cursor-crosshair"
                          style={{ touchAction: 'none' }}
                        />
                      </div>
                      <p className="text-slate-500 text-xs mt-2">
                        Parent/guardian must sign this consent form to authorize minor participation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg active:scale-95 disabled:active:scale-100"
          >
            Complete Registration
          </button>
        </div>
      </div>
    </div>
  );
}