'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { Caregiver, Household, NotificationPreferences, Patient } from '@ourturn/shared';
import { SUPPORTED_LANGUAGES, EU_COUNTRIES } from '@ourturn/shared';
import { useToast } from '@/components/toast';
import { changeLanguage } from '@/i18n';
import PatientInformationSection from './sections/patient-information-section';
import LifeStorySection from './sections/life-story-section';
import DailyScheduleSection from './sections/daily-schedule-section';
import EmergencyContactsSection from './sections/emergency-contacts-section';

const countries = EU_COUNTRIES;

interface SettingsClientProps {
  caregiver: Caregiver;
  household: Household;
  careCode: string;
  patient: Patient | null;
  patientComplexity?: string;
}

export default function SettingsClient({
  caregiver,
  household,
  careCode,
  patient,
  patientComplexity: initialComplexity,
}: SettingsClientProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const supabase = createBrowserClient();
  const router = useRouter();

  const patientId = patient?.id ?? null;

  // Profile settings
  const [name, setName] = useState(caregiver.name);
  const [relationship, setRelationship] = useState(caregiver.relationship || '');
  const [country, setCountry] = useState(household.country || '');
  const [language, setLanguage] = useState(household.language || 'en');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    caregiver.notification_preferences || {
      safety_alerts: true,
      daily_summary: true,
      email_notifications: true,
    }
  );
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);

  // Care Code
  const [showCareCode, setShowCareCode] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Subscription
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');

  // Patient complexity
  const [complexity, setComplexity] = useState(initialComplexity || 'full');
  const [isSavingComplexity, setIsSavingComplexity] = useState(false);

  // Escalation & connectivity
  const [escalationMinutes, setEscalationMinutes] = useState(household.escalation_minutes || 5);
  const [offlineAlertMinutes, setOfflineAlertMinutes] = useState(household.offline_alert_minutes || 30);
  const [isSavingSafety, setIsSavingSafety] = useState(false);
  const [safetySaved, setSafetySaved] = useState(false);

  // Feedback
  const [feedbackCategory, setFeedbackCategory] = useState<'bug_report' | 'feature_suggestion' | 'general_feedback'>('general_feedback');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('caregivers')
        .update({
          name,
          relationship: relationship || null,
        })
        .eq('id', caregiver.id);

      if (error) throw error;

      // Also update country and language on household
      const { error: householdError } = await supabase
        .from('households')
        .update({ country: country || null, language })
        .eq('id', household.id);

      if (householdError) throw householdError;

      // Apply language change to UI
      changeLanguage(language);

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      const { error } = await supabase
        .from('caregivers')
        .update({
          notification_preferences: notificationPrefs,
        })
        .eq('id', caregiver.id);

      if (error) throw error;

      setNotificationsSaved(true);
      setTimeout(() => setNotificationsSaved(false), 3000);
    } catch (err) {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(careCode);
    alert(t('caregiverApp.settings.careCodeCopied'));
  };

  const handleRegenerateCode = async () => {
    if (!confirm(t('caregiverApp.settings.regenerateConfirm'))) {
      return;
    }

    setIsRegenerating(true);
    try {
      // Generate new 6-digit code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();

      const { error } = await supabase
        .from('households')
        .update({ care_code: newCode })
        .eq('id', household.id);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      alert(t('caregiverApp.settings.regenerateFailed'));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError(t('caregiverApp.settings.currentPasswordRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('caregiverApp.settings.passwordsMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(t('caregiverApp.settings.passwordMinLength'));
      return;
    }

    setIsChangingPassword(true);
    try {
      // Verify current password first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No user email found');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        setPasswordError(t('caregiverApp.settings.currentPasswordIncorrect'));
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      setFeedbackError(t('caregiverApp.settings.feedbackEmpty'));
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackError('');
    setFeedbackSubmitted(false);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: feedbackCategory,
          message: feedbackMessage.trim(),
          platform: 'web',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setFeedbackSubmitted(true);
      setFeedbackMessage('');
      setFeedbackCategory('general_feedback');
      setTimeout(() => setFeedbackSubmitted(false), 5000);
    } catch (err) {
      setFeedbackError(t('caregiverApp.settings.feedbackError'));
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Get the filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `ourturn-export-${new Date().toISOString().split('T')[0]}.json`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(t('caregiverApp.settings.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      const response = await fetch('/api/gdpr/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmDelete: 'DELETE' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete account');
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push('/login?deleted=true');
    } catch (err: any) {
      setDeleteError(err.message || t('caregiverApp.settings.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpgradeSubscription = async () => {
    setIsCreatingCheckout(true);
    setSubscriptionError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (err: any) {
      setSubscriptionError(err.message || 'Failed to start checkout');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    setSubscriptionError('');

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      // Redirect to Stripe Billing Portal
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch (err: any) {
      setSubscriptionError(err.message || 'Failed to open billing portal');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleSaveComplexity = async (newComplexity: string) => {
    if (!patientId) return;
    setIsSavingComplexity(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({ app_complexity: newComplexity })
        .eq('id', patientId);
      if (error) throw error;
      setComplexity(newComplexity);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSavingComplexity(false);
    }
  };

  const handleSaveSafetySettings = async () => {
    setIsSavingSafety(true);
    try {
      const { error } = await supabase
        .from('households')
        .update({
          escalation_minutes: escalationMinutes,
          offline_alert_minutes: offlineAlertMinutes,
        })
        .eq('id', household.id);
      if (error) throw error;
      setSafetySaved(true);
      setTimeout(() => setSafetySaved(false), 3000);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSavingSafety(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-3xl space-y-10">
      {/* ── YOUR PROFILE ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          {t('caregiverApp.settings.groupProfile')}
        </h2>
        <div className="space-y-6">
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.profile')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-warm w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.email')}
                </label>
                <input
                  type="email"
                  value={caregiver.email}
                  disabled
                  className="w-full px-4 py-2 border border-surface-border rounded-2xl bg-surface-background dark:bg-surface-elevated text-text-muted cursor-not-allowed"
                />
                <p className="text-xs text-text-muted mt-1">{t('caregiverApp.settings.emailCannotBeChanged')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.relationshipToPatient')}
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="input-warm w-full"
                >
                  <option value="">{t('caregiverApp.settings.selectRelationship')}</option>
                  <option value="spouse">{t('caregiverApp.settings.relationshipSpouse')}</option>
                  <option value="child">{t('caregiverApp.settings.relationshipChild')}</option>
                  <option value="sibling">{t('caregiverApp.settings.relationshipSibling')}</option>
                  <option value="parent">{t('caregiverApp.settings.relationshipParent')}</option>
                  <option value="grandchild">{t('caregiverApp.settings.relationshipGrandchild')}</option>
                  <option value="friend">{t('caregiverApp.settings.relationshipFriend')}</option>
                  <option value="caregiver">{t('caregiverApp.settings.relationshipCaregiver')}</option>
                  <option value="other">{t('caregiverApp.settings.relationshipOther')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.country')}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input-warm w-full"
                >
                  <option value="">{t('caregiverApp.settings.selectCountry')}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.language')}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-warm w-full"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSavingProfile ? t('caregiverApp.settings.savingProfile') : t('caregiverApp.settings.saveProfile')}
                </button>
                {profileSaved && (
                  <span className="text-sm text-status-success">{t('common.saved')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT [PATIENT NAME] ── */}
      {patient && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            {patient.name
              ? t('caregiverApp.settings.groupAboutPatient', { name: patient.name })
              : t('caregiverApp.settings.groupAboutPatientGeneric')}
          </h2>
          <div className="space-y-6">
            <PatientInformationSection patient={patient} />
            <LifeStorySection patient={patient} />
            <DailyScheduleSection patient={patient} />
            <EmergencyContactsSection patient={patient} />

            {/* Patient App Complexity */}
            {patientId && (
              <div className="card-paper p-6">
                <h3 className="text-lg font-display font-bold text-text-primary mb-2">{t('caregiverApp.settings.patientComplexity')}</h3>
                <p className="text-sm text-text-secondary mb-4">{t('caregiverApp.settings.patientComplexityDesc')}</p>
                <div className="space-y-3">
                  {(['full', 'simplified'] as const).map((level) => (
                    <label key={level} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-brand-50 dark:hover:bg-surface-elevated cursor-pointer">
                      <input
                        type="radio"
                        name="complexity"
                        checked={complexity === level}
                        onChange={() => handleSaveComplexity(level)}
                        disabled={isSavingComplexity}
                        className="mt-1 w-5 h-5 text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <span className="font-medium text-text-primary">{t(`caregiverApp.settings.complexity.${level}`)}</span>
                        <p className="text-sm text-text-muted">{t(`caregiverApp.settings.complexity.${level}Desc`)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SHARING & CONNECTION ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          {t('caregiverApp.settings.groupSharing')}
        </h2>
        <div className="space-y-6">
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.careCode')}</h3>
            <p className="text-sm text-text-secondary mb-4">
              {t('caregiverApp.settings.careCodeDesc')}
            </p>
            <div className="flex items-center gap-4">
              {showCareCode ? (
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-mono font-bold text-brand-700 dark:text-brand-300 tracking-widest card-inset px-6 py-3 rounded-2xl">
                    {careCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 border border-surface-border rounded-2xl text-text-secondary hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors"
                  >
                    {t('caregiverApp.settings.copy')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCareCode(true)}
                  className="btn-primary"
                >
                  {t('caregiverApp.settings.showCareCode')}
                </button>
              )}
            </div>
            {showCareCode && (
              <div className="mt-4">
                <button
                  onClick={handleRegenerateCode}
                  disabled={isRegenerating}
                  className="text-sm text-text-muted hover:text-text-secondary underline"
                >
                  {isRegenerating ? t('caregiverApp.settings.regenerating') : t('caregiverApp.settings.regenerateCode')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SAFETY & NOTIFICATIONS ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          {t('caregiverApp.settings.groupSafety')}
        </h2>
        <div className="space-y-6">
          {/* Safety & Escalation Settings */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.safetyEscalation')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.escalationTiming')}
                </label>
                <select
                  value={escalationMinutes}
                  onChange={(e) => setEscalationMinutes(Number(e.target.value))}
                  className="input-warm w-full"
                >
                  <option value={3}>3 {t('caregiverApp.settings.minutes')}</option>
                  <option value={5}>5 {t('caregiverApp.settings.minutes')}</option>
                  <option value={10}>10 {t('caregiverApp.settings.minutes')}</option>
                  <option value={15}>15 {t('caregiverApp.settings.minutes')}</option>
                </select>
                <p className="text-xs text-text-muted mt-1">{t('caregiverApp.settings.escalationTimingDesc')}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.offlineThreshold')}
                </label>
                <select
                  value={offlineAlertMinutes}
                  onChange={(e) => setOfflineAlertMinutes(Number(e.target.value))}
                  className="input-warm w-full"
                >
                  <option value={15}>15 {t('caregiverApp.settings.minutes')}</option>
                  <option value={30}>30 {t('caregiverApp.settings.minutes')}</option>
                  <option value={60}>60 {t('caregiverApp.settings.minutes')}</option>
                  <option value={120}>120 {t('caregiverApp.settings.minutes')}</option>
                </select>
                <p className="text-xs text-text-muted mt-1">{t('caregiverApp.settings.offlineThresholdDesc')}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveSafetySettings}
                  disabled={isSavingSafety}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSavingSafety ? t('caregiverApp.settings.savingPreferences') : t('caregiverApp.settings.savePreferences')}
                </button>
                {safetySaved && (
                  <span className="text-sm text-status-success">{t('common.saved')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.notifications')}</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationPrefs.safety_alerts}
                  onChange={(e) =>
                    setNotificationPrefs((prev) => ({
                      ...prev,
                      safety_alerts: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-medium text-text-primary">{t('caregiverApp.settings.safetyAlertsLabel')}</span>
                  <p className="text-sm text-text-muted">
                    {t('caregiverApp.settings.safetyAlertsDesc')}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationPrefs.daily_summary}
                  onChange={(e) =>
                    setNotificationPrefs((prev) => ({
                      ...prev,
                      daily_summary: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-medium text-text-primary">{t('caregiverApp.settings.dailySummary')}</span>
                  <p className="text-sm text-text-muted">
                    {t('caregiverApp.settings.dailySummaryDesc')}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationPrefs.email_notifications}
                  onChange={(e) =>
                    setNotificationPrefs((prev) => ({
                      ...prev,
                      email_notifications: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-medium text-text-primary">{t('caregiverApp.settings.emailNotificationsLabel')}</span>
                  <p className="text-sm text-text-muted">
                    {t('caregiverApp.settings.emailNotificationsDesc')}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationPrefs.respite_reminders ?? true}
                  onChange={(e) =>
                    setNotificationPrefs((prev) => ({
                      ...prev,
                      respite_reminders: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-medium text-text-primary">{t('caregiverApp.settings.respiteReminders')}</span>
                  <p className="text-sm text-text-muted">
                    {t('caregiverApp.settings.respiteRemindersDesc')}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationPrefs.activity_updates ?? true}
                  onChange={(e) =>
                    setNotificationPrefs((prev) => ({
                      ...prev,
                      activity_updates: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-medium text-text-primary">{t('caregiverApp.settings.activityUpdates')}</span>
                  <p className="text-sm text-text-muted">
                    {t('caregiverApp.settings.activityUpdatesDesc')}
                  </p>
                </div>
              </label>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveNotifications}
                  disabled={isSavingNotifications}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSavingNotifications ? t('caregiverApp.settings.savingPreferences') : t('caregiverApp.settings.savePreferences')}
                </button>
                {notificationsSaved && (
                  <span className="text-sm text-status-success">{t('common.saved')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEEDBACK & SUPPORT ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          {t('caregiverApp.settings.groupFeedback')}
        </h2>
        <div className="space-y-6">
          {/* Send Feedback */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-1">{t('caregiverApp.settings.sendFeedback')}</h3>
            <p className="text-sm text-text-muted mb-4">{t('caregiverApp.settings.sendFeedbackDesc')}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('caregiverApp.settings.feedbackCategory')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['bug_report', 'feature_suggestion', 'general_feedback'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFeedbackCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      feedbackCategory === cat
                        ? 'bg-brand-600 text-white'
                        : 'bg-bg-warm text-text-secondary hover:bg-bg-soft'
                    }`}
                  >
                    {t(`caregiverApp.settings.feedbackCategory${cat === 'bug_report' ? 'Bug' : cat === 'feature_suggestion' ? 'Feature' : 'General'}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('caregiverApp.settings.feedbackMessage')}
              </label>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder={t('caregiverApp.settings.feedbackMessagePlaceholder')}
                className="input-warm w-full h-28 resize-none"
                maxLength={5000}
              />
            </div>

            {feedbackError && (
              <p className="text-sm text-status-danger mb-3">{feedbackError}</p>
            )}
            {feedbackSubmitted && (
              <p className="text-sm text-status-success mb-3">{t('caregiverApp.settings.feedbackSuccess')}</p>
            )}

            <button
              onClick={handleSubmitFeedback}
              disabled={isSubmittingFeedback || !feedbackMessage.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmittingFeedback ? t('caregiverApp.settings.feedbackSubmitting') : t('caregiverApp.settings.feedbackSubmit')}
            </button>
          </div>

          {/* Contact Support */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-1">{t('caregiverApp.settings.feedbackContact')}</h3>
            <p className="text-sm text-text-muted mb-4">{t('caregiverApp.settings.feedbackContactDesc')}</p>
            <a
              href="mailto:support@ourturn.app"
              className="btn-primary inline-block text-center"
            >
              {t('caregiverApp.settings.feedbackContactButton')}
            </a>
          </div>
        </div>
      </section>

      {/* ── ACCOUNT ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          {t('caregiverApp.settings.groupAccount')}
        </h2>
        <div className="space-y-6">
          {/* Subscription */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.subscription')}</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-text-primary">
                  {t('caregiverApp.settings.currentPlanLabel')}{' '}
                  <span className={household.subscription_status === 'plus' ? 'text-brand-600 dark:text-brand-400' : ''}>
                    {household.subscription_status === 'plus' ? t('caregiverApp.settings.ourturnPlus') : t('caregiverApp.settings.free')}
                  </span>
                </p>
                {household.subscription_platform && (
                  <p className="text-sm text-text-muted">
                    {t('caregiverApp.settings.subscribedVia', { platform: household.subscription_platform })}
                  </p>
                )}
              </div>
              {household.subscription_status !== 'plus' && (
                <button
                  onClick={handleUpgradeSubscription}
                  disabled={isCreatingCheckout}
                  className="btn-primary disabled:opacity-50"
                >
                  {isCreatingCheckout ? t('common.loading') : t('caregiverApp.settings.upgradeToPlus')}
                </button>
              )}
            </div>
            {subscriptionError && (
              <p className="text-sm text-status-danger mb-4">{subscriptionError}</p>
            )}
            {household.subscription_status === 'plus' && (
              <button
                onClick={handleManageSubscription}
                disabled={isOpeningPortal}
                className="text-sm text-text-muted hover:text-text-secondary underline disabled:opacity-50"
              >
                {isOpeningPortal ? t('common.loading') : t('caregiverApp.settings.manageSubscription')}
              </button>
            )}
            {household.subscription_status === 'plus' && household.subscription_platform !== 'web' && (
              <p className="text-sm text-text-muted mt-2">
                {household.subscription_platform === 'ios' ? t('caregiverApp.settings.manageViaAppStore') : t('caregiverApp.settings.manageViaPlayStore')}
              </p>
            )}
            {household.subscription_status !== 'plus' && (
              <>
                {/* Plan toggle */}
                <div className="flex items-center justify-center gap-2 mt-4 mb-3">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedPlan === 'monthly'
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-background text-text-secondary hover:bg-brand-50'
                    }`}
                  >
                    {t('subscription.planToggle.monthly')}
                  </button>
                  <button
                    onClick={() => setSelectedPlan('annual')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedPlan === 'annual'
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-background text-text-secondary hover:bg-brand-50'
                    }`}
                  >
                    {t('subscription.planToggle.annual')}
                    <span className="ml-1.5 text-xs opacity-80">
                      {t('subscription.planToggle.saveBadge', { percent: '36' })}
                    </span>
                  </button>
                </div>
                <p className="text-center text-lg font-display font-bold text-text-primary mb-1">
                  {selectedPlan === 'annual' ? '£99.99/year' : '£12.99/month'}
                </p>
                {selectedPlan === 'annual' && (
                  <p className="text-center text-xs text-status-success mb-3">
                    {t('subscription.annualSavings', { percent: '36' })} — £8.33/month
                  </p>
                )}
                <p className="text-center text-xs text-text-muted mb-4">
                  {t('subscription.contextualTrial.noCardRequired')}
                </p>

                <div className="card-inset rounded-2xl p-4">
                  <p className="font-medium text-brand-800 dark:text-brand-200 mb-2">{t('caregiverApp.settings.plusBenefitsTitle')}</p>
                  <ul className="text-sm text-brand-700 dark:text-brand-300 space-y-1">
                    <li>&bull; {t('caregiverApp.settings.plusBenefitTasks')}</li>
                    <li>&bull; {t('caregiverApp.settings.plusBenefitCoach')}</li>
                    <li>&bull; {t('caregiverApp.settings.plusBenefitZones')}</li>
                    <li>&bull; {t('caregiverApp.settings.plusBenefitFamily')}</li>
                    <li>&bull; {t('caregiverApp.settings.plusBenefitReports')}</li>
                    <li>&bull; {t('caregiverApp.settings.plusBenefitSupport')}</li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Change Password */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.changePassword')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.newPassword')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-warm w-full"
                  placeholder={t('caregiverApp.settings.newPasswordPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {t('caregiverApp.settings.confirmNewPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-warm w-full"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-status-danger">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-status-success">{t('caregiverApp.settings.passwordChangedSuccess')}</p>
              )}
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                className="btn-primary disabled:opacity-50"
              >
                {isChangingPassword ? t('caregiverApp.settings.changingPassword') : t('caregiverApp.settings.changePasswordButton')}
              </button>
            </div>
          </div>

          {/* Sign Out */}
          <div className="card-paper p-6">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-surface-border rounded-2xl text-text-secondary hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors"
            >
              {t('caregiverApp.settings.signOut')}
            </button>
          </div>

          {/* Privacy & Data */}
          <div className="card-paper p-6">
            <h3 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.privacy')}</h3>
            <div className="space-y-4">
              <div>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="px-4 py-2 border border-surface-border rounded-2xl text-text-secondary hover:bg-brand-50 dark:hover:bg-surface-elevated transition-colors disabled:opacity-50"
                >
                  {isExporting ? t('caregiverApp.settings.exporting') : t('caregiverApp.settings.exportData')}
                </button>
                <p className="text-sm text-text-muted mt-1">
                  {t('caregiverApp.settings.exportDataDesc')}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <a href="/privacy" target="_blank" className="text-brand-600 dark:text-brand-400 hover:underline">
                  {t('caregiverApp.settings.privacyPolicy')}
                </a>
                <a href="/terms" target="_blank" className="text-brand-600 dark:text-brand-400 hover:underline">
                  {t('caregiverApp.settings.termsOfService')}
                </a>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-status-danger-bg rounded-[20px] border border-status-danger/20 p-6">
            <h3 className="text-lg font-display font-bold text-status-danger mb-4">{t('caregiverApp.settings.dangerZone')}</h3>
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="px-4 py-2 bg-status-danger text-white rounded-2xl hover:bg-status-danger/90 transition-colors"
                >
                  {t('caregiverApp.settings.deleteAccount')}
                </button>
                <p className="text-sm text-status-danger mt-1">
                  {t('caregiverApp.settings.deleteAccountDesc')}
                </p>
                {showDeleteConfirm && (
                  <div className="mt-4 p-4 bg-surface-card dark:bg-surface-elevated rounded-2xl border border-status-danger/30">
                    <p className="text-sm text-status-danger mb-3">
                      {t('caregiverApp.settings.typeDeleteToConfirm')}
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-4 py-2 border border-status-danger/30 rounded-2xl bg-surface-card dark:bg-surface-elevated text-text-primary focus:outline-none focus:ring-2 focus:ring-status-danger mb-3"
                      placeholder={t('caregiverApp.settings.typeDeletePlaceholder')}
                    />
                    {deleteError && (
                      <p className="text-sm text-status-danger mb-3">{deleteError}</p>
                    )}
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                      className="px-4 py-2 bg-status-danger text-white rounded-2xl hover:bg-status-danger/90 disabled:opacity-50 transition-colors"
                    >
                      {isDeleting ? t('caregiverApp.settings.deleting') : t('caregiverApp.settings.confirmDelete')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
