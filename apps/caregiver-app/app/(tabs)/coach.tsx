import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import ProactiveInsightCard from '../../src/components/coach/proactive-insight-card';
import SituationCards from '../../src/components/coach/situation-cards';
import WorkflowCards from '../../src/components/coach/workflow-cards';

import OpenChatInput from '../../src/components/coach/open-chat-input';
import { createThemedStyles, FONTS, RADIUS, SPACING } from '../../src/theme';



interface InsightData {
  text: string;
  suggestion: string;
  category: 'positive' | 'attention' | 'suggestion';
}

export default function CoachScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { patient, household } = useAuthStore();
  const [insight, setInsight] = useState<InsightData | null>(null);

  const styles = useStyles();

  const patientName = patient?.name || 'your loved one';

  // Fetch insight on mount
  useEffect(() => {
    if (!household?.id) return;
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) return;

    fetch(`${apiBaseUrl}/api/ai/coach/insight?householdId=${household.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.insight) setInsight(data.insight);
      })
      .catch(() => {/* ignore */});
  }, [household?.id]);

  const navigateToConversation = (type: string, context: string, firstMessage: string) => {
    router.push({
      pathname: '/coach-conversation',
      params: {
        conversationType: type,
        conversationContext: context,
        initialMessage: firstMessage,
      },
    });
  };

  const handleSituation = (key: string) => {
    const prompt = t(`caregiverApp.coach.situationPrompts.${key}`, { name: patientName });
    navigateToConversation('situation', key, prompt);
  };

  const handleWorkflow = (key: string) => {
    const prompt = t(`caregiverApp.coach.workflowPrompts.${key}`, { name: patientName });
    navigateToConversation('workflow', key, prompt);
  };

  const handleInsightDiscuss = (insightText: string) => {
    const prompt = t('caregiverApp.coach.insightDiscussPrompt', { insight: insightText });
    navigateToConversation('open', 'insight_discussion', prompt);
  };

  const handleOpenChat = (message: string) => {
    navigateToConversation('open', 'free_chat', message);
  };

  if (!household) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('caregiverApp.coach.title')}</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {t('caregiverApp.coach.completeOnboarding')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('caregiverApp.coach.title')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProactiveInsightCard
          insight={insight}
          patientName={patientName}
          onDiscuss={handleInsightDiscuss}
        />

        <View style={styles.section}>
          <SituationCards onSelect={handleSituation} />
        </View>

        {/* Behaviour Playbooks Link */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('caregiverApp.coach.tabs.behaviours')}</Text>
          <Text style={styles.sectionSubLabel}>{t('caregiverApp.toolkit.behaviours.playbooks.subtitle')}</Text>
          <TouchableOpacity
            style={styles.behaviourLink}
            onPress={() => router.push('/behaviours')}
            activeOpacity={0.7}
          >
            <Text style={styles.behaviourLinkIcon}>📋</Text>
            <Text style={styles.behaviourLinkText}>
              {t('caregiverApp.toolkit.behaviours.playbooks.title')}
            </Text>
            <Text style={styles.behaviourLinkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Resources & Guides Link */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('caregiverApp.coach.tabs.resources')}</Text>
          <Text style={styles.sectionSubLabel}>{t('caregiverApp.coach.resources.subtitle')}</Text>
          <TouchableOpacity
            style={styles.behaviourLink}
            onPress={() => router.push('/resources')}
            activeOpacity={0.7}
          >
            <Text style={styles.behaviourLinkIcon}>📚</Text>
            <Text style={styles.behaviourLinkText}>
              {t('caregiverApp.coach.resources.linkLabel')}
            </Text>
            <Text style={styles.behaviourLinkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <WorkflowCards onSelect={handleWorkflow} />
        </View>

        <View style={styles.section}>
          <OpenChatInput patientName={patientName} onSubmit={handleOpenChat} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.displayMedium,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: SPACING[6],
  },
  section: {
    // gap between sections is handled by scrollContent gap
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.displayMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 2,
  },
  sectionSubLabel: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    marginBottom: SPACING[3],
  },
  behaviourLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand500,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
    gap: SPACING[3],
  },
  behaviourLinkIcon: {
    fontSize: 24,
  },
  behaviourLinkText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  behaviourLinkArrow: {
    fontSize: 22,
    color: colors.textMuted,
  },
  placeholder: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textMuted,
  },
}));
