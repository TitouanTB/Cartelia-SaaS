import { supabase } from './supabase';
import { api } from './api';

export type User = {
  id: string;
  email: string;
};

export type Restaurant = {
  id: number;
  name: string;
  logo?: string;
  primaryColor?: string;
};

export type AuthState = {
  user: User | null;
  restaurants: Restaurant[];
};

export const auth = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    return session;
  },

  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  },

  async getCurrentUser(): Promise<AuthState | null> {
    try {
      const session = await this.getSession();
      if (!session) return null;

      const data = await api.get<AuthState>('/auth/me');
      return data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (state: AuthState | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const authState = await this.getCurrentUser();
        callback(authState);
      } else {
        callback(null);
      }
    });

    return subscription;
  },
};
