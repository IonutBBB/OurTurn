import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../src/stores/auth-store';
import { supabase } from '@ourturn/supabase';
import type { LocationAlert } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS } from '../../src/theme';

import { StatusPanel } from '../../src/components/crisis/status-panel';
import { QuickActions } from '../../src/components/crisis/quick-actions';
import { DeEscalationWizard } from '../../src/components/crisis/de-escalation-wizard';
import { CrisisHistory } from '../../src/components/crisis/crisis-history';
import { SupportResources } from '../../src/components/crisis/support-resources';
import { ScenarioGrid } from '../../src/components/crisis/scenario-grid';
import { ScenarioGuide } from '../../src/components/crisis/scenario-guide';
import { PatternInsight } from '../../src/components/crisis/pattern-insight';
import { getCrisisScenarios } from '../../src/components/crisis/scenarios-data';

type Mode = 'in_person' | 'remote';

interface CrisisEntry {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
}

const CRISIS_MODE_KEY = 'crisis-mode';
const API_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL || '';

export default function CrisisScreen() {
  const { t } = useTranslation();
  const { caregiver, household, patient } = useAuthStore();
  const styles = useStyles();
  const colors = useColors();
  const crisisScenarios = useMemo(() => getCrisisScenarios(t), [t]);

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('in_person');
  const [showWizard, setShowWizard] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isAlertingFamily, setIsAlertingFamily] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [logNotes, setLogNotes] = useState('');

  const [latestLocation, setLatestLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp: string;
    location_label: string;
  } | null>(null);
  const [alerts, setAlerts] = useState<LocationAlert[]>([]);
  const [crisisEntries, setCrisisEntries] = useState<CrisisEntry[]>([]);
  const [familyCaregivers, setFamilyCaregivers] = useState<
    { id: string; name: string; email: string; role: string }[]
  >([]);
  const [primaryCaregiver, setPrimaryCaregiver] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // Load persisted mode
  useEffect(() => {
    AsyncStorage.getItem(CRISIS_MODE_KEY).then((saved) => {
      if (saved === 'in_person' || saved === 'remote') {
        setMode(saved);
      }
    });
  }, []);

  // Persist mode changes
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    AsyncStorage.setItem(CRISIS_MODE_KEY, newMode);
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!caregiver?.id || !household?.id) return;

      try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [locationResult, alertsResult, journalResult, familyResult] =
          await Promise.all([
            // Latest location
            supabase
              .from('location_logs')
              .select('latitude, longitude, timestamp, location_label')
              .eq('household_id', household.id)
              .order('timestamp', { ascending: false })
              .limit(1)
              .single(),
            // Alerts (24h)
            supabase
              .from('location_alerts')
              .select('*')
              .eq('household_id', household.id)
              .gte('triggered_at', twentyFourHoursAgo.toISOString())
              .order('triggered_at', { ascending: false }),
            // Crisis journal entries (30d)
            supabase
              .from('care_journal_entries')
              .select('id, content, created_at, author_id, caregivers(name)')
              .eq('household_id', household.id)
              .eq('entry_type', 'crisis')
              .gte('created_at', thirtyDaysAgo.toISOString())
              .order('created_at', { ascending: false })
              .limit(20),
            // Family caregivers
            supabase
              .from('caregivers')
              .select('id, name, email, role')
              .eq('household_id', household.id),
          ]);

        if (locationResult.data) {
          setLatestLocation(locationResult.data);
        }

        setAlerts((alertsResult.data || []) as LocationAlert[]);

        // Map journal entries with author names
        // PostgREST may return caregivers as object (one-to-one) or array depending on schema
        const entries: CrisisEntry[] = (journalResult.data || []).map(
          (entry: any) => {
            const cg = Array.isArray(entry.caregivers)
              ? entry.caregivers[0]
              : entry.caregivers;
            return {
              id: entry.id,
              content: entry.content,
              created_at: entry.created_at,
              author_name:
                entry.author_id === caregiver.id
                  ? t('common.you')
                  : cg?.name || t('common.unknown'),
            };
          }
        );
        setCrisisEntries(entries);

        const family = (familyResult.data || []).filter(
          (c) => c.id !== caregiver.id
        );
        setFamilyCaregivers(family);

        const primary = (familyResult.data || []).find(
          (c: any) => c.role === 'primary' && c.id !== caregiver.id
        );
        if (primary) {
          setPrimaryCaregiver({ name: primary.name, email: primary.email });
        }
      } catch (err) {
        if (__DEV__) console.error('Failed to load crisis data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [caregiver?.id, household?.id, t]);

  // Acknowledge an alert
  const handleAcknowledge = useCallback(
    async (alertId: string) => {
      if (!caregiver?.id) return;
      try {
        const { error } = await supabase
          .from('location_alerts')
          .update({
            acknowledged: true,
            acknowledged_by: caregiver.id,
            acknowledged_at: new Date().toISOString(),
          })
          .eq('id', alertId);

        if (error) throw error;

        // Resolve active escalation
        await supabase
          .from('alert_escalations')
          .update({
            resolved: true,
            resolved_at: new Date().toISOString(),
            resolved_by: caregiver.id,
          })
          .eq('alert_id', alertId)
          .eq('resolved', false);

        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? { ...a, acknowledged: true, acknowledged_by: caregiver.id }
              : a
          )
        );
      } catch {
        Alert.alert(t('common.errorTitle'), t('common.error'));
      }
    },
    [caregiver?.id, t]
  );

  // Alert family
  const handleAlertFamily = useCallback(async () => {
    if (!household?.id) return;
    setIsAlertingFamily(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/crisis/alert-family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdId: household.id }),
      });

      if (!res.ok) throw new Error('Failed');

      Alert.alert('', t('caregiverApp.crisis.actions.alertFamilySent'));
    } catch {
      Alert.alert(
        t('common.errorTitle'),
        t('caregiverApp.crisis.actions.alertFamilyFailed')
      );
    } finally {
      setIsAlertingFamily(false);
    }
  }, [household?.id, t]);

  // Wizard complete
  const handleWizardComplete = useCallback(
    async (notes: string) => {
      setShowWizard(false);

      if (notes.trim() && caregiver?.id && household?.id) {
        try {
          const { data, error } = await supabase
            .from('care_journal_entries')
            .insert({
              household_id: household.id,
              author_id: caregiver.id,
              content: notes.trim(),
              entry_type: 'crisis',
            })
            .select('id, content, created_at')
            .single();

          if (error) throw error;

          if (data) {
            setCrisisEntries((prev) => [
              {
                id: data.id,
                content: data.content,
                created_at: data.created_at,
                author_name: t('common.you'),
              },
              ...prev,
            ]);
          }

          Alert.alert('', t('caregiverApp.crisis.eventLogged'));
        } catch {
          Alert.alert(t('common.errorTitle'), t('common.error'));
        }
      }
    },
    [caregiver?.id, household?.id, t]
  );

  // Log crisis event from form
  const handleLogCrisis = useCallback(async () => {
    if (!logNotes.trim() || !caregiver?.id || !household?.id) return;
    setIsLogging(true);

    try {
      const { data, error } = await supabase
        .from('care_journal_entries')
        .insert({
          household_id: household.id,
          author_id: caregiver.id,
          content: logNotes.trim(),
          entry_type: 'crisis',
        })
        .select('id, content, created_at')
        .single();

      if (error) throw error;

      if (data) {
        setCrisisEntries((prev) => [
          {
            id: data.id,
            content: data.content,
            created_at: data.created_at,
            author_name: t('common.you'),
          },
          ...prev,
        ]);
      }

      setLogNotes('');
      setShowLogForm(false);
      Alert.alert('', t('caregiverApp.crisis.eventLogged'));
    } catch {
      Alert.alert(t('common.errorTitle'), t('common.error'));
    } finally {
      setIsLogging(false);
    }
  }, [logNotes, caregiver?.id, household?.id, t]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand600} />
        </View>
      </SafeAreaView>
    );
  }

  const country = household?.country || 'US';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>&#8249; {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {t('caregiverApp.crisis.title')}
          </Text>
        </View>

        <Text style={styles.subtitle}>
          {t('caregiverApp.crisis.subtitle')}
        </Text>

        {/* Status Panel */}
        <StatusPanel
          alerts={alerts}
          latestLocation={latestLocation}
          patientName={patient?.name || ''}
          onAcknowledge={handleAcknowledge}
        />

        <View style={styles.spacer} />

        {/* Quick Actions */}
        <QuickActions
          mode={mode}
          onModeChange={handleModeChange}
          country={country}
          patientName={patient?.name || ''}
          primaryCaregiver={primaryCaregiver}
          onStartDeEscalation={() => setShowWizard(true)}
          onAlertFamily={handleAlertFamily}
          onLogEvent={() => setShowLogForm(true)}
          isAlertingFamily={isAlertingFamily}
        />

        <View style={styles.spacer} />

        {/* Scenario Grid or Guide (A4, A6) */}
        {selectedScenarioId ? (
          <ScenarioGuide
            scenario={crisisScenarios.find((s) => s.id === selectedScenarioId)!}
            patientName={patient?.name || ''}
            calmingStrategies={
              patient?.calming_strategies || patient?.biography?.favorite_music
                ? [
                    ...(patient?.calming_strategies || []),
                    ...(patient?.biography?.favorite_music ? patient.biography.favorite_music.map(m => `Music: ${m}`) : []),
                  ]
                : null
            }
            country={country}
            onBack={() => setSelectedScenarioId(null)}
            onAlertFamily={handleAlertFamily}
          />
        ) : (
          <ScenarioGrid
            scenarios={crisisScenarios}
            onSelectScenario={(id) => setSelectedScenarioId(id)}
          />
        )}

        {/* Log Event Form */}
        {showLogForm && (
          <>
            <View style={styles.spacer} />
            <View style={styles.logFormCard}>
              <Text style={styles.logFormTitle}>
                {t('caregiverApp.crisis.logEvent')}
              </Text>
              <TextInput
                style={styles.logFormInput}
                value={logNotes}
                onChangeText={setLogNotes}
                placeholder={t('caregiverApp.crisis.logPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.logFormButtons}>
                <TouchableOpacity
                  style={[
                    styles.logSaveButton,
                    (!logNotes.trim() || isLogging) && styles.disabledButton,
                  ]}
                  onPress={handleLogCrisis}
                  disabled={!logNotes.trim() || isLogging}
                  activeOpacity={0.7}
                >
                  <Text style={styles.logSaveButtonText}>
                    {isLogging ? t('common.saving') : t('common.save')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.logCancelButton}
                  onPress={() => setShowLogForm(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.logCancelButtonText}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={styles.spacer} />

        {/* Pattern Insight (A5) */}
        {crisisEntries.length >= 3 && (
          <>
            <PatternInsight entries={crisisEntries} />
            <View style={styles.spacer} />
          </>
        )}

        {/* Crisis History */}
        <CrisisHistory entries={crisisEntries} />

        <View style={styles.spacer} />

        {/* Support Resources */}
        <SupportResources
          country={country}
          familyCaregivers={familyCaregivers}
        />

        <View style={styles.spacer} />
      </ScrollView>

      {/* De-Escalation Wizard Modal */}
      <DeEscalationWizard
        visible={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
      />
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  spacer: {
    height: 16,
  },
  logFormCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...SHADOWS.sm,
  },
  logFormTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  logFormInput: {
    height: 100,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS.lg,
    padding: 12,
    fontSize: 15,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  logFormButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  logSaveButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logSaveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  logCancelButton: {
    backgroundColor: colors.brand100,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.brand200,
  },
  logCancelButtonText: {
    color: colors.brand700,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  disabledButton: {
    opacity: 0.5,
  },
}));
