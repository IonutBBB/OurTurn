'use client';

import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';

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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export function parseAIResponse(content: string): {
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
      console.warn('Failed to parse care plan suggestion:', e);
    }
  }

  const noteRegex = /\[DOCTOR_NOTE\]([\s\S]*?)\[\/DOCTOR_NOTE\]/g;
  while ((match = noteRegex.exec(content)) !== null) {
    try {
      doctorNotes.push(JSON.parse(match[1].trim()));
    } catch (e) {
      console.warn('Failed to parse doctor note:', e);
    }
  }

  const cleanContent = content
    .replace(/\[CARE_PLAN_SUGGESTION\][\s\S]*?\[\/CARE_PLAN_SUGGESTION\]/g, '')
    .replace(/\[DOCTOR_NOTE\][\s\S]*?\[\/DOCTOR_NOTE\]/g, '')
    .trim();

  return { cleanContent, carePlanSuggestions, doctorNotes };
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onAddToPlan: (suggestion: CarePlanSuggestion) => void;
  onAddDoctorNote: (note: DoctorNote) => void;
}

export default function ChatMessages({
  messages,
  isLoading,
  onAddToPlan,
  onAddDoctorNote,
}: ChatMessagesProps) {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-5 pb-4 pr-1">
      {messages.map((message, index) => {
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
                    <span className="text-xs">{'\u{1F917}'}</span>
                  </span>
                  <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 font-display">
                    {t('caregiverApp.coach.careCoach')}
                  </span>
                </div>
              )}
              <div
                className={`relative z-10 text-sm leading-relaxed ${
                  message.role === 'assistant' ? 'text-text-primary' : 'text-white whitespace-pre-wrap'
                }`}
              >
                {cleanContent ? (
                  message.role === 'assistant' ? (
                    <Markdown
                      components={{
                        h2: ({ children }) => (
                          <h2 className="text-base font-semibold font-display text-text-primary mt-4 mb-2 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-semibold text-text-primary mt-3 mb-1.5">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside pl-5 mb-2 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside pl-5 mb-2 space-y-1">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="pl-0.5">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-text-primary">{children}</strong>
                        ),
                        hr: () => (
                          <hr className="my-3 border-surface-border" />
                        ),
                      }}
                    >
                      {cleanContent}
                    </Markdown>
                  ) : (
                    cleanContent
                  )
                ) : (isLoading && index === messages.length - 1 ? (
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
                      onClick={() => onAddToPlan(suggestion)}
                      className="flex items-center gap-2 w-full px-3 py-2.5 bg-brand-50 dark:bg-brand-50/20 border border-brand-200 dark:border-brand-200/30 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-100/20 transition-colors text-left"
                    >
                      <span>{'\u{1F4CB}'}</span>
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
                      onClick={() => onAddDoctorNote(note)}
                      className="flex items-center gap-2 w-full px-3 py-2.5 bg-status-amber-bg border border-status-amber/20 rounded-xl hover:opacity-80 transition-opacity text-left"
                    >
                      <span>{'\u{1F4DD}'}</span>
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
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
