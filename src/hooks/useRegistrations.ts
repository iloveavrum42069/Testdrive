import { useState, useEffect, useCallback } from 'react';
import { RegistrationData } from '../App';
import { toast } from 'sonner';
import { storageService } from '../services/storageService';

export function useRegistrations(eventId?: string | null) {
    const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRegistrations = useCallback(async () => {
        setIsLoading(true);
        try {
            // Always load all registrations for now
            // Event filtering will be added once database is fully set up
            const data = await storageService.getRegistrations();
            setRegistrations([...data].reverse());
        } catch (error) {
            console.error('Failed to load registrations:', error);
            toast.error('Failed to load registrations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRegistrations();
    }, [loadRegistrations]);

    const deleteRegistration = async (registrationId: string) => {
        if (confirm('Are you sure you want to delete this registration?')) {
            const success = await storageService.deleteRegistration(registrationId);
            if (success) {
                await loadRegistrations();
                return true;
            } else {
                toast.error('Failed to delete registration');
            }
        }
        return false;
    };

    const toggleComplete = async (registrationId: string) => {
        const registration = registrations.find(r => r.registrationId === registrationId);
        if (!registration) return;

        const newStatus = !registration.completed;
        const success = await storageService.updateRegistration(registrationId, { completed: newStatus });

        if (success) {
            await loadRegistrations();
            toast.success(newStatus
                ? 'Test drive marked as complete!'
                : 'Test drive marked as incomplete'
            );
            return { ...registration, completed: newStatus };
        } else {
            toast.error('Failed to update status');
        }
    };

    const addRegistration = async (registration: RegistrationData) => {
        // Add event ID to the registration if provided
        const registrationWithEvent = eventId
            ? { ...registration, eventId }
            : registration;

        const success = await storageService.addRegistration(registrationWithEvent);
        if (success) {
            await loadRegistrations();
            toast.success('Registration added successfully!');
        } else {
            toast.error('Failed to add registration');
        }
    };

    const verifyLicense = async (registrationId: string, initials: string) => {
        const updates = {
            licenseVerified: true,
            licenseVerifiedBy: initials,
            licenseVerifiedAt: new Date().toISOString()
        };

        const success = await storageService.updateRegistration(registrationId, updates);

        if (success) {
            await loadRegistrations();
            toast.success('Driver\'s license verified successfully!');

            const registration = registrations.find(r => r.registrationId === registrationId);
            return registration ? { ...registration, ...updates } : undefined;
        } else {
            toast.error('Failed to verify license');
        }
    };

    return {
        registrations,
        isLoading,
        loadRegistrations,
        deleteRegistration,
        toggleComplete,
        addRegistration,
        verifyLicense
    };
}
