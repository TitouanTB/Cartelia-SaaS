import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface Restaurant {
  id: number;
  name: string;
  logo?: string;
  primaryColor?: string;
}

interface AuthState {
  user: { id: string; email: string } | null;
  restaurants: Restaurant[];
}

type AuthContextValue = {
  status: AuthStatus;
  user: AuthState['user'] | null;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  selectedRestaurantId: number | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setRestaurant: (restaurantId: number) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const RESTAURANT_STORAGE_KEY = 'cartelia:selected-restaurant';

function hasStoredSession(): boolean {
  try {
    const key = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL || 'https://dcstytsxdyxayujmfxmn.supabase.co').hostname.split('.')[0]}-auth-token`;
    const stored = localStorage.getItem(key);
    if (!stored) return false;
    const data = JSON.parse(stored);
    return !!(data?.access_token && data?.refresh_token);
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => hasStoredSession() ? 'authenticated' : 'loading');
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const navigate = useNavigate();
  const initialized = useRef(false);

  const loadAuthState = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setStatus('loading');
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      setAuthState(null);
      setStatus('unauthenticated');
      return;
    }

    const { data: restaurants = [], error } = await supabase
      .from('restaurants')
      .select('id,name')
      .eq('owner_id', session.user.id);

    if (error) {
      console.error('Error loading restaurants:', error);
      setAuthState({ user: { id: session.user.id, email: session.user.email! }, restaurants: [] });
      setStatus('authenticated');
      return;
    }

    const state: AuthState = {
      user: { id: session.user.id, email: session.user.email! },
      restaurants: restaurants as Restaurant[],
    };

    setAuthState(state);
    setStatus('authenticated');

    if (state.restaurants.length > 0) {
      let preferredId = selectedRestaurantId;
      if (preferredId === null) {
        preferredId = state.restaurants[0].id;
      }
      setSelectedRestaurantId(preferredId);
      localStorage.setItem(RESTAURANT_STORAGE_KEY, String(preferredId));
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;
    loadAuthState(true);
  }, [loadAuthState]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadAuthState(false);
        navigate('/', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        setAuthState(null);
        setStatus('unauthenticated');
        setSelectedRestaurantId(null);
        localStorage.removeItem(RESTAURANT_STORAGE_KEY);
        navigate('/login', { replace: true });
      } else if (event === 'USER_UPDATED' && session) {
        setAuthState(prev => prev ? { ...prev, user: { id: session.user.id, email: session.user.email! } } : null);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, [navigate, loadAuthState]);

  const setRestaurant = useCallback((restaurantId: number) => {
    setSelectedRestaurantId(restaurantId);
    localStorage.setItem(RESTAURANT_STORAGE_KEY, String(restaurantId));
  }, []);

  const selectedRestaurant = useMemo(() => {
    if (!authState || !selectedRestaurantId) return null;
    return authState.restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) || null;
  }, [authState, selectedRestaurantId]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://cartelia-saas.vercel.app/dashboard',
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refresh = useCallback(async () => {
    await loadAuthState(true);
  }, [loadAuthState]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user: authState?.user || null,
    restaurants: authState?.restaurants || [],
    selectedRestaurant,
    selectedRestaurantId,
    login,
    signup,
    logout,
    refresh,
    setRestaurant,
  }), [authState, login, logout, refresh, selectedRestaurant, selectedRestaurantId, setRestaurant, signup, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
