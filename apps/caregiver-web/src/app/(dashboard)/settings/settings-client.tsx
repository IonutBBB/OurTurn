'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
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
      console.error('Failed to save profile:', err);
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
      console.error('Failed to save notifications:', err);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(careCode);
    alert('Care Code copied to clipboard!');
  };

  const handleRegenerateCode = async () => {
    if (!confirm('Are you sure you want to regenerate the Care Code? The old code will no longer work.')) {
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
      console.error('Failed to regenerate code:', err);
      alert('Failed to regenerate code. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
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
      console.error('Failed to export data:', err);
      alert('Failed to export data. Please try again.');
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
      console.error('Failed to delete account:', err);
      setDeleteError(err.message || 'Failed to delete account. Please contact support.');
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
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-surface-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              value={caregiver.email}
              disabled
              className="w-full px-4 py-2 border border-surface-border rounded-lg bg-surface-raised text-text-muted cursor-not-allowed"
            />
            <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Relationship to Patient
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-4 py-2 border border-surface-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse/Partner</option>
              <option value="child">Son/Daughter</option>
              <option value="sibling">Sibling</option>
              <option value="parent">Parent</option>
              <option value="grandchild">Grandchild</option>
              <option value="friend">Friend</option>
              <option value="caregiver">Professional Caregiver</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
            {profileSaved && (
              <span className="text-sm text-success-600">Saved!</span>
            )}
          </div>
        </div>
      </div>

      {/* Care Code */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Care Code</h2>
        <p className="text-sm text-text-secondary mb-4">
          Share this code with family members to invite them to your care circle, or use it to
          connect the patient app.
        </p>
        <div className="flex items-center gap-4">
          {showCareCode ? (
            <div className="flex items-center gap-4">
              <span className="text-3xl font-mono font-bold text-brand-700 tracking-widest bg-brand-50 px-6 py-3 rounded-lg">
                {careCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 border border-surface-border rounded-lg hover:bg-surface-raised transition-colors"
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCareCode(true)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Show Care Code
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
              {isRegenerating ? 'Regenerating...' : 'Regenerate Code (invalidates old code)'}
            </button>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Notifications</h2>
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
              <span className="font-medium text-text-primary">Safety Alerts</span>
              <p className="text-sm text-text-muted">
                Receive immediate alerts when your loved one leaves a safe zone or taps &quot;Take Me Home&quot;
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
              <span className="font-medium text-text-primary">Daily Summary</span>
              <p className="text-sm text-text-muted">
                Receive a daily summary of completed tasks and check-in status
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
              <span className="font-medium text-text-primary">Email Notifications</span>
              <p className="text-sm text-text-muted">
                Receive alerts and summaries via email in addition to push notifications
              </p>
            </div>
          </label>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveNotifications}
              disabled={isSavingNotifications}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isSavingNotifications ? 'Saving...' : 'Save Preferences'}
            </button>
            {notificationsSaved && (
              <span className="text-sm text-success-600">Saved!</span>
            )}
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Subscription</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-text-primary">
              Current Plan:{' '}
              <span className={household.subscription_status === 'plus' ? 'text-brand-600' : ''}>
                {household.subscription_status === 'plus' ? 'MemoGuard Plus' : 'Free'}
              </span>
            </p>
            {household.subscription_platform && (
              <p className="text-sm text-text-muted">
                Subscribed via {household.subscription_platform}
              </p>
            )}
          </div>
          {household.subscription_status !== 'plus' && (
            <button
              onClick={handleUpgradeSubscription}
              disabled={isCreatingCheckout}
              className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isCreatingCheckout ? 'Loading...' : 'Upgrade to Plus'}
            </button>
          )}
        </div>
        {subscriptionError && (
          <p className="text-sm text-red-600 mb-4">{subscriptionError}</p>
        )}
        {household.subscription_status === 'plus' && (
          <button
            onClick={handleManageSubscription}
            disabled={isOpeningPortal}
            className="text-sm text-text-muted hover:text-text-secondary underline disabled:opacity-50"
          >
            {isOpeningPortal ? 'Opening...' : 'Manage subscription'}
          </button>
        )}
        {household.subscription_status === 'plus' && household.subscription_platform !== 'web' && (
          <p className="text-sm text-text-muted mt-2">
            To manage your subscription, please use the {household.subscription_platform === 'ios' ? 'App Store' : 'Google Play Store'}.
          </p>
        )}
        {household.subscription_status !== 'plus' && (
          <div className="bg-brand-50 rounded-lg p-4 mt-4">
            <p className="font-medium text-brand-800 mb-2">MemoGuard Plus Benefits:</p>
            <ul className="text-sm text-brand-700 space-y-1">
              <li>• Unlimited care plan tasks</li>
              <li>• AI Care Coach for personalized guidance</li>
              <li>• Multiple safe zones with alerts</li>
              <li>• Up to 5 family caregivers</li>
              <li>• Doctor visit report generator</li>
              <li>• Priority support</li>
            </ul>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-surface-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-surface-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-success-600">Password changed successfully!</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !newPassword || !confirmPassword}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 border border-surface-border rounded-lg hover:bg-surface-raised transition-colors text-text-primary"
        >
          Sign Out
        </button>
      </div>

      {/* Privacy & Data */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Privacy & Data</h2>
        <div className="space-y-4">
          <div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="px-4 py-2 border border-surface-border rounded-lg text-text-primary hover:bg-surface-raised transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export My Data'}
            </button>
            <p className="text-sm text-text-muted mt-1">
              Download a copy of all your data in JSON format (GDPR right to portability)
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <a href="/privacy" target="_blank" className="text-brand-600 hover:underline">
              Privacy Policy
            </a>
            <a href="/terms" target="_blank" className="text-brand-600 hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div>
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
            <p className="text-sm text-red-600 mt-1">
              Permanently delete your account and all data. This cannot be undone.
            </p>
            {showDeleteConfirm && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-red-300">
                <p className="text-sm text-red-800 mb-3">
                  Type &quot;DELETE&quot; to confirm account deletion:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-red-300 rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                  placeholder="Type DELETE"
                />
                {deleteError && (
                  <p className="text-sm text-red-600 mb-3">{deleteError}</p>
                )}
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
