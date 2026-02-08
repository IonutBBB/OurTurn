import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { createThemedStyles, FONTS, RADIUS, SHADOWS } from '../../theme';

interface SosButtonProps {
  householdId: string;
}

const SOS_OPTIONS = [
  {
    key: 'calmDown',
    emoji: '🫁',
    route: null, // scroll to quick relief
  },
  {
    key: 'behaviourNow',
    emoji: '📋',
    route: '/coach', // go to behaviours tab
  },
  {
    key: 'callHelp',
    emoji: '📞',
    route: '/crisis',
  },
  {
    key: 'needBreak',
    emoji: '🆘',
    route: null, // scroll to help request
  },
] as const;

export function SosButton({ householdId }: SosButtonProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [showModal, setShowModal] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowModal(true);
  };

  const handleOption = (option: (typeof SOS_OPTIONS)[number]) => {
    setShowModal(false);

    if (option.key === 'calmDown' || option.key === 'needBreak') {
      // Stay on wellbeing screen — these sections are already visible
      return;
    }

    if (option.route) {
      router.push(option.route as any);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityLabel="SOS"
      >
        <Text style={styles.floatingButtonText}>SOS</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('caregiverApp.toolkit.sos.title')}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {t('caregiverApp.toolkit.sos.subtitle')}
            </Text>

            <View style={styles.optionsContainer}>
              {SOS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    option.key === 'callHelp' && styles.optionButtonDanger,
                  ]}
                  onPress={() => handleOption(option)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>
                      {t(`caregiverApp.toolkit.sos.${option.key}`)}
                    </Text>
                    <Text style={styles.optionDesc}>
                      {t(`caregiverApp.toolkit.sos.${option.key}Desc`)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const useStyles = createThemedStyles((colors) => ({
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    elevation: 8,
    zIndex: 50,
  },
  floatingButtonText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FONTS.display,
    color: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: colors.brand200,
    backgroundColor: colors.brand50,
  },
  optionButtonDanger: {
    borderColor: colors.danger + '40',
    backgroundColor: colors.dangerBg,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
  },
  optionDesc: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginTop: 2,
  },
}));
