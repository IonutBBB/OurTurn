import { create } from 'zustand';
import { supabase } from '@memoguard/supabase';
import type { Household, Patient, Caregiver } from '@memoguard/shared';
import type { User, Session } from '@supabase/supabase-js';
import {
  saveSession,
  getSession,
  clearSession,
} from '../utils/session';

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  caregiver: Caregiver | null;
  household: Household | null;
  patient: Patient | null;

  // Actions
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
  loadCaregiverData: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  session: null,
  caregiver: null,
  household: null,
  patient: null,

  initialize: async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        await saveSession(session);
        set({
          isInitialized: true,
          isAuthenticated: true,
          user: session.user,
          session,
        });

        // Load caregiver data in background
        get().loadCaregiverData();
      } else {
        // Check for persisted session
        const savedSession = await getSession();
        if (savedSession) {
          const { data: { session: refreshedSession } } = await supabase.auth.setSession({
            access_token: savedSession.access_token,
            refresh_token: savedSession.refresh_token,
          });

          if (refreshedSession) {
            await saveSession(refreshedSession);
            set({
              isInitialized: true,
              isAuthenticated: true,
              user: refreshedSession.user,
              session: refreshedSession,
            });
            get().loadCaregiverData();
            return;
          }
        }

        set({
          isInitialized: true,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({
        isInitialized: true,
        isAuthenticated: false,
      });
    }
  },

  setSession: async (session) => {
    if (session) {
      await saveSession(session);
      set({
        isAuthenticated: true,
        user: session.user,
        session,
      });
      get().loadCaregiverData();
    } else {
      await clearSession();
      set({
        isAuthenticated: false,
        user: null,
        session: null,
        caregiver: null,
        household: null,
        patient: null,
      });
    }
  },

  loadCaregiverData: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Load caregiver with household and patient
      const { data: caregiver } = await supabase
        .from('caregivers')
        .select(`
          *,
          households (
            *,
            patients (*)
          )
        `)
        .eq('id', user.id)
        .single();

      if (caregiver) {
        const household = caregiver.households;
        const patient = household?.patients?.[0] || null;

        set({
          caregiver,
          household,
          patient,
        });
      }
    } catch (error) {
      console.error('Failed to load caregiver data:', error);
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    await clearSession();
    set({
      isAuthenticated: false,
      user: null,
      session: null,
      caregiver: null,
      household: null,
      patient: null,
    });
  },
}));
