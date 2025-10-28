import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, Restaurant } from '../lib/auth';
import { auth } from '../lib/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

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

  const loadAuthState = useCallback(async () => {
    setStatus('loading');
    const currentUser = await auth.getCurrentUser();
    if (!currentUser) {
      setAuthState(null);
      setStatus('unauthenticated');
      return;
    }

    setAuthState(currentUser);
    setStatus('authenticated');

    if (currentUser.restaurants.length > 0) {
      const preferredId = selectedRestaurantId ?? currentUser.restaurants[0]?.id ?? null;
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
    const subscription = auth.onAuthStateChange(async (state) => {
      if (!state) {
        setAuthState(null);
        setStatus('unauthenticated');
        setSelectedRestaurantId(null);
        localStorage.removeItem(RESTAURANT_STORAGE_KEY);
        return;
      }

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
