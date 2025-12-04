import { supabase } from '../lib/supabase';
import { RegistrationData } from '../App';
import { PageSettings } from '../components/PageEditor';
import { toast } from 'sonner';

export class SupabaseStorageService {

    /**
     * Get all registrations
     */
    async getRegistrations(): Promise<RegistrationData[]> {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(this.mapToRegistrationData);
        } catch (error) {
            console.error('Error fetching registrations:', error);
            toast.error('Failed to load registrations from database');
            return [];
        }
    }

    /**
     * Add a new registration
     */
    async addRegistration(registration: RegistrationData): Promise<boolean> {
        try {
            const dbData = this.mapToDbRegistration(registration);
            // Remove id to let Supabase generate it
            const { id, ...insertData } = dbData as any;

            const { error } = await supabase
                .from('registrations')
                .insert([insertData]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error adding registration:', error);
            toast.error('Failed to save registration');
            return false;
        }
    }

    /**
     * Update an existing registration
     */
    async updateRegistration(registrationId: string, updates: Partial<RegistrationData>): Promise<boolean> {
        try {
            const dbUpdates = this.mapToDbUpdates(updates);

            const { error } = await supabase
                .from('registrations')
                .update(dbUpdates)
                .eq('registration_id', registrationId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating registration:', error);
            toast.error('Failed to update registration');
            return false;
        }
    }

    /**
     * Delete a registration
     */
    async deleteRegistration(registrationId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('registrations')
                .delete()
                .eq('registration_id', registrationId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting registration:', error);
            toast.error('Failed to delete registration');
            return false;
        }
    }

    /**
     * Clear all registrations (Admin only really)
     */
    async clearRegistrations(): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('registrations')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error clearing registrations:', error);
            return false;
        }
    }

    /**
     * Get page settings
     */
    async getPageSettings(defaultSettings: PageSettings): Promise<PageSettings> {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) {
                // If not found, try to insert default
                if (error.code === 'PGRST116') {
                    await this.setPageSettings(defaultSettings);
                    return defaultSettings;
                }
                throw error;
            }

            return this.mapToPageSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            return defaultSettings;
        }
    }

    /**
     * Save page settings
     */
    async setPageSettings(settings: PageSettings): Promise<boolean> {
        try {
            const dbData = this.mapToDbSettings(settings);

            const { error } = await supabase
                .from('settings')
                .upsert({ id: 1, ...dbData });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
            return false;
        }
    }

    /**
     * Upload a waiver PDF
     */
    async uploadWaiver(blob: Blob, driverName: string, eventDate: string): Promise<string | null> {
        try {
            // Create filename from driver name and date: "John_Doe_2024-12-03.pdf"
            const safeName = driverName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
            const safeDate = eventDate.replace(/[^a-zA-Z0-9-]/g, '_');
            const fileName = `${safeName}_${safeDate}.pdf`;

            const { data, error } = await supabase.storage
                .from('waivers')
                .upload(fileName, blob, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('waivers')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading waiver:', error);
            return null;
        }
    }

    // --- Mappers ---

    private mapToRegistrationData(dbRow: any): RegistrationData {
        return {
            registrationId: dbRow.registration_id,
            firstName: dbRow.first_name,
            lastName: dbRow.last_name,
            email: dbRow.email,
            phone: dbRow.phone,
            car: dbRow.car_data, // JSONB maps directly to object
            date: dbRow.date,
            timeSlot: dbRow.time_slot,
            completed: dbRow.completed,
            licenseVerified: dbRow.license_verified,
            licenseVerifiedBy: dbRow.license_verified_by,
            licenseVerifiedAt: dbRow.license_verified_at,
            signature: dbRow.signature,
            registeredAt: dbRow.registered_at,
            agreedToTOS: dbRow.agreed_to_tos,
            communicationOptIn: dbRow.communication_opt_in,
            additionalPassengers: dbRow.additional_passengers || [],
            waiverPdfUrl: dbRow.waiver_pdf_url,
        };
    }

    private mapToDbRegistration(data: RegistrationData): any {
        return {
            registration_id: data.registrationId,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            car_data: data.car,
            date: data.date,
            time_slot: data.timeSlot,
            completed: data.completed ?? false,
            license_verified: data.licenseVerified ?? false,
            license_verified_by: data.licenseVerifiedBy,
            license_verified_at: data.licenseVerifiedAt,
            signature: data.signature,
            registered_at: data.registeredAt,
            agreed_to_tos: data.agreedToTOS,
            communication_opt_in: data.communicationOptIn,
            additional_passengers: data.additionalPassengers,
            waiver_pdf_url: data.waiverPdfUrl,
        };
    }

    private mapToDbUpdates(updates: Partial<RegistrationData>): any {
        const dbUpdates: any = {};
        if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
        if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.car !== undefined) dbUpdates.car_data = updates.car;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.timeSlot !== undefined) dbUpdates.time_slot = updates.timeSlot;
        if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
        if (updates.licenseVerified !== undefined) dbUpdates.license_verified = updates.licenseVerified;
        if (updates.licenseVerifiedBy !== undefined) dbUpdates.license_verified_by = updates.licenseVerifiedBy;
        if (updates.licenseVerifiedAt !== undefined) dbUpdates.license_verified_at = updates.licenseVerifiedAt;
        if (updates.signature !== undefined) dbUpdates.signature = updates.signature;
        if (updates.agreedToTOS !== undefined) dbUpdates.agreed_to_tos = updates.agreedToTOS;
        if (updates.communicationOptIn !== undefined) dbUpdates.communication_opt_in = updates.communicationOptIn;
        if (updates.additionalPassengers !== undefined) dbUpdates.additional_passengers = updates.additionalPassengers;
        if (updates.waiverPdfUrl !== undefined) dbUpdates.waiver_pdf_url = updates.waiverPdfUrl;
        return dbUpdates;
    }

    private mapToPageSettings(dbRow: any): PageSettings {
        return {
            heroTitle: dbRow.hero_title,
            heroSubtitle: dbRow.hero_subtitle,
            waiverText: dbRow.waiver_text || '',
            footerText: dbRow.footer_text || '',
            parentalConsentText: dbRow.parental_consent_text || '',
            adminPassword: dbRow.admin_password,
            eventDates: dbRow.event_dates || [],
            timeSlots: dbRow.time_slots || [],
            cars: dbRow.cars || [],
        };
    }

    private mapToDbSettings(settings: PageSettings): any {
        return {
            hero_title: settings.heroTitle,
            hero_subtitle: settings.heroSubtitle,
            waiver_text: settings.waiverText,
            footer_text: settings.footerText,
            parental_consent_text: settings.parentalConsentText,
            admin_password: settings.adminPassword,
            event_dates: settings.eventDates,
            time_slots: settings.timeSlots,
            cars: settings.cars,
        };
    }
}

export const supabaseStorageService = new SupabaseStorageService();
