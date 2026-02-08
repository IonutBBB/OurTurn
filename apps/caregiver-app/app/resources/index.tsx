import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { JOURNEY_STEPS } from '@ourturn/shared';
import type { JourneyStepDefinition, ArticleDefinition } from '@ourturn/shared';
import { useJourneyProgress } from '../../src/hooks/use-journey-progress';
import { useLocalSupport } from '../../src/hooks/use-local-support';
import { JourneyProgressBar } from '../../src/components/resources/journey-progress-bar';
import { JourneySection } from '../../src/components/resources/journey-section';
import { JourneyStepDetail } from '../../src/components/resources/journey-step-detail';
import { ArticleSection } from '../../src/components/resources/article-section';
import { ArticleDetail } from '../../src/components/resources/article-detail';
import { LocalSupportSection } from '../../src/components/resources/local-support-section';
import { createThemedStyles, useColors, FONTS, SPACING } from '../../src/theme';

export default function ResourcesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const colors = useColors();

  const {
    progressMap,
    completedCount,
    totalCount,
    isLoading: journeyLoading,
    updateStepStatus,
    toggleChecklistItem,
  } = useJourneyProgress();

  const {
    supportByCategory,
    isLoading: supportLoading,
    isEmpty: supportEmpty,
  } = useLocalSupport();

  const [selectedStep, setSelectedStep] = useState<JourneyStepDefinition | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDefinition | null>(null);

  const isLoading = journeyLoading || supportLoading;

  // Build status array for progress bar
  const stepStatuses = JOURNEY_STEPS.map(
    (step) => progressMap[step.slug]?.status ?? 'not_started'
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand600} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>&#8249; {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('caregiverApp.coach.resources.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Journey Progress Bar */}
        <JourneyProgressBar
          completedCount={completedCount}
          totalCount={totalCount}
          stepStatuses={stepStatuses}
        />

        {/* Journey Section */}
        <JourneySection
          progressMap={progressMap}
          onSelectStep={setSelectedStep}
        />

        {/* Knowledge Library */}
        <ArticleSection onSelectArticle={setSelectedArticle} />

        {/* Local Support */}
        <LocalSupportSection
          supportByCategory={supportByCategory}
          isEmpty={supportEmpty}
        />
      </ScrollView>

      {/* Journey Step Detail Modal */}
      {selectedStep && (
        <JourneyStepDetail
          step={selectedStep}
          progress={progressMap[selectedStep.slug]}
          onClose={() => setSelectedStep(null)}
          onToggleChecklist={toggleChecklistItem}
          onUpdateStatus={updateStepStatus}
        />
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[3],
    paddingBottom: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    marginBottom: SPACING[2],
  },
  backText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.brand600,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING[5],
    gap: SPACING[8],
    paddingBottom: SPACING[12],
  },
}));
