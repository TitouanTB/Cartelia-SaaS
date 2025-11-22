// frontend/src/providers/AuthProvider.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface Restaurant { id: number; name: string; }
interface AuthState { user: { id: string; email: string } | null; restaurants: Restaurant[]; }

type AuthContextValue = {
  status: AuthStatus;
  user: AuthState['user'] | null;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  selectedRestaurantId: number | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setRestaurant: (id: number) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'cartelia:selected-restaurant';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? Number(s) : null;
  });
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setAuthState(null); setStatus('unauthenticated'); return; }
    const { data: restos = [] } = await supabase.from('restaurants').select('id,name').eq('owner_id', session.user.id);
    setAuthState({ user: session.user, restaurants: restos || [] });
    setStatus('authenticated');
    if (restos.length > 0 && !selectedId) {
      const id = restos[0].id;
      setSelectedId(id);
      localStorage.setItem(STORAGE_KEY, String(id));
    }
  }, [selectedId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') { load(); navigate('/dashboard', { replace: true }); }
      if (event === 'SIGNED_OUT') { navigate('/login', { replace: true }); }
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate, load]);

  const selectedRestaurant = authState?.restaurants.find(r => r.id === selectedId) || null;

  const login = async (e: string, p: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });
    if (error) throw error;
  };

  const signup = async (e: string, p: string) => {
    const { error } = await supabase.auth.signUp({
      email: e,
      password: p,
      options: { emailRedirectTo: 'https://cartelia-saas.vercel.app/dashboard' },
    });
    if (error) throw error;
  };

  const logout = () => supabase.auth.signOut();

  const value = useMemo(() => ({
    status, user: authState?.user ?? null, restaurants: authState?.restaurants ?? [],
    selectedRestaurant, selectedRestaurantId: selectedId,
    login, signup, logout,
    setRestaurant: (id: number) => { setSelectedId(id); localStorage.setItem(STORAGE_KEY, String(id)); },
  }), [authState, selectedId, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRestaurantId]);

  const setRestaurant = useCallback((restaurantId: number) => {
    setSelectedRestaurantId(restaurantId);
    localStorage.setItem(RESTAURANT_STORAGE_KEY, String(restaurantId));
  }, []);

  const selectedRestaurant = useMemo(() => {
    if (!authState || !selectedRestaurantId) return null;
    return authState.restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;
  }, [authState, selectedRestaurantId]);

  const login = useCallback(async (email: string, password: string) => {
    await auth.signIn(email, password);
    await loadAuthState();
  }, [loadAuthState]);

  const signup = useCallback(async (email: string, password: string) => {
    await auth.signUp(email, password);
    await loadAuthState();
  }, [loadAuthState]);

  const logout = useCallback(async () => {
    await auth.signOut();
    setAuthState(null);
    setStatus('unauthenticated');
    setSelectedRestaurantId(null);
    localStorage.removeItem(RESTAURANT_STORAGE_KEY);
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
