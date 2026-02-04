'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme-toggle';

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

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
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
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
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

        // Create patient
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            household_id: household.id,
            name: data.patientName,
            date_of_birth: data.dateOfBirth || null,
            dementia_type: data.dementiaType || null,
            home_address_formatted: data.homeAddress,
            home_latitude: data.homeLatitude,
            home_longitude: data.homeLongitude,
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
          { time: data.wakeTime, category: 'health', title: 'Morning medication' },
          { time: data.breakfastTime, category: 'nutrition', title: 'Breakfast' },
          { time: data.lunchTime, category: 'nutrition', title: 'Lunch' },
          { time: data.dinnerTime, category: 'nutrition', title: 'Dinner' },
          { time: data.sleepTime, category: 'medication', title: 'Evening medication' },
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
        console.error('Onboarding error:', err);
        // Show detailed error for debugging
        const errorMessage = err?.message || err?.error_description || JSON.stringify(err);
        setError(`Failed to create account: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = () => {
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
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#121212] py-12 px-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">MemoGuard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {stepTitles.map((title, index) => (
              <div
                key={index}
                className={`text-xs font-medium ${
                  index + 1 <= currentStep ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {index + 1 === currentStep && title}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-teal-600 dark:bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            {stepTitles[currentStep - 1]}
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
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
              className="px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
              className="px-6 py-3 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('caregiverApp.onboarding.next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-3 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
            >
              {t('caregiverApp.onboarding.finish')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
