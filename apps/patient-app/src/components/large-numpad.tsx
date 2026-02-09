/**
 * Large numpad for Price Guessing activity.
 * No system keyboard needed — large touch targets.
 */

import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS } from '../theme';

interface LargeNumpadProps {
  value: string;
  onValueChange: (value: string) => void;
  currency?: string;
  maxLength?: number;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

function LargeNumpad({ value, onValueChange, currency = '€', maxLength = 8 }: LargeNumpadProps) {
  const handleKey = async (key: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === '⌫') {
      onValueChange(value.slice(0, -1));
      return;
    }

    if (key === '.' && value.includes('.')) return;
    if (value.length >= maxLength) return;

    // Don't allow leading zeros like "00"
    if (key === '0' && value === '0') return;
    // Auto-prepend "0" before lone decimal
    if (key === '.' && value === '') {
      onValueChange('0.');
      return;
    }

    onValueChange(value + key);
  };

  return (
    <View style={styles.container}>
      {/* Display */}
      <View style={styles.display}>
        <Text style={styles.currency}>{currency}</Text>
        <Text style={styles.value}>{value || '0'}</Text>
      </View>

      {/* Keypad */}
      {KEYS.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.key, key === '⌫' && styles.keyBackspace]}
              onPress={() => handleKey(key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={key === '⌫' ? 'Backspace' : key}
            >
              <Text style={[styles.keyText, key === '⌫' && styles.keyBackspaceText]}>
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

export default memo(LargeNumpad);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currency: {
    fontSize: 32,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textMuted,
    marginRight: 4,
  },
  value: {
    fontSize: 40,
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  key: {
    width: 80,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 28,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
  },
  keyBackspace: {
    backgroundColor: COLORS.brand50,
    borderColor: COLORS.brand200,
  },
  keyBackspaceText: {
    fontSize: 24,
  },
});
