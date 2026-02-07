'use client';

import { useState, useRef, useCallback, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';
import { hasReachedAIMessageLimit, FREE_LIMITS } from '@ourturn/shared/utils/subscription';
import { UpgradeBanner } from '@/components/upgrade-gate';
import type { ConversationType } from '@ourturn/shared/types/ai';
import ChatMessages, { parseAIResponse } from './components/chat-messages';
import ChatInput from './components/chat-input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface CoachConversationProps {
  householdId: string;
  patientName: string;
  subscriptionStatus: string;
  conversationType: ConversationType;
  conversationContext: string;
  initialMessage: string;
  onBack: () => void;
}

export default function CoachConversation({
  householdId,
  patientName,
  subscriptionStatus,
  conversationType,
  conversationContext,
  initialMessage,
  onBack,
}: CoachConversationProps) {
  const { t } = useTranslation();
  const supabase = createBrowserClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const hasSentInitial = useRef(false);

  const household = { subscription_status: subscriptionStatus as 'free' | 'plus' | 'cancelled' };
  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const messageLimitReached = hasReachedAIMessageLimit(household, userMessageCount);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      const userMessage: Message = {
        role: 'user',
        content: messageText.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', timestamp: new Date().toISOString() },
      ]);

      try {
        const response = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText.trim(),
            conversationId,
            householdId,
            conversationType,
            conversationContext,
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No response body');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) { setError(parsed.error); break; }
              if (parsed.conversationId) setConversationId(parsed.conversationId);
              if (parsed.replace && parsed.text) {
                // Safety post-processing replaced the entire response
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage.role === 'assistant') lastMessage.content = parsed.text;
                  return updated;
                });
              } else if (parsed.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage.role === 'assistant') lastMessage.content += parsed.text;
                  return updated;
                });
              }
            } catch (e) { /* ignore partial chunks */ }
          }
        }
      } catch (err) {
        setError(t('caregiverApp.coach.failedResponse'));
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, householdId, conversationType, conversationContext, isLoading, t]
  );

  // Auto-send the initial message on mount
  useEffect(() => {
    if (!hasSentInitial.current && initialMessage) {
      hasSentInitial.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage, sendMessage]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      const msg = input.trim();
      setInput('');
      sendMessage(msg);
    }
  };

  const handleAddToPlan = async (suggestion: any) => {
    try {
      const { error } = await supabase.from('care_plan_tasks').insert({
        household_id: householdId,
        category: suggestion.category,
        title: suggestion.title,
        hint_text: suggestion.hint,
        time: suggestion.time || '12:00',
        recurrence: 'daily',
        recurrence_days: [],
        active: true,
      });
      if (error) throw error;
      alert(t('caregiverApp.coach.taskAddedToPlan'));
    } catch (err) {
      alert(t('caregiverApp.coach.taskAddFailed'));
    }
  };

  const handleAddDoctorNote = async (note: any) => {
    try {
      const { error } = await supabase.from('care_journal_entries').insert({
        household_id: householdId,
        content: `[For Doctor] ${note.note}`,
        entry_type: 'observation',
      });
      if (error) throw error;
      alert(t('caregiverApp.coach.noteSavedForDoctor'));
    } catch (err) {
      alert(t('caregiverApp.coach.noteSaveFailed'));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 mb-3 self-start"
      >
        <span>&larr;</span>
        {t('caregiverApp.coach.hub.backToHub')}
      </button>

      {/* Messages */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        onAddToPlan={handleAddToPlan}
        onAddDoctorNote={handleAddDoctorNote}
      />

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 bg-status-danger-bg border border-status-danger/20 rounded-2xl">
          <p className="text-sm text-status-danger">{error}</p>
        </div>
      )}

      {/* Upgrade Banner */}
      {messageLimitReached && (
        <div className="pt-3">
          <UpgradeBanner message={t('subscription.limits.aiMessageLimitReached', { max: FREE_LIMITS.aiMessages })} />
        </div>
      )}

      {/* Input Form */}
      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        disabled={messageLimitReached}
        placeholder={t('caregiverApp.coach.askAboutPlaceholder', { name: patientName })}
        onSubmit={handleSubmit}
      />

      {/* Disclaimer */}
      <p className="mt-2 text-[11px] text-text-muted text-center">
        {t('caregiverApp.coach.disclaimer')}
      </p>
    </div>
  );
}
