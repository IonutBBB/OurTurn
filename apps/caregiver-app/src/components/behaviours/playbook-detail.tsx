import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BehaviourPlaybook } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme';

interface PlaybookDetailProps {
  playbook: BehaviourPlaybook;
  onClose: () => void;
  onLogIncident: (behaviourType: string) => void;
}

type SectionKey = 'right_now' | 'understand_why' | 'prevent' | 'when_to_call_doctor';

export function PlaybookDetail({ playbook, onClose, onLogIncident }: PlaybookDetailProps) {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState<SectionKey>('right_now');

  const sections: { key: SectionKey; title: string; icon: string }[] = [
    { key: 'right_now', title: t('caregiverApp.toolkit.behaviours.playbooks.rightNow'), icon: '⚡' },
    { key: 'understand_why', title: t('caregiverApp.toolkit.behaviours.playbooks.understandWhy'), icon: '🧠' },
    { key: 'prevent', title: t('caregiverApp.toolkit.behaviours.playbooks.prevent'), icon: '🛡️' },
    { key: 'when_to_call_doctor', title: t('caregiverApp.toolkit.behaviours.playbooks.whenToCallDoctor'), icon: '🏥' },
  ];

  const renderContent = (key: SectionKey) => {
    if (key === 'right_now') {
      const steps = playbook.right_now as { step: string }[];
      return (
        <View style={styles.contentList}>
          {steps.map((item, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{item.step}</Text>
            </View>
          ))}
        </View>
      );
    }

    const items = playbook[key] as string[];
    return (
      <View style={styles.contentList}>
        {items.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.emoji}>{playbook.emoji}</Text>
            <View style={styles.headerText}>
              <Text style={styles.title}>{playbook.title}</Text>
              <Text style={styles.description} numberOfLines={2}>{playbook.description}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {sections.map((section) => {
            const isOpen = openSection === section.key;
            return (
              <View key={section.key} style={styles.accordion}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => setOpenSection(isOpen ? (null as unknown as SectionKey) : section.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.accordionIcon}>{section.icon}</Text>
                  <Text style={styles.accordionTitle}>{section.title}</Text>
                  <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {isOpen && (
                  <View style={styles.accordionBody}>
                    {renderContent(section.key)}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Log Incident Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => onLogIncident(playbook.behaviour_type)}
            activeOpacity={0.7}
          >
            <Text style={styles.logButtonText}>
              {t('caregiverApp.toolkit.behaviours.logger.logIncident')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
    paddingBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    flex: 1,
  },
  emoji: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING[3],
  },
  closeBtnText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING[5],
    gap: SPACING[3],
  },
  accordion: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  accordionIcon: {
    fontSize: 18,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chevron: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  accordionBody: {
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[4],
  },
  contentList: {
    gap: SPACING[3],
  },
  stepRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.brand100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    color: COLORS.brand700,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: SPACING[2],
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  logButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
});
