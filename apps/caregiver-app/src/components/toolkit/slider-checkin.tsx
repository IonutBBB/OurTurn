import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { supabase } from '@ourturn/supabase';
import type { CaregiverWellbeingLog, SliderValue } from '@ourturn/shared';
import { ENERGY_LABELS, STRESS_LABELS, CAREGIVER_SLEEP_LABELS } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS } from '../../theme';

interface SliderCheckinProps {
  caregiverId: string;
  initialLog: CaregiverWellbeingLog | null;
  onLogUpdated: (log: CaregiverWellbeingLog) => void;
}

export function SliderCheckin({ caregiverId, initialLog, onLogUpdated }: SliderCheckinProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useColors();
  const today = new Date().toISOString().split('T')[0];

  const [energy, setEnergy] = useState<SliderValue>((initialLog?.energy_level as SliderValue) || 3);
  const [stress, setStress] = useState<SliderValue>((initialLog?.stress_level as SliderValue) || 3);
  const [sleep, setSleep] = useState<SliderValue>((initialLog?.sleep_quality_rating as SliderValue) || 3);
  const [hasInteracted, setHasInteracted] = useState(
    initialLog?.energy_level !== null || initialLog?.stress_level !== null || initialLog?.sleep_quality_rating !== null
  );

  const logRef = useRef(initialLog);
  useEffect(() => { logRef.current = initialLog; }, [initialLog]);

  const save = useCallback(async () => {
    if (!hasInteracted) return;
    try {
      const { data, error } = await supabase
        .from('caregiver_wellbeing_logs')
        .upsert(
          {
            caregiver_id: caregiverId,
            date: today,
            energy_level: energy,
            stress_level: stress,
            sleep_quality_rating: sleep,
          },
          { onConflict: 'caregiver_id,date' }
        )
        .select()
        .single();

      if (error) throw error;
      onLogUpdated(data);
    } catch {
      // Silent fail on auto-save
    }
  }, [energy, stress, sleep, caregiverId, today, hasInteracted, onLogUpdated]);

  useEffect(() => {
    if (!hasInteracted) return;
    const timeout = setTimeout(save, 1000);
    return () => clearTimeout(timeout);
  }, [energy, stress, sleep, save, hasInteracted]);

  const handleChange = (setter: (v: SliderValue) => void) => async (value: SliderValue) => {
    setHasInteracted(true);
    setter(value);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('caregiverApp.toolkit.checkin.title')}</Text>

      <DiscreteSlider
        label={t('caregiverApp.toolkit.checkin.energy')}
        lowLabel={t('caregiverApp.toolkit.checkin.energyLow')}
        highLabel={t('caregiverApp.toolkit.checkin.energyHigh')}
        value={energy}
        labels={ENERGY_LABELS}
        onChange={handleChange(setEnergy)}
        activeColor={colors.success}
      />

      <DiscreteSlider
        label={t('caregiverApp.toolkit.checkin.stress')}
        lowLabel={t('caregiverApp.toolkit.checkin.stressLow')}
        highLabel={t('caregiverApp.toolkit.checkin.stressHigh')}
        value={stress}
        labels={STRESS_LABELS}
        onChange={handleChange(setStress)}
        activeColor={colors.amber}
      />

      <DiscreteSlider
        label={t('caregiverApp.toolkit.checkin.sleep')}
        lowLabel={t('caregiverApp.toolkit.checkin.sleepLow')}
        highLabel={t('caregiverApp.toolkit.checkin.sleepHigh')}
        value={sleep}
        labels={CAREGIVER_SLEEP_LABELS}
        onChange={handleChange(setSleep)}
        activeColor={colors.info}
      />
    </View>
  );
}

function DiscreteSlider({
  label,
  lowLabel,
  highLabel,
  value,
  labels,
  onChange,
  activeColor,
}: {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: SliderValue;
  labels: Record<SliderValue, string>;
  onChange: (v: SliderValue) => void;
  activeColor: string;
}) {
  const styles = useStyles();
  const colors = useColors();

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color: activeColor }]}>{labels[value]}</Text>
      </View>
      <View style={styles.dotsRow}>
        {([1, 2, 3, 4, 5] as SliderValue[]).map((v) => (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            style={styles.dotTouchArea}
            hitSlop={8}
          >
            <View
              style={[
                styles.dot,
                v <= value
                  ? { backgroundColor: activeColor }
                  : { backgroundColor: colors.border },
                v === value && styles.dotActive,
              ]}
            />
          </Pressable>
        ))}
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.endLabel}>{lowLabel}</Text>
        <Text style={styles.endLabel}>{highLabel}</Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dotTouchArea: {
    padding: 8,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dotActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'white',
    ...SHADOWS.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  endLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: FONTS.body,
  },
}));
