'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
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

// Parse AI response for special blocks
function parseAIResponse(content: string): {
  cleanContent: string;
  carePlanSuggestions: CarePlanSuggestion[];
  doctorNotes: DoctorNote[];
} {
  const carePlanSuggestions: CarePlanSuggestion[] = [];
  const doctorNotes: DoctorNote[] = [];

  // Extract care plan suggestions
  const planRegex = /\[CARE_PLAN_SUGGESTION\]([\s\S]*?)\[\/CARE_PLAN_SUGGESTION\]/g;
  let match;
  while ((match = planRegex.exec(content)) !== null) {
    try {
      carePlanSuggestions.push(JSON.parse(match[1].trim()));
    } catch (e) {
      console.error('Failed to parse care plan suggestion:', e);
    }
  }

  // Extract doctor notes
  const noteRegex = /\[DOCTOR_NOTE\]([\s\S]*?)\[\/DOCTOR_NOTE\]/g;
  while ((match = noteRegex.exec(content)) !== null) {
    try {
      doctorNotes.push(JSON.parse(match[1].trim()));
    } catch (e) {
      console.error('Failed to parse doctor note:', e);
    }
  }

  // Clean content (remove blocks for display)
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history
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

  // Send message
  const sendMessage = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();

      const trimmedInput = input.trim();
      if (!trimmedInput || isLoading) return;

      setError(null);
      setIsLoading(true);
      setInput('');

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: trimmedInput,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Add placeholder for assistant
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', timestamp: new Date().toISOString() },
      ]);

      try {
        const response = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: trimmedInput,
            conversationId,
            householdId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                setError(parsed.error);
                break;
              }

              if (parsed.conversationId) {
                setConversationId(parsed.conversationId);
              }

              if (parsed.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage.role === 'assistant') {
                    lastMessage.content += parsed.text;
                  }
                  return updated;
                });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      } catch (err) {
        console.error('Chat error:', err);
        setError('Failed to get a response. Please try again.');
        // Remove the placeholder message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, isLoading, conversationId, householdId]
  );

  // Handle adding care plan suggestion
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
      alert('Task added to care plan!');
    } catch (err) {
      console.error('Failed to add task:', err);
      alert('Failed to add task. Please try again.');
    }
  };

  // Handle adding doctor note
  const handleAddDoctorNote = async (note: DoctorNote) => {
    try {
      const { error } = await supabase.from('care_journal_entries').insert({
        household_id: householdId,
        content: `[For Doctor] ${note.note}`,
        entry_type: 'observation',
      });

      if (error) throw error;
      alert('Note saved for doctor visit!');
    } catch (err) {
      console.error('Failed to save note:', err);
      alert('Failed to save note. Please try again.');
    }
  };

  // Handle key press (submit on Enter, newline on Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Suggested prompts for empty state
  const suggestedPrompts = [
    `How can I help ${patientName} stay engaged during the day?`,
    'What activities work well for sundowning?',
    `${patientName} seems agitated in the evenings. What can I do?`,
    'How do I handle repetitive questions without getting frustrated?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💙</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Hi {caregiverName}!
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              I&apos;m here to help you care for {patientName}. Ask me anything
              about daily care, activities, or managing challenging situations.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-text-muted mb-3">Try asking:</p>
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="block w-full max-w-md mx-auto text-left px-4 py-3 bg-surface-card border border-surface-border rounded-lg hover:bg-brand-50 hover:border-brand-200 transition-colors"
                >
                  <span className="text-text-secondary">{prompt}</span>
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
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-card border border-surface-border'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💙</span>
                      <span className="text-sm font-medium text-brand-700">
                        Care Coach
                      </span>
                    </div>
                  )}
                  <div
                    className={`whitespace-pre-wrap ${
                      message.role === 'assistant'
                        ? 'text-text-primary'
                        : 'text-white'
                    }`}
                  >
                    {cleanContent || (isLoading && index === messages.length - 1 ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200" />
                      </span>
                    ) : null)}
                  </div>

                  {/* Care Plan Suggestions */}
                  {carePlanSuggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {carePlanSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddToPlan(suggestion)}
                          className="flex items-center gap-2 w-full px-3 py-2 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors text-left"
                        >
                          <span>📋</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-brand-700">
                              Add to Care Plan
                            </p>
                            <p className="text-xs text-brand-600">
                              {suggestion.title}
                            </p>
                          </div>
                          <span className="text-brand-600">+</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Doctor Notes */}
                  {doctorNotes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {doctorNotes.map((note, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddDoctorNote(note)}
                          className="flex items-center gap-2 w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-left"
                        >
                          <span>📝</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-700">
                              Save for Doctor Visit
                            </p>
                            <p className="text-xs text-amber-600">{note.note}</p>
                          </div>
                          <span className="text-amber-600">+</span>
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about caring for ${patientName}...`}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-surface-border rounded-xl bg-surface-card text-text-primary placeholder-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200" />
            </span>
          ) : (
            'Send'
          )}
        </button>
      </form>

      {/* Disclaimer */}
      <p className="mt-3 text-xs text-text-muted text-center">
        Care Coach provides general guidance only. Always consult healthcare
        professionals for medical advice.
      </p>
    </div>
  );
}
