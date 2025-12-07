import { supabase } from '../lib/supabase';
import { RegistrationData, PageSettings, DbRegistration, DbSettings, Event, DbEvent, EventSettings, DbEventSettings, Car } from '../types';
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
    async addRegistration(registration: RegistrationData): Promise<boolean | 'validation_error'> {
        try {
            // CRITICAL: Server-side validation for required legal fields
            const requiredFields = {
                firstName: registration.firstName?.trim(),
                lastName: registration.lastName?.trim(),
                email: registration.email?.trim(),
                phone: registration.phone?.trim(),
                signature: registration.signature,
            };

            const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value)
                .map(([key]) => key);

            if (missingFields.length > 0) {
                console.error('VALIDATION ERROR: Missing required fields:', missingFields);
                toast.error(`Missing required information: ${missingFields.join(', ')}. Please go back and complete all fields.`);
                return 'validation_error';
            }

            const dbData = this.mapToDbRegistration(registration);
            // Remove id to let Supabase generate it
            const { id, ...insertData } = dbData as any;

            const { error } = await supabase
                .from('registrations')
                .insert([insertData]);

            if (error) throw error;
            return true;
        } catch (error: unknown) {
            console.error('Error adding registration:', error);
            // Check for rate limit error from database trigger
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Rate limit exceeded')) {
                // Don't show duplicate toast - caller will handle it
                // Return a special indicator for rate limit
                return 'rate_limited' as unknown as boolean;
            } else {
                toast.error('Failed to save registration. Please try again.');
            }
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

    // --- Event Management ---

    /**
     * Get all events
     */
    async getEvents(): Promise<Event[]> {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(this.mapToEvent);
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    /**
     * Get the currently active event
     */
    async getActiveEvent(): Promise<Event | null> {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (!data) return null;

            return this.mapToEvent(data);
        } catch (error) {
            console.error('Error fetching active event:', error);
            return null;
        }
    }

    /**
     * Create a new event
     */
    async createEvent(name: string, startDate?: string, endDate?: string, eventType: 'timed' | 'non_timed' = 'timed'): Promise<Event | null> {
        try {
            // First, unset any existing primary event
            await supabase
                .from('events')
                .update({ is_primary: false })
                .eq('is_primary', true);

            // Create the new event as primary
            const { data, error } = await supabase
                .from('events')
                .insert([{
                    name,
                    start_date: startDate || null,
                    end_date: endDate || null,
                    status: 'active',
                    is_primary: true,  // New events become primary automatically
                    event_type: eventType
                }])
                .select()
                .single();

            if (error) throw error;

            // Create empty event_settings for this event so it can be configured
            await supabase
                .from('event_settings')
                .insert([{
                    event_id: data.id,
                    hero_title: 'Test Drive Experience',
                    hero_subtitle: 'Register for your exclusive test drive',
                    footer_text: '© 2025 Traxion Events. All rights reserved.',
                    event_dates: [],
                    time_slots: [],
                    cars: []
                }]);

            toast.success(`Event "${name}" created and set as primary`);
            return this.mapToEvent(data);
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error('Failed to create event');
            return null;
        }
    }

    /**
     * Archive an event (makes it read-only)
     */
    async archiveEvent(eventId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('events')
                .update({
                    status: 'archived',
                    archived_at: new Date().toISOString()
                })
                .eq('id', eventId);

            if (error) throw error;

            toast.success('Event archived successfully');
            return true;
        } catch (error) {
            console.error('Error archiving event:', error);
            toast.error('Failed to archive event');
            return false;
        }
    }

    /**
     * Update an event
     */
    async updateEvent(eventId: string, updates: { name?: string; startDate?: string; endDate?: string }): Promise<boolean> {
        try {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
            if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;

            const { error } = await supabase
                .from('events')
                .update(dbUpdates)
                .eq('id', eventId);

            if (error) throw error;

            toast.success('Event updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Failed to update event');
            return false;
        }
    }

    /**
     * Get the primary event (the one shown to users)
     */
    async getPrimaryEvent(): Promise<Event | null> {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('is_primary', true)
                .eq('status', 'active')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No primary event set, fall back to first active
                    return this.getActiveEvent();
                }
                throw error;
            }

            return this.mapToEvent(data);
        } catch (error) {
            console.error('Error fetching primary event:', error);
            return null;
        }
    }

    /**
     * Set an event as primary (only one can be primary at a time)
     */
    async setPrimaryEvent(eventId: string): Promise<boolean> {
        try {
            // First, unset all primary flags
            await supabase
                .from('events')
                .update({ is_primary: false })
                .eq('is_primary', true);

            // Set the new primary event
            const { error } = await supabase
                .from('events')
                .update({ is_primary: true })
                .eq('id', eventId)
                .eq('status', 'active'); // Only active events can be primary

            if (error) throw error;

            toast.success('Primary event updated');
            return true;
        } catch (error) {
            console.error('Error setting primary event:', error);
            toast.error('Failed to set primary event');
            return false;
        }
    }

    // --- Event Settings ---

    /**
     * Get settings for a specific event
     */
    async getEventSettings(eventId: string, defaultSettings: PageSettings): Promise<EventSettings> {
        try {
            const { data, error } = await supabase
                .from('event_settings')
                .select('*')
                .eq('event_id', eventId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No settings for this event, create defaults
                    const newSettings: EventSettings = {
                        eventId,
                        ...defaultSettings
                    };
                    await this.setEventSettings(eventId, newSettings);
                    return newSettings;
                }
                throw error;
            }

            return this.mapToEventSettings(data);
        } catch (error) {
            console.error('Error fetching event settings:', error);
            return { eventId, ...defaultSettings };
        }
    }

    /**
     * Save settings for a specific event
     */
    async setEventSettings(eventId: string, settings: EventSettings): Promise<boolean> {
        try {
            const dbData = this.mapToDbEventSettings(settings);

            const { data, error } = await supabase
                .from('event_settings')
                .upsert({
                    event_id: eventId,
                    ...dbData
                }, {
                    onConflict: 'event_id'
                })
                .select();

            if (error) {
                console.error('Supabase error saving event settings:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error saving event settings:', error);
            toast.error('Failed to save event settings: ' + (error as any)?.message || 'Unknown error');
            return false;
        }
    }

    // --- Super Admin Check ---

    /**
     * Check if the current user is a super admin
     */
    async isSuperAdmin(): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const role = user.user_metadata?.role;
            return role === 'super_admin';
        } catch (error) {
            console.error('Error checking super admin status:', error);
            return false;
        }
    }

    /**
     * Get events based on user role (super admins see all, others see only active)
     */
    async getEventsForRole(): Promise<{ events: Event[]; isSuperAdmin: boolean }> {
        const isSuperAdmin = await this.isSuperAdmin();

        try {
            let query = supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false });

            // Non-super-admins only see active events
            if (!isSuperAdmin) {
                query = query.eq('status', 'active');
            }

            const { data, error } = await query;

            if (error) throw error;

            return {
                events: (data || []).map(this.mapToEvent),
                isSuperAdmin
            };
        } catch (error) {
            console.error('Error fetching events for role:', error);
            return { events: [], isSuperAdmin };
        }
    }

    /**
     * Get registrations filtered by event and optional folder
     */
    async getRegistrationsFiltered(options: {
        eventId?: string;
        folder?: string;
        excludeArchived?: boolean;
    }): Promise<RegistrationData[]> {
        try {
            let query = supabase
                .from('registrations')
                .select('*, events!inner(status)')
                .order('created_at', { ascending: false });

            if (options.eventId) {
                query = query.eq('event_id', options.eventId);
            }

            if (options.folder) {
                query = query.eq('folder', options.folder);
            }

            if (options.excludeArchived) {
                query = query.eq('events.status', 'active');
            }

            const { data, error } = await query;

            if (error) throw error;

            return (data || []).map((row: any) => this.mapToRegistrationData(row));
        } catch (error) {
            console.error('Error fetching filtered registrations:', error);
            return [];
        }
    }

    /**
     * Update the folder for a registration
     */
    async setRegistrationFolder(registrationId: string, folder: string | null): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('registrations')
                .update({ folder })
                .eq('registration_id', registrationId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error setting registration folder:', error);
            return false;
        }
    }

    /**
     * Get distinct folder names used in registrations
     */
    async getDistinctFolders(): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('folder')
                .not('folder', 'is', null);

            if (error) throw error;

            const folders = [...new Set((data || []).map(r => r.folder).filter(Boolean))];
            return folders.sort();
        } catch (error) {
            console.error('Error fetching folders:', error);
            return [];
        }
    }

    /**
     * Get registrations, optionally filtered by event
     */
    async getRegistrationsByEvent(eventId?: string): Promise<RegistrationData[]> {
        try {
            let query = supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (eventId) {
                query = query.eq('event_id', eventId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return (data || []).map(this.mapToRegistrationData);
        } catch (error) {
            console.error('Error fetching registrations:', error);
            toast.error('Failed to load registrations from database');
            return [];
        }
    }

    /**
     * Upload a waiver PDF (organized by event)
     */
    async uploadWaiver(blob: Blob, driverName: string, eventDate: string, eventId?: string): Promise<string | null> {
        try {
            // Create filename from driver name and date: "John_Doe_2024-12-03.pdf"
            const safeName = driverName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
            const safeDate = eventDate.replace(/[^a-zA-Z0-9-]/g, '_');
            const fileName = `${safeName}_${safeDate}.pdf`;

            // Organize by event folder if event ID is provided
            const filePath = eventId ? `${eventId}/${fileName}` : fileName;

            const { data, error } = await supabase.storage
                .from('waivers')
                .upload(filePath, blob, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('waivers')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading waiver:', error);
            return null;
        }
    }

    // --- Slot Hold System ---

    /**
     * Create a temporary hold on a slot (6 minutes)
     */
    async createSlotHold(carId: string, date: string, timeSlot: string, sessionId: string): Promise<boolean> {
        try {
            // First clean up any expired holds
            await this.cleanupExpiredHolds();

            const expiresAt = new Date(Date.now() + 6 * 60 * 1000).toISOString(); // 6 minutes

            const { error } = await supabase
                .from('slot_holds')
                .upsert({
                    car_id: carId,
                    date: date,
                    time_slot: timeSlot,
                    session_id: sessionId,
                    expires_at: expiresAt
                }, {
                    onConflict: 'car_id,date,time_slot'
                });

            if (error) {
                // If conflict, check if it's our own hold
                if (error.code === '23505') {
                    const existing = await this.getSlotHold(carId, date, timeSlot);
                    if (existing?.session_id === sessionId) {
                        // It's our hold, refresh it
                        await supabase
                            .from('slot_holds')
                            .update({ expires_at: expiresAt })
                            .eq('car_id', carId)
                            .eq('date', date)
                            .eq('time_slot', timeSlot);
                        return true;
                    }
                    return false; // Someone else has the hold
                }
                throw error;
            }
            return true;
        } catch (error) {
            console.error('Error creating slot hold:', error);
            return false;
        }
    }

    /**
     * Get existing hold for a slot
     */
    async getSlotHold(carId: string, date: string, timeSlot: string): Promise<{ session_id: string; expires_at: string } | null> {
        try {
            const { data, error } = await supabase
                .from('slot_holds')
                .select('session_id, expires_at')
                .eq('car_id', carId)
                .eq('date', date)
                .eq('time_slot', timeSlot)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    }

    /**
     * Release a slot hold
     */
    async releaseSlotHold(carId: string, date: string, timeSlot: string, sessionId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('slot_holds')
                .delete()
                .eq('car_id', carId)
                .eq('date', date)
                .eq('time_slot', timeSlot)
                .eq('session_id', sessionId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error releasing slot hold:', error);
            return false;
        }
    }

    /**
     * Release all holds for a session
     */
    async releaseAllHolds(sessionId: string): Promise<void> {
        try {
            await supabase
                .from('slot_holds')
                .delete()
                .eq('session_id', sessionId);
        } catch (error) {
            console.error('Error releasing all holds:', error);
        }
    }

    /**
     * Clean up expired holds
     */
    async cleanupExpiredHolds(): Promise<void> {
        try {
            await supabase
                .from('slot_holds')
                .delete()
                .lt('expires_at', new Date().toISOString());
        } catch (error) {
            console.error('Error cleaning up expired holds:', error);
        }
    }

    /**
     * Check if a slot is available (not booked and not held by someone else)
     */
    async isSlotAvailable(carId: string, date: string, timeSlot: string, mySessionId?: string): Promise<boolean> {
        try {
            // Clean up expired holds first
            await this.cleanupExpiredHolds();

            // Check for existing registration
            const { data: registrations } = await supabase
                .from('registrations')
                .select('id')
                .eq('date', date)
                .eq('time_slot', timeSlot)
                .filter('car_data->>id', 'eq', carId);

            if (registrations && registrations.length > 0) {
                return false; // Already booked
            }

            // Check for active holds
            const { data: holds } = await supabase
                .from('slot_holds')
                .select('session_id')
                .eq('car_id', carId)
                .eq('date', date)
                .eq('time_slot', timeSlot)
                .gt('expires_at', new Date().toISOString());

            if (holds && holds.length > 0) {
                // If there's a hold, check if it's ours
                if (mySessionId && holds[0].session_id === mySessionId) {
                    return true; // It's our hold
                }
                return false; // Someone else has the hold
            }

            return true; // Available
        } catch (error) {
            console.error('Error checking slot availability:', error);
            return false;
        }
    }

    /**
     * Final check before booking - ensures slot is still available
     */
    async checkSlotAvailableForBooking(carId: string, date: string, timeSlot: string): Promise<{ available: boolean; message?: string }> {
        try {
            // Check for existing registration
            const { data: registrations } = await supabase
                .from('registrations')
                .select('id')
                .eq('date', date)
                .eq('time_slot', timeSlot)
                .filter('car_data->>id', 'eq', carId);

            if (registrations && registrations.length > 0) {
                return {
                    available: false,
                    message: 'Sorry, this time slot was just booked by someone else. Please choose a different time.'
                };
            }

            return { available: true };
        } catch (error) {
            console.error('Error checking slot for booking:', error);
            return {
                available: false,
                message: 'Unable to verify slot availability. Please try again.'
            };
        }
    }

    /**
     * Get all slot statuses in a single batch (optimized - only 2 DB queries)
     */
    async getSlotStatusBatch(carId: string, date: string, sessionId: string): Promise<{
        bookedSlots: string[];
        heldSlots: string[];
        myHold: { slot: string; expiresAt: string } | null;
    }> {
        try {
            // Clean up expired holds first
            await this.cleanupExpiredHolds();

            // Query 1: Get all registrations for this car and date
            const { data: registrations } = await supabase
                .from('registrations')
                .select('time_slot')
                .eq('date', date)
                .filter('car_data->>id', 'eq', carId);

            const bookedSlots = (registrations || []).map(r => r.time_slot).filter(Boolean);

            // Query 2: Get all active holds for this car and date
            const { data: holds } = await supabase
                .from('slot_holds')
                .select('time_slot, session_id, expires_at')
                .eq('car_id', carId)
                .eq('date', date)
                .gt('expires_at', new Date().toISOString());

            const heldSlots: string[] = [];
            let myHold: { slot: string; expiresAt: string } | null = null;

            (holds || []).forEach(hold => {
                if (hold.session_id === sessionId) {
                    myHold = { slot: hold.time_slot, expiresAt: hold.expires_at };
                } else {
                    heldSlots.push(hold.time_slot);
                }
            });

            return { bookedSlots, heldSlots, myHold };
        } catch (error) {
            console.error('Error getting slot status batch:', error);
            return { bookedSlots: [], heldSlots: [], myHold: null };
        }
    }

    // --- Mappers ---

    private mapToRegistrationData(dbRow: DbRegistration): RegistrationData {
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
            eventId: dbRow.event_id || undefined,
        };
    }

    private mapToDbRegistration(data: RegistrationData): Partial<DbRegistration> {
        return {
            registration_id: data.registrationId,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            car_data: data.car,
            date: data.date || null,  // Support non-timed events with null date
            time_slot: data.timeSlot || null,  // Support non-timed events with null time
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
            event_id: data.eventId || null,
        };
    }

    private mapToDbUpdates(updates: Partial<RegistrationData>): Partial<DbRegistration> {
        const dbUpdates: Partial<DbRegistration> = {};
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

    private mapToPageSettings(dbRow: DbSettings): PageSettings {
        return {
            heroTitle: dbRow.hero_title,
            heroSubtitle: dbRow.hero_subtitle,
            waiverText: dbRow.waiver_text || '',
            footerText: dbRow.footer_text || '',
            parentalConsentText: dbRow.parental_consent_text || '',
            eventDates: dbRow.event_dates || [],
            timeSlots: dbRow.time_slots || [],
            cars: dbRow.cars || [],
            completionSmsEnabled: (dbRow as any).completion_sms_enabled ?? false,
            completionSmsMessage: (dbRow as any).completion_sms_message ?? '',
        };
    }

    private mapToEvent(dbRow: DbEvent): Event {
        return {
            id: dbRow.id,
            name: dbRow.name,
            startDate: dbRow.start_date || undefined,
            endDate: dbRow.end_date || undefined,
            status: dbRow.status,
            archivedAt: dbRow.archived_at || undefined,
            createdAt: dbRow.created_at,
            isPrimary: dbRow.is_primary || false,
            eventType: dbRow.event_type || 'timed',
        };
    }

    private mapToEventSettings(dbRow: DbEventSettings): EventSettings {
        return {
            id: dbRow.id,
            eventId: dbRow.event_id,
            heroTitle: dbRow.hero_title || '',
            heroSubtitle: dbRow.hero_subtitle || '',
            footerText: dbRow.footer_text || '',
            waiverText: dbRow.waiver_text || '',
            parentalConsentText: dbRow.parental_consent_text || '',
            eventDates: dbRow.event_dates || [],
            timeSlots: dbRow.time_slots || [],
            cars: dbRow.cars || [],
            completionSmsEnabled: dbRow.completion_sms_enabled ?? false,
            completionSmsMessage: dbRow.completion_sms_message || '',
        };
    }

    private mapToDbEventSettings(settings: EventSettings): Partial<DbEventSettings> {
        return {
            hero_title: settings.heroTitle,
            hero_subtitle: settings.heroSubtitle,
            footer_text: settings.footerText,
            waiver_text: settings.waiverText,
            parental_consent_text: settings.parentalConsentText,
            event_dates: settings.eventDates,
            time_slots: settings.timeSlots,
            cars: settings.cars as Car[],
            completion_sms_enabled: settings.completionSmsEnabled,
            completion_sms_message: settings.completionSmsMessage,
        };
    }

    private mapToDbSettings(settings: PageSettings): any {
        return {
            hero_title: settings.heroTitle,
            hero_subtitle: settings.heroSubtitle,
            waiver_text: settings.waiverText,
            footer_text: settings.footerText,
            parental_consent_text: settings.parentalConsentText,
            event_dates: settings.eventDates,
            time_slots: settings.timeSlots,
            cars: settings.cars,
        };
    }
}

export const supabaseStorageService = new SupabaseStorageService();
