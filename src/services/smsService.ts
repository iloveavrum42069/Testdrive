import { supabase } from '../lib/supabase';

interface SmsData {
    phone: string;
    firstName: string;
    lastName: string;
    date: string;
    time: string;
    carName: string;
}

interface CompletionSmsData {
    phone: string;
    messageTemplate: string;
    firstName: string;
    lastName: string;
    carName: string;
    date: string;
    time: string;
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

    /**
     * Send completion SMS when admin marks test drive as complete
     */
    async sendCompletionSms(data: CompletionSmsData): Promise<boolean> {
        try {
            // Replace placeholders in message template
            const message = data.messageTemplate
                .replace(/{firstName}/g, data.firstName)
                .replace(/{lastName}/g, data.lastName)
                .replace(/{carName}/g, data.carName)
                .replace(/{date}/g, data.date)
                .replace(/{time}/g, data.time);

            const { error } = await supabase.functions.invoke('send-sms', {
                body: {
                    phone: data.phone,
                    customMessage: message, // Send pre-composed message
                },
            });

            if (error) {
                console.error('Completion SMS send error:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to send completion SMS:', error);
            return false;
        }
    }
}

export const smsService = new SmsService();
