'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { SliderValue } from '@ourturn/shared';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface WellbeingAgentProps {
  caregiverId: string;
  caregiverName: string;
  energy: SliderValue | null | undefined;
  stress: SliderValue | null | undefined;
  sleep: SliderValue | null | undefined;
}

let msgCounter = 0;
function nextMsgId() {
  return `msg-${++msgCounter}`;
}

export function WellbeingAgent({ caregiverId, caregiverName, energy, stress, sleep }: WellbeingAgentProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs for guards and latest values
  const greetedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const prevCheckinRef = useRef(`${energy}-${stress}-${sleep}`);
  const messagesRef = useRef<Message[]>([]);
  const checkinRef = useRef({ energy, stress, sleep });

  messagesRef.current = messages;
  checkinRef.current = { energy, stress, sleep };

  const hasCheckin = energy != null || stress != null || sleep != null;

  // Abort on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestedPrompts = useCallback(() => {
    const prompts: { key: string; label: string }[] = [];

    if (stress != null && stress >= 4) {
      prompts.push({ key: 'overwhelmed', label: t('caregiverApp.toolkit.agent.prompts.overwhelmed') });
      prompts.push({ key: 'calmDown', label: t('caregiverApp.toolkit.agent.prompts.calmDown') });
    }
    if (energy != null && energy <= 2) {
      prompts.push({ key: 'needEnergy', label: t('caregiverApp.toolkit.agent.prompts.needEnergy') });
    }
    if (sleep != null && sleep <= 2) {
      prompts.push({ key: 'poorSleep', label: t('caregiverApp.toolkit.agent.prompts.poorSleep') });
    }

    if (prompts.length < 2) {
      if (!prompts.find(p => p.key === 'needMoment')) {
        prompts.push({ key: 'needMoment', label: t('caregiverApp.toolkit.agent.prompts.needMoment') });
      }
      if (!prompts.find(p => p.key === 'uplifting')) {
        prompts.push({ key: 'uplifting', label: t('caregiverApp.toolkit.agent.prompts.uplifting') });
      }
    }

    return prompts.slice(0, 3);
  }, [energy, stress, sleep, t]);

  const sendMessage = useCallback(async (text: string) => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setIsLoading(true);

    const isSystemMessage = text === '[AUTO_GREETING]' || text === '[CHECKIN_UPDATED]';

    // Each assistant response gets a unique ID so streaming targets only THIS bubble
    const assistantMsgId = nextMsgId();

    setMessages(prev => {
      // Remove any empty assistant placeholders left by aborted requests
      const cleaned = prev.filter(m => !(m.role === 'assistant' && m.content === ''));
      const next = isSystemMessage
        ? cleaned
        : [...cleaned, { id: nextMsgId(), role: 'user' as const, content: text }];
      return [...next, { id: assistantMsgId, role: 'assistant' as const, content: '' }];
    });

    try {
      const { energy: e, stress: s, sleep: sl } = checkinRef.current;
      // Only send messages with content as history
      const history = messagesRef.current
        .filter(m => m.content.trim() !== '')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/ai/wellbeing-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          checkin: { energy: e ?? null, stress: s ?? null, sleep: sl ?? null },
          history,
        }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        setError(t('caregiverApp.toolkit.agent.rateLimited'));
        setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
        return;
      }

      if (!response.ok) throw new Error('Request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (controller.signal.aborted) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setError(parsed.error);
              break;
            }
            if (parsed.text) {
              // Append ONLY to the message with this specific ID
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: m.content + parsed.text }
                  : m
              ));
            }
          } catch {
            /* ignore partial chunks */
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(t('caregiverApp.toolkit.agent.errorMessage'));
      setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [t]);

  // Auto-greet once when check-in data exists
  useEffect(() => {
    if (hasCheckin && !greetedRef.current) {
      greetedRef.current = true;
      sendMessage('[AUTO_GREETING]');
    }
  }, [hasCheckin, sendMessage]);

  // When slider values change after initial greeting, debounce before asking AI
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const key = `${energy}-${stress}-${sleep}`;
    if (prevCheckinRef.current !== key && hasCheckin && greetedRef.current) {
      // Debounce: wait 2s after last slider change before sending
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        sendMessage('[CHECKIN_UPDATED]');
      }, 2000);
    }
    prevCheckinRef.current = key;
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [energy, stress, sleep, hasCheckin, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    sendMessage(trimmed);
  };

  const handlePromptClick = (label: string) => {
    setInput('');
    sendMessage(label);
  };

  const displayMessages = messages.slice(-10);

  return (
    <div className="card-paper p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-100/30 flex items-center justify-center">
            <span className="text-sm">💛</span>
          </span>
          <h3 className="text-sm font-display font-bold text-text-primary">
            {t('caregiverApp.toolkit.agent.title')}
          </h3>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
        >
          {expanded
            ? t('caregiverApp.toolkit.agent.collapse')
            : t('caregiverApp.toolkit.agent.expand')}
        </button>
      </div>

      {/* Messages */}
      <div
        className={`overflow-y-auto space-y-3 transition-all duration-300 ${
          expanded ? 'max-h-[500px]' : 'max-h-[300px]'
        }`}
      >
        {displayMessages.length === 0 && !isLoading ? (
          <p className="text-xs text-text-muted text-center py-4">
            {t('caregiverApp.toolkit.agent.greeting')}
          </p>
        ) : (
          displayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`text-sm leading-relaxed ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <span
                className={`inline-block px-3 py-2 rounded-2xl max-w-[90%] ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-md'
                    : 'bg-surface-secondary dark:bg-surface-secondary text-text-primary rounded-bl-md'
                }`}
              >
                {msg.content || (
                  isLoading ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </span>
                  ) : null
                )}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && !isLoading && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {suggestedPrompts().map(p => (
            <button
              key={p.key}
              onClick={() => handlePromptClick(p.label)}
              className="text-xs px-2.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-50/20 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-100/20 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-status-danger mt-2">{error}</p>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('caregiverApp.toolkit.agent.placeholder')}
          className="input-warm flex-1 text-sm py-2 px-3"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary px-3 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('common.send')}
        </button>
      </form>

      {/* Disclaimer */}
      <p className="text-[10px] text-text-muted text-center mt-2">
        {t('caregiverApp.toolkit.agent.disclaimer')}
      </p>
    </div>
  );
}
