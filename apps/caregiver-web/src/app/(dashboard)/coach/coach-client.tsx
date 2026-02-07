'use client';

import { useState } from 'react';
import type { ConversationType } from '@ourturn/shared/types/ai';
import CoachHub from './coach-hub';
import CoachConversation from './coach-conversation';

interface CoachClientProps {
  householdId: string;
  patientName: string;
  caregiverName: string;
  initialConversationId?: string;
  subscriptionStatus: string;
}

interface ActiveConversation {
  type: ConversationType;
  context: string;
  initialMessage: string;
}

export default function CoachClient({
  householdId,
  patientName,
  caregiverName,
  initialConversationId,
  subscriptionStatus,
}: CoachClientProps) {
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(null);

  const handleStartConversation = (type: ConversationType, context: string, firstMessage: string) => {
    setActiveConversation({ type, context, initialMessage: firstMessage });
  };

  const handleBack = () => {
    setActiveConversation(null);
  };

  if (activeConversation) {
    return (
      <CoachConversation
        householdId={householdId}
        patientName={patientName}
        subscriptionStatus={subscriptionStatus}
        conversationType={activeConversation.type}
        conversationContext={activeConversation.context}
        initialMessage={activeConversation.initialMessage}
        onBack={handleBack}
      />
    );
  }

  return (
    <CoachHub
      householdId={householdId}
      patientName={patientName}
      subscriptionStatus={subscriptionStatus}
      onStartConversation={handleStartConversation}
    />
  );
}
