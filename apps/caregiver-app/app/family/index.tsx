import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@ourturn/supabase';
import { hasReachedCaregiverLimit } from '@ourturn/shared/utils/subscription';
import type { Caregiver, CareJournalEntry, JournalEntryType } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS } from '../../src/theme';
import { ContextualTrialPrompt } from '../../src/components/contextual-trial-prompt';

export default function FamilyScreen() {
  const { t } = useTranslation();
  const { caregiver, household } = useAuthStore();
  const styles = useStyles();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'family' | 'journal'>('family');
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [journalEntries, setJournalEntries] = useState<(CareJournalEntry & { author_name?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCareCode, setShowCareCode] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Journal entry form
  const [newContent, setNewContent] = useState('');
  const [newEntryType, setNewEntryType] = useState<JournalEntryType>('observation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit/delete state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editEntryType, setEditEntryType] = useState<JournalEntryType>('observation');

  const ENTRY_TYPE_CONFIG: Record<JournalEntryType, { emoji: string; label: string }> = {
    observation: { emoji: '\u{1F440}', label: t('caregiverApp.family.observation') },
    note: { emoji: '\u{1F4DD}', label: t('caregiverApp.family.note') },
    milestone: { emoji: '\u2B50', label: t('caregiverApp.family.milestone') },
    crisis: { emoji: '\u{1F6A8}', label: t('caregiverApp.family.crisis') },
  };

  const caregiverLimitReached = household
    ? hasReachedCaregiverLimit(
        { subscription_status: (household.subscription_status || 'free') as 'free' | 'plus' | 'cancelled' },
        caregivers.length
      )
    : false;

  const loadData = async () => {
    if (!household?.id) return;
    setLoadError(false);

    try {
      // Get all caregivers
      const { data: caregiverData } = await supabase
        .from('caregivers')
        .select('*')
        .eq('household_id', household.id)
        .order('role')
        .order('created_at');

      setCaregivers(caregiverData || []);

      // Get journal entries
      const { data: journalData } = await supabase
        .from('care_journal_entries')
        .select('*, caregivers!author_id(name)')
        .eq('household_id', household.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const transformed = (journalData || []).map((entry) => ({
        ...entry,
        author_name: (entry.caregivers as { name: string } | null)?.name || t('common.unknown'),
      }));

      setJournalEntries(transformed);
    } catch (err) {
      if (__DEV__) console.error('Failed to load family data:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [household?.id]);

  // Real-time subscription for journal entries (A7)
  useEffect(() => {
    if (!household?.id) return;

    const channel = supabase
      .channel(`journal-${household.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'care_journal_entries',
          filter: `household_id=eq.${household.id}`,
        },
        async (payload) => {
          const newRecord = payload.new as Record<string, unknown>;
          const oldRecord = payload.old as Record<string, unknown>;

          if (payload.eventType === 'INSERT') {
            // Fetch author name for the new entry
            const { data: authorData } = await supabase
              .from('caregivers')
              .select('name')
              .eq('id', newRecord.author_id as string)
              .single();

            const newEntry = {
              ...(newRecord as unknown as CareJournalEntry),
              author_name: authorData?.name || t('common.unknown'),
            };

            setJournalEntries((prev) => {
              // Avoid duplicates
              if (prev.some((e) => e.id === newEntry.id)) return prev;
              return [newEntry, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setJournalEntries((prev) =>
              prev.map((e) =>
                e.id === (newRecord.id as string)
                  ? { ...e, ...(newRecord as unknown as CareJournalEntry) }
                  : e
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setJournalEntries((prev) =>
              prev.filter((e) => e.id !== (oldRecord.id as string))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [household?.id, t]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleShareCareCode = async () => {
    if (!household?.care_code) return;

    try {
      await Share.share({
        message: t('caregiverApp.family.shareCareCodeMessage', { code: household.care_code }),
      });
    } catch (err) {
      if (__DEV__) console.error('Failed to share:', err);
    }
  };

  const handleCopyCareCode = async () => {
    if (!household?.care_code) return;

    await Clipboard.setStringAsync(household.care_code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t('caregiverApp.family.copied'), t('caregiverApp.family.codeCopiedToClipboard'));
  };

  const handleSubmitEntry = async () => {
    if (!household?.id || !caregiver?.id || !newContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { data, error } = await supabase
        .from('care_journal_entries')
        .insert({
          household_id: household.id,
          author_id: caregiver.id,
          content: newContent.trim(),
          entry_type: newEntryType,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to list with author name
      const newEntry = {
        ...data,
        author_name: caregiver.name,
      };
      setJournalEntries((prev) => [newEntry, ...prev]);

      setNewContent('');
      setNewEntryType('observation');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      if (__DEV__) console.error('Failed to add entry:', err);
      Alert.alert(t('common.errorTitle'), t('caregiverApp.family.failedToAddEntry'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (entry: CareJournalEntry & { author_name?: string }) => {
    setEditingEntryId(entry.id);
    setEditContent(entry.content);
    setEditEntryType(entry.entry_type as JournalEntryType);
  };

  const cancelEditing = () => {
    setEditingEntryId(null);
    setEditContent('');
    setEditEntryType('observation');
  };

  const handleEditEntry = async () => {
    if (!editingEntryId || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('care_journal_entries')
        .update({ content: editContent.trim(), entry_type: editEntryType })
        .eq('id', editingEntryId);

      if (error) throw error;

      setJournalEntries((prev) =>
        prev.map((e) =>
          e.id === editingEntryId
            ? { ...e, content: editContent.trim(), entry_type: editEntryType }
            : e
        )
      );
      cancelEditing();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      if (__DEV__) console.error('Failed to update entry:', err);
      Alert.alert(t('common.errorTitle'), t('common.error'));
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      t('caregiverApp.family.deleteConfirmTitle'),
      t('caregiverApp.family.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('care_journal_entries')
                .delete()
                .eq('id', entryId);

              if (error) throw error;

              setJournalEntries((prev) => prev.filter((e) => e.id !== entryId));
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              if (__DEV__) console.error('Failed to delete entry:', err);
              Alert.alert(t('common.errorTitle'), t('common.error'));
            }
          },
        },
      ]
    );
  };

  const showEntryActions = (entry: CareJournalEntry & { author_name?: string }) => {
    Alert.alert(
      '',
      '',
      [
        {
          text: t('common.edit'),
          onPress: () => startEditing(entry),
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => handleDeleteEntry(entry.id),
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t('caregiverApp.family.yesterday');
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>&#8249; {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('caregiverApp.family.familyCircle')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'family' && styles.tabActive]}
          onPress={() => setActiveTab('family')}
        >
          <Text style={[styles.tabText, activeTab === 'family' && styles.tabTextActive]}>
            {t('caregiverApp.family.family')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'journal' && styles.tabActive]}
          onPress={() => setActiveTab('journal')}
        >
          <Text style={[styles.tabText, activeTab === 'journal' && styles.tabTextActive]}>
            {t('caregiverApp.family.careJournal')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Error Banner */}
        {loadError && (
          <TouchableOpacity style={styles.errorBanner} onPress={loadData} activeOpacity={0.7}>
            <Text style={styles.errorBannerText}>{t('common.error')}</Text>
            <Text style={styles.errorBannerRetry}>{t('common.tryAgain')}</Text>
          </TouchableOpacity>
        )}

        {/* Family Tab */}
        {activeTab === 'family' && (
          <View style={styles.tabContent}>
            {/* Caregiver Limit — Contextual Trial */}
            {caregiverLimitReached && (
              <ContextualTrialPrompt feature="caregiver" />
            )}

            {/* Care Code Banner */}
            <View style={styles.careCodeBanner}>
              <Text style={styles.careCodeTitle}>{t('caregiverApp.family.inviteFamilyMembers')}</Text>
              <Text style={styles.careCodeDesc}>
                {t('caregiverApp.family.shareCareCodeDesc')}
              </Text>

              {showCareCode ? (
                <View style={styles.careCodeDisplay}>
                  <Text style={styles.careCodeText}>{household?.care_code}</Text>
                  <View style={styles.careCodeActions}>
                    <TouchableOpacity style={styles.codeAction} onPress={handleCopyCareCode}>
                      <Text style={styles.codeActionText}>{t('caregiverApp.family.copy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.codeAction} onPress={handleShareCareCode}>
                      <Text style={styles.codeActionText}>{t('caregiverApp.family.share')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.showCodeButton}
                  onPress={() => setShowCareCode(true)}
                >
                  <Text style={styles.showCodeButtonText}>{t('caregiverApp.family.showCareCode')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Members List */}
            <View style={styles.membersCard}>
              <Text style={styles.membersTitle}>
                {t('caregiverApp.family.familyMembers', { count: caregivers.length })}
              </Text>
              {caregivers.map((cg) => (
                <View key={cg.id} style={styles.memberItem}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {cg.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{cg.name}</Text>
                      {cg.id === caregiver?.id && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>{t('caregiverApp.family.you')}</Text>
                        </View>
                      )}
                      {cg.role === 'primary' && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>{t('caregiverApp.family.primary')}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.memberDetailsRow}>
                      <Text style={styles.memberDetails}>
                        {cg.relationship || t('caregiverApp.family.familyMember')}
                      </Text>
                      {/* Permission icons (A8) */}
                      <View style={styles.permissionIcons}>
                        {cg.permissions?.can_edit_plan && (
                          <Text style={styles.permissionIcon} accessibilityLabel={t('caregiverApp.family.canEditPlan')}>{'\u{1F4DD}'}</Text>
                        )}
                        {cg.permissions?.receives_alerts && (
                          <Text style={styles.permissionIcon} accessibilityLabel={t('caregiverApp.family.receivesAlerts')}>{'\u{1F514}'}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <View style={styles.tabContent}>
            {/* New Entry Form */}
            <View style={styles.newEntryCard}>
              <TextInput
                style={styles.newEntryInput}
                value={newContent}
                onChangeText={setNewContent}
                placeholder={t('caregiverApp.family.entryPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <View style={styles.entryTypeRow}>
                {(Object.keys(ENTRY_TYPE_CONFIG) as JournalEntryType[]).map((type) => {
                  const config = ENTRY_TYPE_CONFIG[type];
                  const isSelected = newEntryType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.entryTypeButton, isSelected && styles.entryTypeButtonActive]}
                      onPress={() => setNewEntryType(type)}
                    >
                      <Text style={styles.entryTypeEmoji}>{config.emoji}</Text>
                      <Text
                        style={[styles.entryTypeLabel, isSelected && styles.entryTypeLabelActive]}
                      >
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!newContent.trim() || isSubmitting) && styles.postButtonDisabled,
                ]}
                onPress={handleSubmitEntry}
                disabled={!newContent.trim() || isSubmitting}
              >
                <Text style={styles.postButtonText}>
                  {isSubmitting ? t('caregiverApp.family.posting') : t('caregiverApp.family.post')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Entries List */}
            {journalEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('caregiverApp.family.noJournalEntries')}</Text>
                <Text style={styles.emptySubtext}>{t('caregiverApp.family.startDocumenting')}</Text>
              </View>
            ) : (
              journalEntries.map((entry) => {
                const isEditing = editingEntryId === entry.id;
                const typeConfig = isEditing
                  ? ENTRY_TYPE_CONFIG[editEntryType]
                  : ENTRY_TYPE_CONFIG[entry.entry_type as JournalEntryType] || {
                      emoji: '\u{1F4DD}',
                      label: t('caregiverApp.family.note'),
                    };
                return (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryEmoji}>{typeConfig.emoji}</Text>
                      <View style={styles.entryMeta}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.entryAuthor}>{entry.author_name}</Text>
                          {entry.updated_at && entry.updated_at !== entry.created_at && !isEditing && (
                            <Text style={styles.editedLabel}>{t('caregiverApp.family.edited')}</Text>
                          )}
                        </View>
                        <Text style={styles.entryTime}>{formatDate(entry.created_at)}</Text>
                      </View>
                      {!isEditing && (
                        <TouchableOpacity
                          style={styles.kebabButton}
                          onPress={() => showEntryActions(entry)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={styles.kebabText}>{'\u22EE'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {isEditing ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editContent}
                          onChangeText={setEditContent}
                          multiline
                          autoFocus
                          placeholderTextColor={colors.textMuted}
                        />
                        <View style={styles.entryTypeRow}>
                          {(Object.keys(ENTRY_TYPE_CONFIG) as JournalEntryType[]).map((type) => {
                            const config = ENTRY_TYPE_CONFIG[type];
                            const isSelected = editEntryType === type;
                            return (
                              <TouchableOpacity
                                key={type}
                                style={[styles.entryTypeButton, isSelected && styles.entryTypeButtonActive]}
                                onPress={() => setEditEntryType(type)}
                              >
                                <Text style={styles.entryTypeEmoji}>{config.emoji}</Text>
                                <Text style={[styles.entryTypeLabel, isSelected && styles.entryTypeLabelActive]}>
                                  {config.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={[styles.saveButton, !editContent.trim() && styles.postButtonDisabled]}
                            onPress={handleEditEntry}
                            disabled={!editContent.trim()}
                          >
                            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.entryContent}>{entry.content}</Text>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 18,
    color: colors.brand600,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.brand700,
    backgroundColor: colors.brand50,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.brand700,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderRadius: RADIUS.lg,
    padding: 16,
    margin: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: colors.danger,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.danger,
    flex: 1,
  },
  errorBannerRetry: {
    fontSize: 14,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: 12,
  },
  tabContent: {
    padding: 20,
  },
  limitBanner: {
    backgroundColor: colors.amberBg,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.amber + '30',
    marginBottom: 16,
  },
  limitBannerText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.amber,
    textAlign: 'center',
  },
  careCodeBanner: {
    backgroundColor: colors.brand50,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.brand200,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  careCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: colors.brand800,
    marginBottom: 8,
  },
  careCodeDesc: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.brand700,
    marginBottom: 16,
  },
  careCodeDisplay: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand300,
  },
  careCodeText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.brand700,
    letterSpacing: 4,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  careCodeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  codeAction: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.brand100,
    borderRadius: RADIUS.sm,
  },
  codeActionText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.brand700,
  },
  showCodeButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  showCodeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
  membersCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  membersTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.textMuted,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand100,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.brand700,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  youBadge: {
    backgroundColor: colors.brand100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.brand700,
  },
  primaryBadge: {
    backgroundColor: colors.amberBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.amber,
  },
  memberDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberDetails: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
  },
  permissionIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  permissionIcon: {
    fontSize: 14,
  },
  newEntryCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  newEntryInput: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  entryTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  entryTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.background,
  },
  entryTypeButtonActive: {
    backgroundColor: colors.brand100,
    borderWidth: 1,
    borderColor: colors.brand300,
  },
  entryTypeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  entryTypeLabel: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
  },
  entryTypeLabelActive: {
    color: colors.brand700,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  postButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  entryCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand200,
    ...SHADOWS.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  entryMeta: {
    flex: 1,
  },
  entryAuthor: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  entryTime: {
    fontSize: 13,
    color: colors.textMuted,
  },
  entryContent: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  kebabButton: {
    padding: 4,
  },
  kebabText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMuted,
    lineHeight: 24,
  },
  editedLabel: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
    fontFamily: FONTS.body,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.md,
    padding: 12,
    backgroundColor: colors.background,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    ...SHADOWS.sm,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
  cancelButton: {
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: colors.textSecondary,
  },
}));
