import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../../theme';
import type { ActivityRendererProps } from './types';
import type { GuidedBreathingContent } from '../../data/bundled-activities';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export default function GuidedBreathingRenderer({
  content,
  onComplete,
  onSkip,
}: ActivityRendererProps) {
  const { t } = useTranslation();
  const data = content as GuidedBreathingContent;
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [elapsed, setElapsed] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!data) return null;

  const totalSeconds = data.durationMinutes * 60;
  const cycleLength = data.inhaleSeconds + data.holdSeconds + data.exhaleSeconds;

  const phaseTextKey = {
    inhale: 'patientApp.stim.guidedBreathing.breatheIn',
    hold: 'patientApp.stim.guidedBreathing.hold',
    exhale: 'patientApp.stim.guidedBreathing.breatheOut',
  };

  useEffect(() => {
    if (!started) return;

    let seconds = 0;
    intervalRef.current = setInterval(() => {
      seconds++;
      setElapsed(seconds);

      if (seconds >= totalSeconds) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete({ activity: 'guided_breathing', duration: data.durationMinutes });
        return;
      }

      const posInCycle = seconds % cycleLength;
      if (posInCycle < data.inhaleSeconds) {
        setPhase('inhale');
      } else if (posInCycle < data.inhaleSeconds + data.holdSeconds) {
        setPhase('hold');
      } else {
        setPhase('exhale');
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started]);

  // Animate circle based on phase
  useEffect(() => {
    if (!started) return;

    if (phase === 'inhale') {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: data.inhaleSeconds * 1000,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'hold') {
      // Stay
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: data.exhaleSeconds * 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [phase, started]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStarted(true);
  };

  const minutesLeft = Math.ceil((totalSeconds - elapsed) / 60);

  return (
    <View style={styles.container}>
      {!started ? (
        <>
          <Text style={styles.emoji}>🫧</Text>
          <Text style={styles.instruction}>
            {t('patientApp.stim.guidedBreathing.instruction')}
          </Text>
          <Text style={styles.duration}>
            {t('patientApp.stim.guidedBreathing.minutes', { count: data.durationMinutes })}
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>
              {t('patientApp.stim.guidedBreathing.begin')}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.innerCircle} />
          </Animated.View>
          <Text style={styles.phaseText}>{t(phaseTextKey[phase])}</Text>
          <Text style={styles.timer}>
            {t('patientApp.stim.guidedBreathing.minutesLeft', { count: minutesLeft })}
          </Text>
        </>
      )}

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>{t('common.skip')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  emoji: { fontSize: 56, marginBottom: 16 },
  instruction: {
    fontSize: 22, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 30, marginBottom: 16, paddingHorizontal: 8,
  },
  duration: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: COLORS.brand600, paddingVertical: 18, paddingHorizontal: 48,
    borderRadius: RADIUS.lg,
  },
  startButtonText: { fontSize: 24, fontFamily: FONTS.bodySemiBold, color: COLORS.textInverse },
  circle: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: COLORS.brand200, justifyContent: 'center', alignItems: 'center',
    marginBottom: 32,
  },
  innerCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.brand400,
  },
  phaseText: {
    fontSize: 28, fontFamily: FONTS.display, color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 16,
  },
  timer: {
    fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted,
  },
  skipButton: { marginTop: 32, paddingVertical: 12 },
  skipText: { fontSize: 20, fontFamily: FONTS.body, color: COLORS.textMuted },
});
