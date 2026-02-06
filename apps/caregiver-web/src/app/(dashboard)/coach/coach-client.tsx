'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserClient } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface CarePlanSuggestion {
  action: 'add' | 'update';
  category: string;
  title: string;
  hint?: string;
  time?: string;
}

interface DoctorNote {
  note: string;
}

interface CoachClientProps {
  householdId: string;
  patientName: string;
  caregiverName: string;
  initialConversationId?: string;
}

function parseAIResponse(content: string): {
  cleanContent: string;
  carePlanSuggestions: CarePlanSuggestion[];
  doctorNotes: DoctorNote[];
} {
  const carePlanSuggestions: CarePlanSuggestion[] = [];
  const doctorNotes: DoctorNote[] = [];

  const planRegex = /\[CARE_PLAN_SUGGESTION\]([\s\S]*?)\[\/CARE_PLAN_SUGGESTION\]/g;
  let match;
  while ((match = planRegex.exec(content)) !== null) {
    try {
      carePlanSuggestions.push(JSON.parse(match[1].trim()));
    } catch (e) {
      // Failed to parse care plan suggestion
    }
  }

  const noteRegex = /\[DOCTOR_NOTE\]([\s\S]*?)\[\/DOCTOR_NOTE\]/g;
  while ((match = noteRegex.exec(content)) !== null) {
    try {
      doctorNotes.push(JSON.parse(match[1].trim()));
    } catch (e) {
      // Failed to parse doctor note
    }
  }

  const cleanContent = content
    .replace(/\[CARE_PLAN_SUGGESTION\][\s\S]*?\[\/CARE_PLAN_SUGGESTION\]/g, '')
    .replace(/\[DOCTOR_NOTE\][\s\S]*?\[\/DOCTOR_NOTE\]/g, '')
    .trim();

  return { cleanContent, carePlanSuggestions, doctorNotes };
}

export default function CoachClient({
  householdId,
  patientName,
  caregiverName,
  initialConversationId,
}: CoachClientProps) {
  const { t } = useTranslation();
  const supabase = createBrowserClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialConversationId) {
      const loadConversation = async () => {
        const { data } = await supabase
          .from('ai_conversations')
          .select('messages')
          .eq('id', initialConversationId)
          .single();

        if (data?.messages) {
          setMessages(data.messages as Message[]);
        }
      };
      loadConversation();
    }
  }, [initialConversationId, supabase]);

  const sendMessage = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();

      const trimmedInput = input.trim();
      if (!trimmedInput || isLoading) return;

      setError(null);
      setIsLoading(true);
      setInput('');

      const userMessage: Message = {
        role: 'user',
        content: trimmedInput,
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
            message: trimmedInput,
            conversationId,
            householdId,
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
              if (parsed.text) {
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
        inputRef.current?.focus();
      }
    },
    [input, isLoading, conversationId, householdId]
  );

  const handleAddToPlan = async (suggestion: CarePlanSuggestion) => {
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

  const handleAddDoctorNote = async (note: DoctorNote) => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedPrompts = [
    t('caregiverApp.coach.suggestions.stayEngaged', { name: patientName }),
    t('caregiverApp.coach.suggestions.sundowning'),
    t('caregiverApp.coach.suggestions.agitated', { name: patientName }),
    t('caregiverApp.coach.suggestions.repetitive'),
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4 pr-1">
        {messages.length === 0 ? (
          /* ─── Empty state with warmth ─── */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100/60 dark:bg-brand-100/20 flex items-center justify-center mb-5">
              <span className="text-3xl">🤗</span>
            </div>
            <h2 className="text-xl font-display font-bold text-text-primary mb-2">
              {t('caregiverApp.coach.hiName', { name: caregiverName })}
            </h2>
            <p className="text-text-secondary mb-8 max-w-md leading-relaxed">
              {t('caregiverApp.coach.introDesc', { name: patientName })}
            </p>
            <div className="w-full max-w-md space-y-2">
              <p className="section-label mb-3 text-center">{t('caregiverApp.coach.tryAsking')}</p>
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="block w-full text-left px-4 py-3 card-paper card-interactive text-sm text-text-secondary hover:text-text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const { cleanContent, carePlanSuggestions, doctorNotes } =
              message.role === 'assistant'
                ? parseAIResponse(message.content)
                : { cleanContent: message.content, carePlanSuggestions: [], doctorNotes: [] };

            return (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div className={`max-w-[75%] ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  {message.role === 'assistant' && (
                    <div className="relative z-10 flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-100/30 flex items-center justify-center">
                        <span className="text-xs">🤗</span>
                      </span>
                      <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 font-display">
                        {t('caregiverApp.coach.careCoach')}
                      </span>
                    </div>
                  )}
                  <div
                    className={`relative z-10 whitespace-pre-wrap text-sm leading-relaxed ${
                      message.role === 'assistant' ? 'text-text-primary' : 'text-white'
                    }`}
                  >
                    {cleanContent || (isLoading && index === messages.length - 1 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </span>
                    ) : null)}
                  </div>

                  {/* Care Plan Suggestions */}
                  {carePlanSuggestions.length > 0 && (
                    <div className="relative z-10 mt-3 space-y-2">
                      {carePlanSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddToPlan(suggestion)}
                          className="flex items-center gap-2 w-full px-3 py-2.5 bg-brand-50 dark:bg-brand-50/20 border border-brand-200 dark:border-brand-200/30 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-100/20 transition-colors text-left"
                        >
                          <span>📋</span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-brand-700 dark:text-brand-200">
                              {t('caregiverApp.coach.addToCarePlan')}
                            </p>
                            <p className="text-xs text-brand-600 dark:text-brand-300">
                              {suggestion.title}
                            </p>
                          </div>
                          <span className="text-brand-600 dark:text-brand-300 font-bold">+</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Doctor Notes */}
                  {doctorNotes.length > 0 && (
                    <div className="relative z-10 mt-3 space-y-2">
                      {doctorNotes.map((note, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddDoctorNote(note)}
                          className="flex items-center gap-2 w-full px-3 py-2.5 bg-status-amber-bg border border-status-amber/20 rounded-xl hover:opacity-80 transition-opacity text-left"
                        >
                          <span>📝</span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-status-amber">
                              {t('caregiverApp.coach.saveForDoctorVisit')}
                            </p>
                            <p className="text-xs text-status-amber/80">{note.note}</p>
                          </div>
                          <span className="text-status-amber font-bold">+</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Error ─── */}
      {error && (
        <div className="mb-3 p-3 bg-status-danger-bg border border-status-danger/20 rounded-2xl">
          <p className="text-sm text-status-danger">{error}</p>
        </div>
      )}

      {/* ─── Input Form ─── */}
      <form onSubmit={sendMessage} className="flex gap-3 items-end pt-3 border-t border-surface-border">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('caregiverApp.coach.askAboutPlaceholder', { name: patientName })}
            rows={1}
            className="input-warm w-full pr-12 resize-none"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary px-5 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
            </span>
          ) : (
            t('common.send')
          )}
        </button>
      </form>

      {/* ─── Disclaimer ─── */}
      <p className="mt-2 text-[11px] text-text-muted text-center">
        {t('caregiverApp.coach.disclaimer')}
      </p>
    </div>
  );
}
