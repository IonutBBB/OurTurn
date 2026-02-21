'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { geocodeAddress } from '@ourturn/shared/utils';
import { OrganicBlobs } from '@/components/organic-blobs';

// Step components
import { Step1AboutYou } from './steps/step1-about-you';
import { Step2AboutLovedOne } from './steps/step2-about-loved-one';
import { Step3LifeStory } from './steps/step3-life-story';
import { Step4DailyRoutine } from './steps/step4-daily-routine';
import { Step5Safety } from './steps/step5-safety';
import { Step6CareCode } from './steps/step6-care-code';

export interface OnboardingData {
  // Step 1: About You
  caregiverName: string;
  relationship: string;
  country: string;

  // Step 2: About Loved One
  patientName: string;
  dateOfBirth: string;
  dementiaType: string;
  homeAddress: string;
  homeLatitude: number | null;
  homeLongitude: number | null;

  // Step 3: Life Story
  childhoodLocation: string;
  career: string;
  hobbies: string;
  favoriteMusic: string;
  favoriteFoods: string;
  importantPeople: string;
  keyEvents: string;

  // Step 4: Daily Routine
  wakeTime: string;
  sleepTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  typicalDay: string;

  // Step 5: Safety
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;

  // Step 6: Generated
  careCode: string;
  householdId: string;
}

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createBrowserClient();

  const STORAGE_KEY = 'ourturn_onboarding';

  // Restore from sessionStorage on mount
  const getInitialData = (): OnboardingData => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultData, ...parsed.data };
        }
      } catch {
        // Ignore parse errors
      }
    }
    return defaultData;
  };

  const getInitialStep = (): number => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.step || 1;
        }
      } catch {
        // Ignore parse errors
      }
    }
    return 1;
  };

  const defaultData: OnboardingData = {
    caregiverName: '',
    relationship: '',
    country: '',
    patientName: '',
    dateOfBirth: '',
    dementiaType: '',
    homeAddress: '',
    homeLatitude: null,
    homeLongitude: null,
    childhoodLocation: '',
    career: '',
    hobbies: '',
    favoriteMusic: '',
    favoriteFoods: '',
    importantPeople: '',
    keyEvents: '',
    wakeTime: '07:00',
    sleepTime: '22:00',
    breakfastTime: '08:00',
    lunchTime: '12:00',
    dinnerTime: '18:00',
    typicalDay: '',
    emergencyContacts: [],
    careCode: '',
    householdId: '',
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>(getInitialData);

  // Save to sessionStorage whenever data or step changes (sensitive data cleared when tab closes)
  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data: next, step: currentStep }));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const handleNext = async () => {
    setError(null);

    // If we're on step 5, create the household and patient
    if (currentStep === 5) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Generate care code
        const careCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create household
        const { data: household, error: householdError } = await supabase
          .from('households')
          .insert({
            care_code: careCode,
            country: data.country,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
          .select()
          .single();

        if (householdError) throw householdError;

        // Geocode home address (non-blocking — null on failure)
        const coords = await geocodeAddress(
          data.homeAddress,
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        );

        // Create patient
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            household_id: household.id,
            name: data.patientName,
            date_of_birth: data.dateOfBirth || null,
            dementia_type: data.dementiaType || null,
            home_address_formatted: data.homeAddress,
            home_latitude: coords?.lat ?? null,
            home_longitude: coords?.lng ?? null,
            wake_time: data.wakeTime,
            sleep_time: data.sleepTime,
            biography: {
              childhood_location: data.childhoodLocation,
              career: data.career,
              hobbies: data.hobbies,
              favorite_music: data.favoriteMusic,
              favorite_foods: data.favoriteFoods,
              important_people: data.importantPeople,
              key_events: data.keyEvents,
            },
            emergency_number: data.emergencyContacts[0]?.phone || null,
            emergency_contacts: data.emergencyContacts,
          });

        if (patientError) throw patientError;

        // Update caregiver with household_id
        const { error: caregiverError } = await supabase
          .from('caregivers')
          .upsert({
            id: user.id,
            household_id: household.id,
            name: data.caregiverName,
            email: user.email,
            relationship: data.relationship,
            role: 'primary',
          });

        if (caregiverError) throw caregiverError;

        // Create default tasks based on routine
        const defaultTasks = [
          { time: data.wakeTime, category: 'health', title: t('caregiverApp.onboarding.defaultTasks.morningMedication') },
          { time: data.breakfastTime, category: 'nutrition', title: t('caregiverApp.onboarding.defaultTasks.breakfast') },
          { time: data.lunchTime, category: 'nutrition', title: t('caregiverApp.onboarding.defaultTasks.lunch') },
          { time: data.dinnerTime, category: 'nutrition', title: t('caregiverApp.onboarding.defaultTasks.dinner') },
          { time: data.sleepTime, category: 'medication', title: t('caregiverApp.onboarding.defaultTasks.eveningMedication') },
        ];

        for (const task of defaultTasks) {
          await supabase.from('care_plan_tasks').insert({
            household_id: household.id,
            category: task.category,
            title: task.title,
            time: task.time,
            recurrence: 'daily',
            active: true,
            created_by: user.id,
          });
        }

        updateData({
          careCode,
          householdId: household.id,
        });

        setCurrentStep(6);
      } catch (err: any) {
        const errorMessage = err?.message || err?.error_description || JSON.stringify(err);
        setError(t('caregiverApp.onboarding.createAccountFailed', { error: errorMessage }));
      } finally {
        setLoading(false);
      }
      return;
    }

    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, TOTAL_STEPS);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step: next }));
      } catch { /* ignore */ }
      return next;
    });
  };

  const handleBack = () => {
    setCurrentStep((prev) => {
      const next = Math.max(prev - 1, 1);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step: next }));
      } catch { /* ignore */ }
      return next;
    });
  };

  const handleFinish = () => {
    // Clear saved onboarding data
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    router.push('/dashboard');
    router.refresh();
  };

  const stepTitles = [
    t('caregiverApp.onboarding.step1Title'),
    t('caregiverApp.onboarding.step2Title'),
    t('caregiverApp.onboarding.step3Title'),
    t('caregiverApp.onboarding.step4Title'),
    t('caregiverApp.onboarding.step5Title'),
    t('caregiverApp.onboarding.step6Title'),
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1AboutYou data={data} updateData={updateData} />;
      case 2:
        return <Step2AboutLovedOne data={data} updateData={updateData} />;
      case 3:
        return <Step3LifeStory data={data} updateData={updateData} />;
      case 4:
        return <Step4DailyRoutine data={data} updateData={updateData} />;
      case 5:
        return <Step5Safety data={data} updateData={updateData} />;
      case 6:
        return <Step6CareCode data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-surface-background py-12 px-4 overflow-hidden">
      <OrganicBlobs variant="subtle" />

      <div className="max-w-2xl mx-auto relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm mx-auto mb-4">
            <span className="text-white text-lg font-bold font-display">M</span>
          </div>
          <p className="text-text-muted">
            {t('caregiverApp.onboarding.stepOf', { current: currentStep, total: TOTAL_STEPS })}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {stepTitles.map((title, index) => (
              <div
                key={index}
                className={`text-xs font-medium ${
                  index + 1 <= currentStep ? 'text-brand-600' : 'text-text-muted'
                }`}
              >
                {index + 1 === currentStep && title}
              </div>
            ))}
          </div>
          <div className="w-full bg-surface-border rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="card-paper p-8 mb-6">
          <h2 className="heading-display text-xl mb-6">
            {stepTitles[currentStep - 1]}
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-status-danger-bg border border-status-danger/20 rounded-xl text-status-danger text-sm" role="alert">
              {error}
            </div>
          )}

          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          {currentStep > 1 && currentStep < 6 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary px-6 py-3"
            >
              {t('caregiverApp.onboarding.back')}
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="btn-primary px-6 py-3 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('caregiverApp.onboarding.next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="btn-primary px-6 py-3"
            >
              {t('caregiverApp.onboarding.finish')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
