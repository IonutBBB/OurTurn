import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeStore, type ThemePreference } from '../stores/theme-store';
import { createThemedStyles, useColors } from '../theme/themed-styles';
import { FONTS, RADIUS } from '../theme';

const options: { key: ThemePreference; icon: string; labelKey: string }[] = [
  { key: 'light', icon: '☀️', labelKey: 'caregiverApp.settings.theme.light' },
  { key: 'dark', icon: '🌙', labelKey: 'caregiverApp.settings.theme.dark' },
  { key: 'system', icon: '📱', labelKey: 'caregiverApp.settings.theme.system' },
];

export function ThemeToggle() {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useColors();
  const { preference, setPreference } = useThemeStore();

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = preference === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => setPreference(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{opt.icon}</Text>
            <Text
              style={[
                styles.label,
                isActive && { color: colors.brand700, fontFamily: FONTS.bodySemiBold },
              ]}
            >
              {t(opt.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  optionActive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.brand200,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
}));
