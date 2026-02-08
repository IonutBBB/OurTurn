import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import type { JourneyStepDefinition, JourneyProgress, JourneyStepStatus } from '@ourturn/shared';
import { createThemedStyles, FONTS, RADIUS, SPACING } from '../../theme';

interface JourneyStepDetailProps {
  step: JourneyStepDefinition;
  progress?: JourneyProgress;
  onClose: () => void;
  onToggleChecklist: (slug: string, index: number) => void;
  onUpdateStatus: (slug: string, status: JourneyStepStatus) => void;
}

export function JourneyStepDetail({
  step,
  progress,
  onClose,
  onToggleChecklist,
  onUpdateStatus,
}: JourneyStepDetailProps) {
  const { t } = useTranslation('resources');
  const styles = useStyles();
  const mdStyles = useMarkdownStyles();
  const status = progress?.status ?? 'not_started';
  const checklist = progress?.checklist_state ?? new Array(step.checklistKeys.length).fill(false);

  const allChecked = checklist.every(Boolean);

  const handleMarkComplete = () => {
    if (status === 'completed') {
      onUpdateStatus(step.slug, 'in_progress');
    } else {
      onUpdateStatus(step.slug, 'completed');
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.emoji}>{step.emoji}</Text>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t(step.titleKey)}</Text>
              <Text style={styles.time}>{step.timeEstimate}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Markdown Content */}
          <Markdown style={mdStyles}>{t(step.contentKey)}</Markdown>

          {/* Checklist */}
          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>{t('journey.checklist')}</Text>
            {step.checklistKeys.map((key, index) => {
              const checked = checklist[index] ?? false;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.checklistItem}
                  onPress={() => onToggleChecklist(step.slug, index)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checklistText, checked && styles.checklistTextChecked]}>
                    {t(key)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>{t('journey.disclaimer')}</Text>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.completeBtn,
              status === 'completed' && styles.completeBtnDone,
            ]}
            onPress={handleMarkComplete}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.completeBtnText,
                status === 'completed' && styles.completeBtnTextDone,
              ]}
            >
              {status === 'completed'
                ? t('journey.markInProgress')
                : t('journey.markComplete')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const useMarkdownStyles = createThemedStyles((colors) => ({
  body: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  heading4: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 10,
  },
  bullet_list: {
    marginBottom: 10,
  },
  ordered_list: {
    marginBottom: 10,
  },
  list_item: {
    marginBottom: 6,
  },
  strong: {
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  em: {
    fontStyle: 'italic',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand300,
    paddingLeft: 12,
    marginVertical: 10,
    opacity: 0.85,
  },
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 16,
  },
}));

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[6],
    paddingBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
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
    color: colors.textPrimary,
  },
  time: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING[3],
  },
  closeBtnText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING[5],
    gap: SPACING[5],
    paddingBottom: SPACING[8],
  },
  checklistSection: {
    gap: SPACING[3],
  },
  checklistTitle: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    minHeight: 56,
    paddingVertical: SPACING[2],
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    fontSize: 16,
    color: colors.textInverse,
    fontWeight: '700',
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  checklistTextChecked: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  completeBtn: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING[4],
    alignItems: 'center',
  },
  completeBtnDone: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  completeBtnText: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    fontWeight: '600',
    color: colors.textInverse,
  },
  completeBtnTextDone: {
    color: colors.success,
  },
}));
