import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import type { Caregiver, CareJournalEntry, JournalEntryType } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../src/theme';

const ENTRY_TYPE_CONFIG: Record<JournalEntryType, { emoji: string; label: string }> = {
  observation: { emoji: '👀', label: 'Observation' },
  note: { emoji: '📝', label: 'Note' },
  milestone: { emoji: '⭐', label: 'Milestone' },
};

export default function FamilyScreen() {
  const { t } = useTranslation();
  const { caregiver, household } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'family' | 'journal'>('family');
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [journalEntries, setJournalEntries] = useState<(CareJournalEntry & { author_name?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCareCode, setShowCareCode] = useState(false);

  // Journal entry form
  const [newContent, setNewContent] = useState('');
  const [newEntryType, setNewEntryType] = useState<JournalEntryType>('observation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit/delete state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editEntryType, setEditEntryType] = useState<JournalEntryType>('observation');

  const loadData = async () => {
    if (!household?.id) return;

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
        author_name: (entry.caregivers as any)?.name || 'Unknown',
      }));

      setJournalEntries(transformed);
    } catch (err) {
      if (__DEV__) console.error('Failed to load family data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [household?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleShareCareCode = async () => {
    if (!household?.care_code) return;

    try {
      await Share.share({
        message: `Join my OurTurn care circle! Use this Care Code: ${household.care_code}`,
      });
    } catch (err) {
      if (__DEV__) console.error('Failed to share:', err);
    }
  };

  const handleCopyCareCode = async () => {
    if (!household?.care_code) return;

    await Clipboard.setStringAsync(household.care_code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Care Code copied to clipboard');
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
      Alert.alert('Error', 'Failed to add entry. Please try again.');
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
      undefined as any,
      undefined as any,
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
      return 'Yesterday';
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
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Family Circle</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'family' && styles.tabActive]}
          onPress={() => setActiveTab('family')}
        >
          <Text style={[styles.tabText, activeTab === 'family' && styles.tabTextActive]}>
            Family
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'journal' && styles.tabActive]}
          onPress={() => setActiveTab('journal')}
        >
          <Text style={[styles.tabText, activeTab === 'journal' && styles.tabTextActive]}>
            Care Journal
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
        {/* Family Tab */}
        {activeTab === 'family' && (
          <View style={styles.tabContent}>
            {/* Care Code Banner */}
            <View style={styles.careCodeBanner}>
              <Text style={styles.careCodeTitle}>Invite Family Members</Text>
              <Text style={styles.careCodeDesc}>
                Share your Care Code to let other family members join.
              </Text>

              {showCareCode ? (
                <View style={styles.careCodeDisplay}>
                  <Text style={styles.careCodeText}>{household?.care_code}</Text>
                  <View style={styles.careCodeActions}>
                    <TouchableOpacity style={styles.codeAction} onPress={handleCopyCareCode}>
                      <Text style={styles.codeActionText}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.codeAction} onPress={handleShareCareCode}>
                      <Text style={styles.codeActionText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.showCodeButton}
                  onPress={() => setShowCareCode(true)}
                >
                  <Text style={styles.showCodeButtonText}>Show Care Code</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Members List */}
            <View style={styles.membersCard}>
              <Text style={styles.membersTitle}>Family Members ({caregivers.length})</Text>
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
                          <Text style={styles.youBadgeText}>You</Text>
                        </View>
                      )}
                      {cg.role === 'primary' && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberDetails}>
                      {cg.relationship || 'Family member'}
                    </Text>
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
                placeholder="Add a note, observation, or milestone..."
                placeholderTextColor={COLORS.textMuted}
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
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Entries List */}
            {journalEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No journal entries yet.</Text>
                <Text style={styles.emptySubtext}>Start documenting your care journey!</Text>
              </View>
            ) : (
              journalEntries.map((entry) => {
                const isEditing = editingEntryId === entry.id;
                const typeConfig = isEditing
                  ? ENTRY_TYPE_CONFIG[editEntryType]
                  : ENTRY_TYPE_CONFIG[entry.entry_type as JournalEntryType] || {
                      emoji: '📝',
                      label: 'Note',
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
                          <Text style={styles.kebabText}>⋮</Text>
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
                          placeholderTextColor={COLORS.textMuted}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.brand600,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.brand700,
    backgroundColor: COLORS.brand50,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.brand700,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tabContent: {
    padding: 20,
  },
  careCodeBanner: {
    backgroundColor: COLORS.brand50,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  careCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: COLORS.brand800,
    marginBottom: 8,
  },
  careCodeDesc: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.brand700,
    marginBottom: 16,
  },
  careCodeDisplay: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.brand300,
  },
  careCodeText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.brand700,
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
    backgroundColor: COLORS.brand100,
    borderRadius: RADIUS.sm,
  },
  codeActionText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.brand700,
  },
  showCodeButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  showCodeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  membersCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  membersTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand100,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brand100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.brand700,
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
    color: COLORS.textPrimary,
  },
  youBadge: {
    backgroundColor: COLORS.brand100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.brand700,
  },
  primaryBadge: {
    backgroundColor: COLORS.amberBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.amber,
  },
  memberDetails: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  newEntryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  newEntryInput: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  entryTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  entryTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  entryTypeButtonActive: {
    backgroundColor: COLORS.brand100,
    borderWidth: 1,
    borderColor: COLORS.brand300,
  },
  entryTypeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  entryTypeLabel: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  entryTypeLabelActive: {
    color: COLORS.brand700,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  postButton: {
    backgroundColor: COLORS.brand600,
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
    color: COLORS.textInverse,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  entryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand200,
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
    color: COLORS.textPrimary,
  },
  entryTime: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  entryContent: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  kebabButton: {
    padding: 4,
  },
  kebabText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  editedLabel: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    backgroundColor: COLORS.background,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    ...SHADOWS.sm,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  cancelButton: {
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
});
