/**
 * Centralized type definitions for the Test Drive Registration app
 */

// ============= Core Types =============

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
    eventId?: string;
}

export interface PageSettings {
    heroTitle: string;
    heroSubtitle: string;
    eventDates: string[];
    timeSlots: string[];
    waiverText: string;
    footerText: string;
    parentalConsentText: string;
    cars: Car[];
    // Completion SMS settings
    completionSmsEnabled: boolean;
    completionSmsMessage: string;
}

// ============= Database Row Types =============

export interface DbRegistration {
    id: string;
    registration_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date: string;
    time_slot: string;
    has_valid_license: boolean;
    signature: string;
    registered_at: string;
    completed: boolean;
    communication_opt_in: boolean;
    license_verified: boolean;
    license_verified_by: string | null;
    license_verified_at: string | null;
    agreed_to_tos: boolean;
    waiver_pdf_url: string | null;
    car_data: Car | null;
    additional_passengers: Passenger[] | null;
    event_id: string | null;
}

export interface DbSettings {
    id: string;
    hero_title: string;
    hero_subtitle: string;
    waiver_text: string;
    footer_text: string;
    parental_consent_text: string;
    event_dates: string[];
    time_slots: string[];
    cars: Car[];
}

// ============= Slot Status Types =============

export interface SlotStatusBatch {
    bookedSlots: string[];
    heldSlots: string[];
    myHold: { slot: string; expiresAt: string } | null;
}

// ============= Event Types =============

export interface Event {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    status: 'active' | 'archived';
    archivedAt?: string;
    createdAt: string;
}

export interface DbEvent {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: 'active' | 'archived';
    archived_at: string | null;
    created_at: string;
    updated_at: string;
}
