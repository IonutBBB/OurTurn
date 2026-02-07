import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BehaviourIncident, BehaviourType } from '@ourturn/shared';
import { BEHAVIOUR_TYPES } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme';

interface BehaviourTimelineProps {
  incidents: BehaviourIncident[];
}

export function BehaviourTimeline({ incidents }: BehaviourTimelineProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<BehaviourType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? incidents
    : incidents.filter((i) => i.behaviour_type === filter);

  const grouped = filtered.reduce<Record<string, BehaviourIncident[]>>((acc, incident) => {
    const date = new Date(incident.logged_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(incident);
    return acc;
  }, {});

  const getTypeInfo = (type: BehaviourType) =>
    BEHAVIOUR_TYPES.find((bt) => bt.type === type) || { emoji: '❓', label: type };

  const getSeverityColor = (level: number) =>
    level <= 2 ? COLORS.success : level === 3 ? COLORS.amber : COLORS.danger;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('caregiverApp.toolkit.behaviours.timeline.title')}
      </Text>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              {t('caregiverApp.toolkit.behaviours.timeline.all')}
            </Text>
          </TouchableOpacity>
          {BEHAVIOUR_TYPES.map((bt) => (
            <TouchableOpacity
              key={bt.type}
              style={[styles.filterPill, filter === bt.type && styles.filterPillActive]}
              onPress={() => setFilter(bt.type)}
            >
              <Text style={[styles.filterText, filter === bt.type && styles.filterTextActive]}>
                {bt.emoji} {bt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Timeline */}
      {Object.entries(grouped).length === 0 ? (
        <Text style={styles.empty}>
          {t('caregiverApp.toolkit.behaviours.timeline.noIncidents')}
        </Text>
      ) : (
        Object.entries(grouped).map(([date, dayIncidents]) => (
          <View key={date} style={styles.dayGroup}>
            <Text style={styles.dayTitle}>{date}</Text>
            {dayIncidents.map((incident) => {
              const typeInfo = getTypeInfo(incident.behaviour_type);
              const isExpanded = expandedId === incident.id;
              const time = new Date(incident.logged_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });

              return (
                <View key={incident.id}>
                  <TouchableOpacity
                    style={styles.incidentRow}
                    onPress={() => setExpandedId(isExpanded ? null : incident.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.incidentEmoji}>{typeInfo.emoji}</Text>
                    <View style={styles.incidentContent}>
                      <View style={styles.incidentHeader}>
                        <Text style={styles.incidentType}>{typeInfo.label}</Text>
                        <View style={styles.severityDots}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <View
                              key={i}
                              style={[
                                styles.dot,
                                { backgroundColor: i <= incident.severity ? getSeverityColor(incident.severity) : COLORS.border },
                              ]}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.incidentPreview} numberOfLines={1}>
                        {incident.what_happened}
                      </Text>
                    </View>
                    <Text style={styles.incidentTime}>{time}</Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>
                          {t('caregiverApp.toolkit.behaviours.logger.whatHappened')}
                        </Text>
                        <Text style={styles.detailText}>{incident.what_happened}</Text>
                      </View>
                      {incident.what_helped && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>
                            {t('caregiverApp.toolkit.behaviours.logger.whatHelped')}
                          </Text>
                          <Text style={styles.detailText}>{incident.what_helped}</Text>
                        </View>
                      )}
                      {incident.possible_triggers.length > 0 && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>
                            {t('caregiverApp.toolkit.behaviours.logger.triggers')}
                          </Text>
                          <View style={styles.triggerTags}>
                            {incident.possible_triggers.map((trigger) => (
                              <View key={trigger} style={styles.triggerTag}>
                                <Text style={styles.triggerTagText}>
                                  {t(`caregiverApp.toolkit.behaviours.logger.trigger_${trigger}`)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING[5],
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING[3],
  },
  filterScroll: { marginBottom: SPACING[4] },
  filterRow: { flexDirection: 'row', gap: SPACING[2] },
  filterPill: {
    paddingHorizontal: SPACING[3], paddingVertical: SPACING[1],
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  filterPillActive: { borderColor: COLORS.brand600, backgroundColor: COLORS.brand50 },
  filterText: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.brand700, fontFamily: FONTS.bodyMedium, fontWeight: '500' },
  empty: {
    fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted,
    textAlign: 'center', paddingVertical: SPACING[4],
  },
  dayGroup: { marginBottom: SPACING[4] },
  dayTitle: {
    fontSize: 14, fontFamily: FONTS.bodySemiBold, fontWeight: '600',
    color: COLORS.textSecondary, marginBottom: SPACING[2],
  },
  incidentRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING[3],
    paddingVertical: SPACING[3], paddingHorizontal: SPACING[3],
    borderRadius: RADIUS.lg, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING[2],
  },
  incidentEmoji: { fontSize: 20 },
  incidentContent: { flex: 1 },
  incidentHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[2] },
  incidentType: { fontSize: 14, fontFamily: FONTS.bodyMedium, fontWeight: '500', color: COLORS.textPrimary },
  severityDots: { flexDirection: 'row', gap: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  incidentPreview: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 },
  incidentTime: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted },
  expandedContent: {
    marginLeft: SPACING[10], marginBottom: SPACING[3],
    padding: SPACING[4], borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    gap: SPACING[3],
  },
  detailSection: {},
  detailLabel: { fontSize: 12, fontFamily: FONTS.bodySemiBold, fontWeight: '600', color: COLORS.textSecondary },
  detailText: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.textPrimary, marginTop: 2 },
  triggerTags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[1], marginTop: 4 },
  triggerTag: {
    paddingHorizontal: SPACING[2], paddingVertical: 2,
    borderRadius: RADIUS.full, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
  },
  triggerTagText: { fontSize: 11, fontFamily: FONTS.body, color: COLORS.textSecondary },
});
