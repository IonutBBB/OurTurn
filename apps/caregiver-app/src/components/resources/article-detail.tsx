import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import type { ArticleDefinition } from '@ourturn/shared';
import { COLORS, FONTS, RADIUS, SPACING } from '../../theme';

interface ArticleDetailProps {
  article: ArticleDefinition;
  onClose: () => void;
}

export function ArticleDetail({ article, onClose }: ArticleDetailProps) {
  const { t } = useTranslation('resources');

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.emoji}>{article.emoji}</Text>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t(article.titleKey)}</Text>
              <Text style={styles.readingTime}>
                {t('articles.readingTime', { minutes: article.readingTimeMinutes })}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Markdown style={markdownStyles}>{t(article.contentKey)}</Markdown>

          <Text style={styles.disclaimer}>{t('articles.disclaimer')}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  heading4: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
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
    borderLeftColor: COLORS.brand300,
    paddingLeft: 12,
    marginVertical: 10,
    opacity: 0.85,
  },
  hr: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: 16,
  },
});

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
  readingTime: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
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
    gap: SPACING[5],
    paddingBottom: SPACING[8],
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
