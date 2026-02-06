'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { Caregiver, Household, NotificationPreferences } from '@memoguard/shared';

interface SettingsClientProps {
  caregiver: Caregiver;
  household: Household;
  careCode: string;
}

export default function SettingsClient({
  caregiver,
  household,
  careCode,
}: SettingsClientProps) {
  const { t } = useTranslation();
  const supabase = createBrowserClient();
  const router = useRouter();

  // Profile settings
  const [name, setName] = useState(caregiver.name);
  const [relationship, setRelationship] = useState(caregiver.relationship || '');
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
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');

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

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      // Failed to save profile
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
      // Failed to save notifications
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
      const filename = filenameMatch ? filenameMatch[1] : `memoguard-export-${new Date().toISOString().split('T')[0]}.json`;

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Settings */}
      <div className="card-paper p-6">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.profile')}</h2>
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

      {/* Care Code */}
      <div className="card-paper p-6">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.careCode')}</h2>
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

      {/* Notification Preferences */}
      <div className="card-paper p-6">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.notifications')}</h2>
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

      {/* Subscription */}
      <div className="card-paper p-6">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.subscription')}</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-text-primary">
              {t('caregiverApp.settings.currentPlanLabel')}{' '}
              <span className={household.subscription_status === 'plus' ? 'text-brand-600 dark:text-brand-400' : ''}>
                {household.subscription_status === 'plus' ? t('caregiverApp.settings.memoguardPlus') : t('caregiverApp.settings.free')}
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
          <div className="card-inset rounded-2xl p-4 mt-4">
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
        )}
      </div>

      {/* Change Password */}
      <div className="card-paper p-6">
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.changePassword')}</h2>
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
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">{t('caregiverApp.settings.privacy')}</h2>
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
        <h2 className="text-lg font-display font-bold text-status-danger mb-4">{t('caregiverApp.settings.dangerZone')}</h2>
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
  );
}
