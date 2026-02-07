import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@ourturn/supabase';
import { useAuthStore } from '../../src/stores/auth-store';
import type { BehaviourPlaybook, BehaviourIncident } from '@ourturn/shared';
import { PlaybookGrid } from '../../src/components/behaviours/playbook-grid';
import { PlaybookDetail } from '../../src/components/behaviours/playbook-detail';
import { IncidentLogger } from '../../src/components/behaviours/incident-logger';
import { BehaviourTimeline } from '../../src/components/behaviours/behaviour-timeline';
import { COLORS, FONTS, SPACING } from '../../src/theme';

export default function BehavioursScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ log?: string }>();
  const { household } = useAuthStore();

  const [playbooks, setPlaybooks] = useState<BehaviourPlaybook[]>([]);
  const [incidents, setIncidents] = useState<BehaviourIncident[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlaybook, setSelectedPlaybook] = useState<BehaviourPlaybook | null>(null);
  const [showLogger, setShowLogger] = useState(params.log === 'true');
  const [loggerPrefill, setLoggerPrefill] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!household?.id) return;

    const load = async () => {
      const [playbooksRes, incidentsRes] = await Promise.all([
        supabase
          .from('behaviour_playbooks')
          .select('*')
          .eq('language', 'en')
          .order('behaviour_type'),
        supabase
          .from('behaviour_incidents')
          .select('*')
          .eq('household_id', household.id)
          .order('logged_at', { ascending: false })
          .limit(50),
      ]);

      setPlaybooks(playbooksRes.data || []);
      setIncidents(incidentsRes.data || []);
      setLoading(false);
    };

    load();
  }, [household?.id]);

  const handleIncidentLogged = (incident: BehaviourIncident) => {
    setIncidents((prev) => [incident, ...prev]);
    setShowLogger(false);
    setLoggerPrefill(undefined);
  };

  const handleLogFromPlaybook = (behaviourType: string) => {
    setSelectedPlaybook(null);
    setLoggerPrefill(behaviourType);
    setShowLogger(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand600} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {t('caregiverApp.toolkit.behaviours.playbooks.title')}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PlaybookGrid playbooks={playbooks} onSelect={setSelectedPlaybook} />

        {/* Log Incident Button */}
        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => { setLoggerPrefill(undefined); setShowLogger(true); }}
          activeOpacity={0.7}
        >
          <Text style={styles.logBtnText}>
            {t('caregiverApp.toolkit.behaviours.logger.logIncident')}
          </Text>
        </TouchableOpacity>

        {/* Timeline */}
        {incidents.length > 0 && (
          <BehaviourTimeline incidents={incidents} />
        )}
      </ScrollView>

      {/* Playbook Detail Modal */}
      {selectedPlaybook && (
        <PlaybookDetail
          playbook={selectedPlaybook}
          onClose={() => setSelectedPlaybook(null)}
          onLogIncident={handleLogFromPlaybook}
        />
      )}

      {/* Incident Logger Modal */}
      {showLogger && (
        <IncidentLogger
          prefillType={loggerPrefill}
          onClose={() => { setShowLogger(false); setLoggerPrefill(undefined); }}
          onSaved={handleIncidentLogged}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[3],
    paddingBottom: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    marginBottom: SPACING[2],
  },
  backText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.brand600,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING[5],
    gap: SPACING[5],
    paddingBottom: SPACING[12],
  },
  logBtn: {
    backgroundColor: COLORS.brand600,
    borderRadius: 16,
    paddingVertical: SPACING[4],
    alignItems: 'center',
  },
  logBtnText: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
});
