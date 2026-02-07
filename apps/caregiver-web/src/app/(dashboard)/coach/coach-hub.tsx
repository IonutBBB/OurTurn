'use client';

import { useState, useEffect } from 'react';
import type { ConversationType } from '@ourturn/shared/types/ai';
import ProactiveInsightCard from './components/proactive-insight-card';
import SituationCards from './components/situation-cards';
import WorkflowCards from './components/workflow-cards';
import TopicCards from './components/topic-cards';
import OpenChatInput from './components/open-chat-input';

interface InsightData {
  text: string;
  suggestion: string;
  category: 'positive' | 'attention' | 'suggestion';
}

// Human-readable labels for situation contexts (used as first message to AI)
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

// Human-readable labels for workflow contexts
const WORKFLOW_PROMPTS: Record<string, string> = {
  plan_tomorrow: "Let's plan a good day for {{name}} tomorrow. What do you suggest based on what's been working?",
  doctor_visit: "I have a doctor visit coming up for {{name}}. Can you help me prepare a summary of how things have been going?",
  review_week: "Let's review how this week went for {{name}}. What patterns do you see?",
  adjust_plan: "I'd like to review {{name}}'s care plan and see what we should change based on how things are going.",
};

// Human-readable labels for topic contexts
const TOPIC_PROMPTS: Record<string, string> = {
  daily_routines: "I'd like to learn about managing daily routines and transitions for {{name}}.",
  communication: "Help me understand better ways to communicate with {{name}}.",
  behaviors: "I want to learn about understanding and managing difficult behaviors for {{name}}.",
  activities: "What activities and engagement ideas would work well for {{name}}?",
  nutrition: "I'd like guidance on nutrition and mealtimes for {{name}}.",
  safety: "Help me think about safety at home for {{name}}.",
  sleep: "I need help with sleep and night-time routines for {{name}}.",
};

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
  const [insight, setInsight] = useState<InsightData | null>(null);

  useEffect(() => {
    fetch(`/api/ai/coach/insight?householdId=${householdId}`)
      .then(res => res.json())
      .then(data => {
        if (data.insight) setInsight(data.insight);
      })
      .catch(() => {/* ignore */});
  }, [householdId]);

  const replacePatientName = (template: string) =>
    template.replace(/\{\{name\}\}/g, patientName);

  const handleSituation = (key: string) => {
    const prompt = replacePatientName(SITUATION_PROMPTS[key] || key);
    onStartConversation('situation', key, prompt);
  };

  const handleWorkflow = (key: string) => {
    const prompt = replacePatientName(WORKFLOW_PROMPTS[key] || key);
    onStartConversation('workflow', key, prompt);
  };

  const handleTopic = (key: string) => {
    const prompt = replacePatientName(TOPIC_PROMPTS[key] || key);
    onStartConversation('topic', key, prompt);
  };

  const handleInsightDiscuss = (insightText: string) => {
    const prompt = `I saw this insight: "${insightText}". Can you tell me more about what this means and what I should do?`;
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
      <TopicCards patientName={patientName} onSelect={handleTopic} />
      <OpenChatInput
        patientName={patientName}
        onSubmit={handleOpenChat}
      />
    </div>
  );
}
