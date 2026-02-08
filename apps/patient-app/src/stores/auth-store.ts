import { create } from 'zustand';
import type { Household, Patient } from '@ourturn/shared';
import {
  saveSession,
  getSession,
  clearSession,
  saveHouseholdData,
  savePatientData,
  getHouseholdData,
  getPatientData,
  type PatientSession,
} from '../utils/session';
import { initLanguageFromHousehold } from '../i18n';
import { getHouseholdByCareCode } from '@ourturn/supabase';

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  session: PatientSession | null;
  household: Household | null;
  patient: Patient | null;

  // Actions
  initialize: () => Promise<void>;
  login: (household: Household & { patient: Patient }, careCode: string) => Promise<void>;
  logout: () => Promise<void>;
  setHouseholdData: (household: Household, patient: Patient) => Promise<void>;
  refreshFromServer: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isInitialized: false,
  isAuthenticated: false,
  session: null,
  household: null,
  patient: null,

  initialize: async () => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Auth init timeout')), 5000)
    );

    try {
      const session = await Promise.race([getSession(), timeout]);
      if (session) {
        const [household, patient] = await Promise.all([
          Promise.race([getHouseholdData(), timeout]),
          Promise.race([getPatientData(), timeout]),
        ]);
        set({
          isInitialized: true,
          isAuthenticated: true,
          session,
          household,
          patient,
        });
        // Sync language from household (respects manual override)
        initLanguageFromHousehold(household?.language).catch(() => {});

        // Refresh from server in background to pick up any changes
        get().refreshFromServer().catch(() => {});
      } else {
        set({
          isInitialized: true,
          isAuthenticated: false,
          session: null,
          household: null,
          patient: null,
        });
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to initialize auth:', error);
      set({
        isInitialized: true,
        isAuthenticated: false,
        session: null,
        household: null,
        patient: null,
      });
    }
  },

  login: async (householdWithPatient, careCode) => {
    const { patient, ...household } = householdWithPatient;

    const session: PatientSession = {
      householdId: household.id,
      careCode,
      connectedAt: new Date().toISOString(),
    };

    await saveSession(session);
    await saveHouseholdData(household);
    await savePatientData(patient);

    set({
      isAuthenticated: true,
      session,
      household,
      patient,
    });
  },

  logout: async () => {
    await clearSession();
    set({
      isAuthenticated: false,
      session: null,
      household: null,
      patient: null,
    });
  },

  setHouseholdData: async (household, patient) => {
    await saveHouseholdData(household);
    await savePatientData(patient);
    set({ household, patient });
    // Sync language if household language changed
    initLanguageFromHousehold(household?.language).catch(() => {});
  },

  refreshFromServer: async () => {
    const { session } = get();
    if (!session?.careCode) return;

    try {
      const data = await getHouseholdByCareCode(session.careCode);
      if (data) {
        const { patient, ...household } = data;
        await saveHouseholdData(household);
        await savePatientData(patient);
        set({ household, patient });
        initLanguageFromHousehold(household?.language).catch(() => {});
      }
    } catch {
      // Silently fail — cached data is still usable
    }
  },
}));
