import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import {
  Message,
  CarePlanSuggestion,
  DoctorNote,
  parseAIResponse,
  sendMessageToCoach,
  addCarePlanSuggestion,
  addDoctorNote,
  getSuggestedPrompts,
} from '../services/ai-coach';
import { supabase } from '@ourturn/supabase';

export interface UseAICoachOptions {
  conversationType?: string;
  conversationContext?: string;
  skipLoadLatest?: boolean;
}

export interface UseAICoachReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | undefined;
  suggestedPrompts: string[];
  sendMessage: (message: string) => Promise<void>;
  handleAddToPlan: (suggestion: CarePlanSuggestion) => Promise<boolean>;
  handleAddDoctorNote: (note: DoctorNote) => Promise<boolean>;
  startNewConversation: () => void;
  parseResponse: typeof parseAIResponse;
}

export function useAICoach(options?: UseAICoachOptions): UseAICoachReturn {
  const { household, patient, caregiver } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const patientName = patient?.name || 'your loved one';
  const suggestedPrompts = getSuggestedPrompts(patientName);

  // Load most recent conversation on mount (only for hub/open chat, not focused conversations)
  useEffect(() => {
    if (household?.id && caregiver?.id && !options?.skipLoadLatest) {
      loadLatestConversation();
    }
  }, [household?.id, caregiver?.id]);

  const loadLatestConversation = async () => {
    if (!household?.id || !caregiver?.id) return;

    try {
      const { data } = await supabase
        .from('ai_conversations')
        .select('id, messages')
        .eq('household_id', household.id)
        .eq('caregiver_id', caregiver.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setConversationId(data.id);
        setMessages(data.messages || []);
      }
    } catch (e) {
      // No conversation found, that's ok
    }
  };

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading || !household?.id) return;

      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: message.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Add placeholder for assistant
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', timestamp: new Date().toISOString() },
      ]);

      try {
        await sendMessageToCoach(
          message.trim(),
          conversationId,
          household.id,
          (text) => {
            // Update the assistant message with streaming text
            setMessages((prev) => {
              const updated = [...prev];
              const lastMessage = updated[updated.length - 1];
              if (lastMessage.role === 'assistant') {
                lastMessage.content += text;
              }
              return [...updated];
            });
          },
          (newConversationId) => {
            setConversationId(newConversationId);
          },
          options?.conversationType,
          options?.conversationContext
        );
      } catch (err) {
        if (__DEV__) console.error('Chat error:', err);
        setError('Failed to get a response. Please try again.');
        // Remove the placeholder message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, household?.id, isLoading]
  );

  const handleAddToPlan = useCallback(
    async (suggestion: CarePlanSuggestion): Promise<boolean> => {
      if (!household?.id) return false;

      try {
        await addCarePlanSuggestion(household.id, suggestion);
        return true;
      } catch (err) {
        if (__DEV__) console.error('Failed to add task:', err);
        return false;
      }
    },
    [household?.id]
  );

  const handleAddDoctorNote = useCallback(
    async (note: DoctorNote): Promise<boolean> => {
      if (!household?.id) return false;

      try {
        await addDoctorNote(household.id, note);
        return true;
      } catch (err) {
        if (__DEV__) console.error('Failed to save note:', err);
        return false;
      }
    },
    [household?.id]
  );

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    suggestedPrompts,
    sendMessage,
    handleAddToPlan,
    handleAddDoctorNote,
    startNewConversation,
    parseResponse: parseAIResponse,
  };
}
