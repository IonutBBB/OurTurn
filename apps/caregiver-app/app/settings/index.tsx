import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@memoguard/supabase';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { caregiver, household, patient, logout, loadCaregiverData } = useAuthStore();

  // Profile editing
  const [editName, setEditName] = useState(caregiver?.name || '');
  const [editRelationship, setEditRelationship] = useState(caregiver?.relationship || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification preferences
  const notifPrefs = caregiver?.notification_preferences || {
    safety_alerts: true,
    daily_summary: true,
    email_notifications: true,
  };
  const [safetyAlerts, setSafetyAlerts] = useState(notifPrefs.safety_alerts ?? true);
  const [dailySummary, setDailySummary] = useState(notifPrefs.daily_summary ?? true);
  const [emailNotifs, setEmailNotifs] = useState(notifPrefs.email_notifications ?? true);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [notifsSaved, setNotifsSaved] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Care code
  const [codeCopied, setCodeCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // GDPR
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Photo gallery
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Delete confirmation modal (cross-platform replacement for Alert.prompt)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Load existing photos from patient biography
  useEffect(() => {
    if (!patient?.id) return;
    (async () => {
      const { data } = await supabase
        .from('patients')
        .select('biography')
        .eq('id', patient.id)
        .single();
      const bio = data?.biography as Record<string, unknown> | null;
      setPhotos((bio?.photos as string[]) || []);
    })();
  }, [patient?.id]);

  const updatePatientPhotos = useCallback(async (newPhotos: string[]) => {
    if (!patient?.id) return;
    const { data } = await supabase
      .from('patients')
      .select('biography')
      .eq('id', patient.id)
      .single();
    const currentBio = (data?.biography as Record<string, unknown>) || {};
    const { error } = await supabase
      .from('patients')
      .update({ biography: { ...currentBio, photos: newPhotos } })
      .eq('id', patient.id);
    if (error) throw error;
  }, [patient?.id]);

  const handleUploadPhotos = useCallback(async () => {
    if (photos.length >= 20) {
      Alert.alert(t('caregiverApp.settings.maxPhotosReached'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 20 - photos.length,
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) return;

    setIsUploadingPhotos(true);
    try {
      const newUrls: string[] = [];

      for (const asset of result.assets) {
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) continue;

        const ext = asset.uri.split('.').pop() || 'jpg';
        const path = `${household!.id}/${crypto.randomUUID()}.${ext}`;

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('patient-photos')
          .upload(path, blob, { contentType: asset.mimeType || 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('patient-photos')
          .getPublicUrl(path);

        newUrls.push(urlData.publicUrl);
      }

      const updatedPhotos = [...photos, ...newUrls];
      await updatePatientPhotos(updatedPhotos);
      setPhotos(updatedPhotos);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert(t('caregiverApp.settings.photoUploadFailed'));
    } finally {
      setIsUploadingPhotos(false);
    }
  }, [photos, household?.id, patient?.id]);

  const handleDeletePhoto = useCallback(async (photoUrl: string) => {
    Alert.alert(
      t('caregiverApp.settings.deletePhoto'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const urlParts = photoUrl.split('/patient-photos/');
              if (urlParts[1]) {
                await supabase.storage.from('patient-photos').remove([urlParts[1]]);
              }
              const updatedPhotos = photos.filter((p) => p !== photoUrl);
              await updatePatientPhotos(updatedPhotos);
              setPhotos(updatedPhotos);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              Alert.alert(t('caregiverApp.settings.photoDeleteFailed'));
            }
          },
        },
      ]
    );
  }, [photos, patient?.id]);

  const handleSaveProfile = useCallback(async () => {
    if (!caregiver?.id) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('caregivers')
        .update({
          name: editName.trim(),
          relationship: editRelationship || null,
        })
        .eq('id', caregiver.id);

      if (error) throw error;

      await loadCaregiverData();
      setProfileSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      Alert.alert(t('common.error'));
    } finally {
      setIsSavingProfile(false);
    }
  }, [caregiver?.id, editName, editRelationship]);

  const handleSaveNotifications = useCallback(async () => {
    if (!caregiver?.id) return;
    setIsSavingNotifs(true);
    try {
      const { error } = await supabase
        .from('caregivers')
        .update({
          notification_preferences: {
            safety_alerts: safetyAlerts,
            daily_summary: dailySummary,
            email_notifications: emailNotifs,
          },
        })
        .eq('id', caregiver.id);

      if (error) throw error;

      setNotifsSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setNotifsSaved(false), 3000);
    } catch (err) {
      Alert.alert(t('common.error'));
    } finally {
      setIsSavingNotifs(false);
    }
  }, [caregiver?.id, safetyAlerts, dailySummary, emailNotifs]);

  const handleCopyCode = useCallback(async () => {
    if (!household?.care_code) return;
    await Clipboard.setStringAsync(household.care_code);
    setCodeCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCodeCopied(false), 3000);
  }, [household?.care_code]);

  const handleRegenerateCode = useCallback(() => {
    Alert.alert(
      t('caregiverApp.settings.regenerateCode'),
      t('caregiverApp.settings.regenerateWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            setIsRegenerating(true);
            try {
              const newCode = Math.floor(100000 + Math.random() * 900000).toString();
              const { error } = await supabase
                .from('households')
                .update({ care_code: newCode })
                .eq('id', household!.id);

              if (error) throw error;
              await loadCaregiverData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              Alert.alert(t('common.error'));
            } finally {
              setIsRegenerating(false);
            }
          },
        },
      ]
    );
  }, [household?.id]);

  const handleChangePassword = useCallback(async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError(t('caregiverApp.auth.passwordsNoMatch'));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t('caregiverApp.auth.passwordTooShort'));
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || t('common.error'));
    } finally {
      setIsChangingPassword(false);
    }
  }, [newPassword, confirmPassword]);

  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    try {
      // Collect all household data for export
      const { data: exportData, error } = await supabase
        .from('households')
        .select(`
          *,
          patients (*),
          caregivers (*),
          care_plan_tasks (*),
          daily_checkins (*),
          journal_entries (*)
        `)
        .eq('id', household!.id)
        .single();

      if (error) throw error;

      // On mobile we can't download files, so share or show confirmation
      await Clipboard.setStringAsync(JSON.stringify(exportData, null, 2));
      Alert.alert(
        t('caregiverApp.settings.exportData'),
        t('caregiverApp.settings.exportClipboard'),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert(t('common.error'));
    } finally {
      setIsExporting(false);
    }
  }, [household?.id]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t('caregiverApp.settings.deleteAccount'),
      t('caregiverApp.settings.deleteWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('caregiverApp.settings.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            setDeleteConfirmText('');
            setShowDeleteModal(true);
          },
        },
      ]
    );
  }, []);

  const executeAccountDeletion = useCallback(async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('households')
        .delete()
        .eq('id', household!.id);
      if (error) throw error;
      await logout();
      router.replace('/(auth)/login');
    } catch (err) {
      Alert.alert(t('common.error'));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirmText, household?.id]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      t('caregiverApp.settings.signOut'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('caregiverApp.settings.signOut'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('caregiverApp.settings.title')}</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.profile')}</Text>
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('caregiverApp.onboarding.yourName')}</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('caregiverApp.auth.email')}</Text>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledText}>{caregiver?.email || '—'}</Text>
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('caregiverApp.settings.relationship')}</Text>
              <TextInput
                style={styles.textInput}
                value={editRelationship}
                onChangeText={setEditRelationship}
                placeholder={t('caregiverApp.onboarding.relationshipPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.saveRow}>
              <TouchableOpacity
                style={[styles.saveButton, isSavingProfile && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
                activeOpacity={0.7}
              >
                {isSavingProfile ? (
                  <ActivityIndicator color={COLORS.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('caregiverApp.settings.saveProfile')}</Text>
                )}
              </TouchableOpacity>
              {profileSaved && (
                <Text style={styles.savedText}>{t('caregiverApp.settings.saved')}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.notifications')}</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.rowLabel}>{t('caregiverApp.settings.safetyAlerts')}</Text>
              </View>
              <Switch
                value={safetyAlerts}
                onValueChange={setSafetyAlerts}
                trackColor={{ false: COLORS.border, true: COLORS.brand400 }}
                thumbColor={safetyAlerts ? COLORS.brand600 : COLORS.textMuted}
              />
            </View>
            <View style={[styles.switchRow, styles.rowBorder]}>
              <View style={styles.switchLabel}>
                <Text style={styles.rowLabel}>{t('caregiverApp.settings.dailySummary')}</Text>
              </View>
              <Switch
                value={dailySummary}
                onValueChange={setDailySummary}
                trackColor={{ false: COLORS.border, true: COLORS.brand400 }}
                thumbColor={dailySummary ? COLORS.brand600 : COLORS.textMuted}
              />
            </View>
            <View style={[styles.switchRow, styles.rowBorder]}>
              <View style={styles.switchLabel}>
                <Text style={styles.rowLabel}>{t('caregiverApp.settings.emailNotifications')}</Text>
              </View>
              <Switch
                value={emailNotifs}
                onValueChange={setEmailNotifs}
                trackColor={{ false: COLORS.border, true: COLORS.brand400 }}
                thumbColor={emailNotifs ? COLORS.brand600 : COLORS.textMuted}
              />
            </View>
            <View style={styles.saveRow}>
              <TouchableOpacity
                style={[styles.saveButton, isSavingNotifs && styles.saveButtonDisabled]}
                onPress={handleSaveNotifications}
                disabled={isSavingNotifs}
                activeOpacity={0.7}
              >
                {isSavingNotifs ? (
                  <ActivityIndicator color={COLORS.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                )}
              </TouchableOpacity>
              {notifsSaved && (
                <Text style={styles.savedText}>{t('caregiverApp.settings.saved')}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Care Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.family.careCode')}</Text>
          <View style={styles.card}>
            <View style={styles.codeContainer}>
              <Text style={styles.careCode}>
                {household?.care_code
                  ? `${household.care_code.slice(0, 3)} ${household.care_code.slice(3)}`
                  : '--- ---'}
              </Text>
            </View>
            <Text style={styles.codeHelp}>{t('caregiverApp.family.careCodeHelp')}</Text>
            <View style={styles.codeActions}>
              <TouchableOpacity
                style={styles.codeButton}
                onPress={handleCopyCode}
                activeOpacity={0.7}
              >
                <Text style={styles.codeButtonText}>
                  {codeCopied ? t('caregiverApp.settings.codeCopied') : t('caregiverApp.settings.copyCode')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.codeButton, styles.codeButtonDanger]}
                onPress={handleRegenerateCode}
                disabled={isRegenerating}
                activeOpacity={0.7}
              >
                {isRegenerating ? (
                  <ActivityIndicator color={COLORS.danger} size="small" />
                ) : (
                  <Text style={[styles.codeButtonText, styles.codeButtonTextDanger]}>
                    {t('caregiverApp.settings.regenerateCode')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Photo Gallery Section */}
        {patient?.id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('caregiverApp.settings.photoGallery')}</Text>
            <View style={styles.card}>
              <Text style={styles.photoDesc}>{t('caregiverApp.settings.photoGalleryDesc')}</Text>

              {photos.length > 0 ? (
                <>
                  <Text style={styles.photoCount}>
                    {t('caregiverApp.settings.photosCount', { count: photos.length })}
                  </Text>
                  <View style={styles.photoGrid}>
                    {photos.map((url) => (
                      <TouchableOpacity
                        key={url}
                        style={styles.photoThumb}
                        onLongPress={() => handleDeletePhoto(url)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: url }} style={styles.photoImage} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.photoHintText}>{t('caregiverApp.settings.photoUploadHint')}</Text>
                </>
              ) : (
                <Text style={styles.noPhotosText}>{t('caregiverApp.settings.noPhotosYet')}</Text>
              )}

              <TouchableOpacity
                style={[styles.saveButton, (isUploadingPhotos || photos.length >= 20) && styles.saveButtonDisabled]}
                onPress={handleUploadPhotos}
                disabled={isUploadingPhotos || photos.length >= 20}
                activeOpacity={0.7}
              >
                {isUploadingPhotos ? (
                  <ActivityIndicator color={COLORS.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {photos.length >= 20
                      ? t('caregiverApp.settings.maxPhotosReached')
                      : t('caregiverApp.settings.uploadPhotos')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Change Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.changePassword')}</Text>
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('caregiverApp.settings.newPassword')}</Text>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('caregiverApp.settings.passwordPlaceholder')}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('caregiverApp.settings.confirmNewPassword')}</Text>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            {passwordSuccess && (
              <Text style={styles.successText}>{t('caregiverApp.settings.passwordChanged')}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!newPassword || !confirmPassword || isChangingPassword) && styles.saveButtonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={!newPassword || !confirmPassword || isChangingPassword}
              activeOpacity={0.7}
            >
              {isChangingPassword ? (
                <ActivityIndicator color={COLORS.textInverse} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>{t('caregiverApp.settings.changePassword')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.subscription')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.subscription')}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {household?.subscription_status === 'plus'
                    ? t('subscription.plus')
                    : t('subscription.free')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.privacy')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleExportData}
              disabled={isExporting}
              activeOpacity={0.7}
            >
              {isExporting ? (
                <ActivityIndicator color={COLORS.brand600} size="small" />
              ) : (
                <Text style={styles.rowLabel}>{t('caregiverApp.settings.exportData')}</Text>
              )}
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <Text style={styles.exportNote}>{t('caregiverApp.settings.exportNote')}</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('caregiverApp.settings.about')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.version')}</Text>
              <Text style={styles.rowValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>{t('caregiverApp.settings.notMedicalDevice')}</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>{t('caregiverApp.settings.signOut')}</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>{t('caregiverApp.settings.dangerZone')}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            {isDeleting ? (
              <ActivityIndicator color={COLORS.danger} size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>{t('caregiverApp.settings.deleteAccount')}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.dangerNote}>{t('caregiverApp.settings.deleteWarning')}</Text>
        </View>
      </ScrollView>

      {/* Delete confirmation modal (cross-platform) */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('caregiverApp.settings.dangerZone')}</Text>
            <Text style={styles.modalDesc}>{t('caregiverApp.settings.deleteConfirm')}</Text>
            <TextInput
              style={styles.modalInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteButton, deleteConfirmText !== 'DELETE' && { opacity: 0.4 }]}
                onPress={executeAccountDeletion}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                <Text style={styles.modalDeleteText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: COLORS.brand600,
    fontFamily: FONTS.bodyMedium,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    padding: 20,
    ...SHADOWS.sm,
  },

  // Profile fields
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.brand200,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  disabledText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  savedText: {
    fontSize: 14,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.success,
  },

  // Rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    marginTop: 8,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  rowArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Switches
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },

  // Badge
  badge: {
    backgroundColor: COLORS.brand100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand700,
  },

  // Care code
  codeContainer: {
    backgroundColor: COLORS.brand50,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.brand200,
  },
  careCode: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.brand700,
    letterSpacing: 4,
  },
  codeHelp: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  codeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.brand600,
    alignItems: 'center',
  },
  codeButtonDanger: {
    borderColor: COLORS.danger,
  },
  codeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand600,
  },
  codeButtonTextDanger: {
    color: COLORS.danger,
  },

  // Photo gallery
  photoDesc: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  photoCount: {
    fontSize: 13,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoHintText: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  noPhotosText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 12,
  },

  // Password
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.danger,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.success,
    marginBottom: 12,
  },

  // Export
  exportNote: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 8,
  },

  // Logout
  logoutButton: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },

  // Danger zone
  dangerSection: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.danger,
    marginBottom: 40,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.danger,
    marginBottom: 12,
  },
  deleteButton: {
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.danger,
  },
  dangerNote: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.danger,
    opacity: 0.8,
  },

  // Delete confirmation modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.danger,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
});
