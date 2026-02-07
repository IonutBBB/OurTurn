import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import TopicCards from '../../src/components/coach/topic-cards';
import OpenChatInput from '../../src/components/coach/open-chat-input';
import { COLORS, FONTS, RADIUS, SPACING } from '../../src/theme';

// Human-readable prompts for each situation
const SITUATION_PROMPTS: Record<string, string> = {
  refusing_food: '{{name}} is refusing to eat right now. What should I do?',
  refusing_medication: "{{name}} won't take their medication. I need help right now.",
  agitated: '{{name}} is very agitated right now. How do I help calm things down?',
  not_recognizing: "{{name}} doesn't recognize me right now. It's really hard. What do I do?",
  repetitive_questions: '{{name}} keeps asking the same question over and over. How do I handle this patiently?',
  sundowning: "It's evening and {{name}} is getting really restless and confused. Help me with sundowning.",
  wants_to_leave: '{{name}} wants to leave the house and is insisting on going somewhere. What do I do?',
  caregiver_overwhelmed: "I'm feeling overwhelmed and losing patience right now. I need support.",
};

const WORKFLOW_PROMPTS: Record<string, string> = {
  plan_tomorrow: "Let's plan a good day for {{name}} tomorrow. What do you suggest based on what's been working?",
  doctor_visit: "I have a doctor visit coming up for {{name}}. Can you help me prepare a summary of how things have been going?",
  review_week: "Let's review how this week went for {{name}}. What patterns do you see?",
  adjust_plan: "I'd like to review {{name}}'s care plan and see what we should change based on how things are going.",
};

const TOPIC_PROMPTS: Record<string, string> = {
  daily_routines: "I'd like to learn about managing daily routines and transitions for {{name}}.",
  communication: "Help me understand better ways to communicate with {{name}}.",
  behaviors: "I want to learn about understanding and managing difficult behaviors for {{name}}.",
  activities: "What activities and engagement ideas would work well for {{name}}?",
  nutrition: "I'd like guidance on nutrition and mealtimes for {{name}}.",
  safety: "Help me think about safety at home for {{name}}.",
  sleep: "I need help with sleep and night-time routines for {{name}}.",
};

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

  const replacePatientName = (template: string) =>
    template.replace(/\{\{name\}\}/g, patientName);

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
    const prompt = replacePatientName(SITUATION_PROMPTS[key] || key);
    navigateToConversation('situation', key, prompt);
  };

  const handleWorkflow = (key: string) => {
    const prompt = replacePatientName(WORKFLOW_PROMPTS[key] || key);
    navigateToConversation('workflow', key, prompt);
  };

  const handleTopic = (key: string) => {
    const prompt = replacePatientName(TOPIC_PROMPTS[key] || key);
    navigateToConversation('topic', key, prompt);
  };

  const handleInsightDiscuss = (insightText: string) => {
    const prompt = `I saw this insight: "${insightText}". Can you tell me more about what this means and what I should do?`;
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

        <View style={styles.section}>
          <WorkflowCards onSelect={handleWorkflow} />
        </View>

        <View style={styles.section}>
          <TopicCards patientName={patientName} onSelect={handleTopic} />
        </View>

        <View style={styles.section}>
          <OpenChatInput patientName={patientName} onSubmit={handleOpenChat} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
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
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  sectionSubLabel: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginBottom: SPACING[3],
  },
  behaviourLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand500,
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
    color: COLORS.textPrimary,
  },
  behaviourLinkArrow: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
  placeholder: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
});
