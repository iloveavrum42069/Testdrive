import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
}

class AuthService {
    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: 'An unexpected error occurred' };
        }
    }

    /**
     * Sign out the current user
     */
    async signOut(): Promise<void> {
        await supabase.auth.signOut();
    }

    /**
     * Get the current session
     */
    async getSession(): Promise<Session | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }

    /**
     * Get the current user
     */
    async getUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback: (session: Session | null) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                callback(session);
            }
        );
        return subscription;
    }
}

export const authService = new AuthService();
