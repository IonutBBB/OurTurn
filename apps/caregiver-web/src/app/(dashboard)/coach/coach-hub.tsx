'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ConversationType } from '@ourturn/shared/types/ai';
import ProactiveInsightCard from './components/proactive-insight-card';
import SituationCards from './components/situation-cards';
import WorkflowCards from './components/workflow-cards';

import OpenChatInput from './components/open-chat-input';

interface InsightData {
  text: string;
  suggestion: string;
  category: 'positive' | 'attention' | 'suggestion';
}


interface CoachHubProps {
  householdId: string;
  patientName: string;
  subscriptionStatus: string;
  onStartConversation: (type: ConversationType, context: string, firstMessage: string) => void;
}

export default function CoachHub({
  householdId,
  patientName,
  subscriptionStatus,
  onStartConversation,
}: CoachHubProps) {
  const { t } = useTranslation();
  const [insight, setInsight] = useState<InsightData | null>(null);

  useEffect(() => {
    fetch(`/api/ai/coach/insight?householdId=${householdId}`)
      .then(res => res.json())
      .then(data => {
        if (data.insight) setInsight(data.insight);
      })
      .catch(() => {/* ignore */});
  }, [householdId]);

  const handleSituation = (key: string) => {
    const prompt = t(`caregiverApp.coach.situationPrompts.${key}`, { name: patientName });
    onStartConversation('situation', key, prompt);
  };

  const handleWorkflow = (key: string) => {
    const prompt = t(`caregiverApp.coach.workflowPrompts.${key}`, { name: patientName });
    onStartConversation('workflow', key, prompt);
  };

  const handleInsightDiscuss = (insightText: string) => {
    const prompt = t('caregiverApp.coach.insightDiscussPrompt', { insight: insightText });
    onStartConversation('open', 'insight_discussion', prompt);
  };

  const handleOpenChat = (message: string) => {
    onStartConversation('open', 'free_chat', message);
  };

  return (
    <div className="space-y-6">
      <ProactiveInsightCard
        insight={insight}
        patientName={patientName}
        onDiscuss={handleInsightDiscuss}
      />
      <SituationCards onSelect={handleSituation} />
      <WorkflowCards onSelect={handleWorkflow} />
      <OpenChatInput
        patientName={patientName}
        onSubmit={handleOpenChat}
      />
    </div>
  );
}
