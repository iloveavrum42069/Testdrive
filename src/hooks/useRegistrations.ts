import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RegistrationData } from '../App';
import { toast } from 'sonner';
import { storageService } from '../services/storageService';

export function useRegistrations(eventId?: string | null) {
    const queryClient = useQueryClient();

    // Query for fetching registrations
    const {
        data: registrations = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['registrations', eventId],
        queryFn: async () => {
            // Filter by eventId when one is selected
            if (eventId) {
                const data = await storageService.getRegistrationsByEvent(eventId);
                return [...data].reverse();
            }
            // When no event is selected (null), fetch all registrations
            const data = await storageService.getRegistrations();
            return [...data].reverse();
        },
        staleTime: 1000 * 60, // 1 minute stale time
    });

    if (error) {
        console.error('Failed to load registrations:', error);
        toast.error('Failed to load registrations');
    }

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: storageService.deleteRegistration,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            toast.success('Registration deleted');
        },
        onError: () => toast.error('Failed to delete registration'),
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
            return storageService.updateRegistration(id, { completed });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            toast.success(variables.completed
                ? 'Test drive marked as complete!'
                : 'Test drive marked as incomplete'
            );
        },
        onError: () => toast.error('Failed to update status'),
    });

    const addMutation = useMutation({
        mutationFn: async (registration: RegistrationData) => {
            const registrationWithEvent = eventId
                ? { ...registration, eventId }
                : registration;
            return storageService.addRegistration(registrationWithEvent);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            toast.success('Registration added successfully!');
        },
        onError: () => toast.error('Failed to add registration'),
    });

    const verifyLicenseMutation = useMutation({
        mutationFn: async ({ id, initials }: { id: string; initials: string }) => {
            const updates = {
                licenseVerified: true,
                licenseVerifiedBy: initials,
                licenseVerifiedAt: new Date().toISOString()
            };
            return storageService.updateRegistration(id, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            toast.success('Driver\'s license verified successfully!');
        },
        onError: () => toast.error('Failed to verify license'),
    });

    // Wrapper functions to maintain API compatibility
    const deleteRegistration = async (registrationId: string) => {
        if (confirm('Are you sure you want to delete this registration?')) {
            await deleteMutation.mutateAsync(registrationId);
            return true;
        }
        return false;
    };

    const toggleComplete = async (registrationId: string) => {
        const registration = registrations.find(r => r.registrationId === registrationId);
        if (!registration) return;
        await updateStatusMutation.mutateAsync({
            id: registrationId,
            completed: !registration.completed
        });
    };

    const addRegistration = async (registration: RegistrationData) => {
        await addMutation.mutateAsync(registration);
    };

    const verifyLicense = async (registrationId: string, initials: string) => {
        await verifyLicenseMutation.mutateAsync({ id: registrationId, initials });
    };

    return {
        registrations,
        isLoading,
        loadRegistrations: () => queryClient.invalidateQueries({ queryKey: ['registrations'] }), // Manual refresh
        deleteRegistration,
        toggleComplete,
        addRegistration,
        verifyLicense
    };
}
