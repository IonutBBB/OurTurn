import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../theme';

interface ActivityCardProps {
  emoji: string;
  title: string;
  description: string;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
  badge?: string;
  completed?: boolean;
  domainBadge?: string;
}

function ActivityCard({
  emoji,
  title,
  description,
  onPress,
  backgroundColor,
  borderColor,
  badge,
  completed = false,
  domainBadge,
}: ActivityCardProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor, borderColor },
        completed && styles.cardCompleted,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ disabled: completed }}
    >
      {/* Badge */}
      {badge && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* Completed checkmark */}
      {completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>✅</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, completed && styles.textMuted]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            style={[styles.description, completed && styles.textMuted]}
            numberOfLines={2}
          >
            {description}
          </Text>
          {domainBadge && (
            <Text style={styles.domainBadge}>{domainBadge}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ActivityCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS['2xl'],
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    minHeight: 120,
    ...SHADOWS.md,
  },
  cardCompleted: {
    opacity: 0.65,
  },
  badgeContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: COLORS.brand600,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 20,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textInverse,
  },
  completedBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  completedBadgeText: {
    fontSize: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 44,
    marginRight: 18,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 28,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
  domainBadge: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
