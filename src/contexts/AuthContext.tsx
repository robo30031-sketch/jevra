import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Profile } from '../types/database';
import { getSupabaseClient, testSupabaseConnection } from '../lib/supabase';
import { dataEngine, SEED_USERS } from '../lib/dataEngine';

interface AuthContextType {
  currentUser: Profile | null;
  isLoading: boolean;
  isSupabaseLive: boolean;
  supabaseStatus: string;
  allUsers: Profile[];
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, preferredCurrency?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  switchUser: (userId: string) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_USER_STORAGE_KEY = 'jevra_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('Checking connection...');
  const [allUsers, setAllUsers] = useState<Profile[]>(SEED_USERS);

  // Check Supabase status on mount
  const checkSupabase = async () => {
    const res = await testSupabaseConnection();
    setIsSupabaseLive(res.success);
    setSupabaseStatus(res.message);
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkSupabase();

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile from supabase
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setCurrentUser(profile as Profile);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase auth session fetch error:', err);
        }
      }

      // Local / Offline / Demo mode restore
      const savedUserId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      const user = savedUserId ? dataEngine.getProfile(savedUserId) : SEED_USERS[0];
      setCurrentUser(user || SEED_USERS[0]);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setCurrentUser(profile as Profile);
            localStorage.setItem(ACTIVE_USER_STORAGE_KEY, profile.id);
            setIsLoading(false);
            return { success: true };
          }
        }
      } catch (err: unknown) {
        console.warn('Supabase signIn falling back to engine:', err);
      }
    }

    // Engine fallback: find by email or create
    const found = SEED_USERS.find(
      (u) =>
        u.id.toLowerCase() === email.toLowerCase() ||
        u.full_name.toLowerCase().includes(email.toLowerCase()) ||
        email.toLowerCase().includes(u.full_name.toLowerCase().split(' ')[0].toLowerCase())
    );

    if (found) {
      setCurrentUser(found);
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, found.id);
      setIsLoading(false);
      return { success: true };
    }

    // If new email in engine
    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      full_name: email.split('@')[0],
      phone: null,
      preferred_currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dataEngine.createProfile(newProfile);
    dataEngine.createWorkspace(newProfile.id, {
      name: `${newProfile.full_name}'s Vault`,
      workspace_type: 'personal',
      currency: 'INR',
      description: 'Initial personal finance workspace',
    });

    setCurrentUser(newProfile);
    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, newProfile.id);
    setAllUsers([...allUsers, newProfile]);
    setIsLoading(false);
    return { success: true };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    preferredCurrency: string = 'INR'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              preferred_currency: preferredCurrency,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          // If session is immediately available (confirm email disabled or local)
          const newProfile: Profile = {
            id: data.user.id,
            full_name: fullName,
            preferred_currency: preferredCurrency,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCurrentUser(newProfile);
          localStorage.setItem(ACTIVE_USER_STORAGE_KEY, newProfile.id);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
    }

    // Offline / Demo registration:
    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      full_name: fullName,
      phone: '+91 90000 00000',
      preferred_currency: preferredCurrency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dataEngine.createProfile(newProfile);
    // Auto-create initial personal workspace & owner membership
    dataEngine.createWorkspace(newProfile.id, {
      name: `${fullName}'s Personal Vault`,
      workspace_type: 'personal',
      currency: preferredCurrency,
      description: 'Primary personal finance vault',
    });

    setCurrentUser(newProfile);
    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, newProfile.id);
    setAllUsers((prev) => [...prev, newProfile]);
    setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Password recovery email sent successfully.' };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }
    return { success: true, message: 'Password reset simulation: Instructions sent to email.' };
  };

  const switchUser = (userId: string) => {
    const target = dataEngine.getProfile(userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, target.id);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    try {
      const updated = dataEngine.updateProfile(currentUser.id, updates);
      setCurrentUser(updated);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      isSupabaseLive,
      supabaseStatus,
      allUsers,
      signIn,
      signUp,
      signOut,
      resetPassword,
      switchUser,
      updateProfile,
      refreshConnection: checkSupabase,
    }),
    [currentUser, isLoading, isSupabaseLive, supabaseStatus, allUsers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
