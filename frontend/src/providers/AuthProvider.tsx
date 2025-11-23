import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface Restaurant {
  id: number;
  name: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(() => {
    const stored = localStorage.getItem(RESTAURANT_STORAGE_KEY);
    if (!stored) return null;
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? null : parsed;
  });
  const navigate = useNavigate();

  const loadAuthState = useCallback(async () => {
    setStatus('loading');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setAuthState(null);
      setStatus('unauthenticated');
      return;
    }

    // Fetch restaurants from backend or Supabase
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
      const preferredId = selectedRestaurantId ?? state.restaurants[0]?.id ?? null;
      setSelectedRestaurantId(preferredId);
      if (preferredId) {
        localStorage.setItem(RESTAURANT_STORAGE_KEY, String(preferredId));
      }
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadAuthState();
        navigate('/dashboard', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        setAuthState(null);
        setStatus('unauthenticated');
        setSelectedRestaurantId(null);
        localStorage.removeItem(RESTAURANT_STORAGE_KEY);
        navigate('/login', { replace: true });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, loadAuthState]);

  const setRestaurant = useCallback((restaurantId: number) => {
    setSelectedRestaurantId(restaurantId);
    localStorage.setItem(RESTAURANT_STORAGE_KEY, String(restaurantId));
  }, []);

  const selectedRestaurant = useMemo(() => {
    if (!authState || !selectedRestaurantId) return null;
    return authState.restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;
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
    await loadAuthState();
  }, [loadAuthState]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user: authState?.user ?? null,
    restaurants: authState?.restaurants ?? [],
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
