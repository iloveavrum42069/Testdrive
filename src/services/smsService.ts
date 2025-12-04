import { storageService } from './storageService';
import { supabase } from '../lib/supabase';

interface SmsData {
    phone: string;
    firstName: string;
    lastName: string;
    date: string;
    time: string;
    carName: string;
}

class SmsService {
    /**
     * Send confirmation SMS after successful registration
     */
    async sendConfirmationSms(data: SmsData): Promise<boolean> {
        try {
            const { data: result, error } = await supabase.functions.invoke('send-sms', {
                body: data,
            });

            if (error) {
                console.error('SMS send error:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to send SMS:', error);
            // Don't throw - SMS is not critical to registration
            return false;
        }
    }
}

export const smsService = new SmsService();
