import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import type { SliderValue } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS } from '../../theme';

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
  apiBaseUrl: string;
}

let msgCounter = 0;
function nextMsgId() {
  return `msg-${++msgCounter}`;
}

export function WellbeingAgent({ caregiverId, caregiverName, energy, stress, sleep, apiBaseUrl }: WellbeingAgentProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const greetedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const prevCheckinRef = useRef(`${energy}-${stress}-${sleep}`);
  const messagesRef = useRef<Message[]>([]);
  const checkinRef = useRef({ energy, stress, sleep });

  messagesRef.current = messages;
  checkinRef.current = { energy, stress, sleep };

  const hasCheckin = energy != null || stress != null || sleep != null;

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setIsLoading(true);

    const isSystemMessage = text === '[AUTO_GREETING]' || text === '[CHECKIN_UPDATED]';
    const assistantMsgId = nextMsgId();

    setMessages(prev => {
      const cleaned = prev.filter(m => !(m.role === 'assistant' && m.content === ''));
      const next = isSystemMessage
        ? cleaned
        : [...cleaned, { id: nextMsgId(), role: 'user' as const, content: text }];
      return [...next, { id: assistantMsgId, role: 'assistant' as const, content: '' }];
    });

    try {
      const { energy: e, stress: s, sleep: sl } = checkinRef.current;
      const history = messagesRef.current
        .filter(m => m.content.trim() !== '')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${apiBaseUrl}/api/ai/wellbeing-agent`, {
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

      let sseBuffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (controller.signal.aborted) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const events = sseBuffer.split('\n\n');
        sseBuffer = events.pop() || '';

        for (const event of events) {
          const lines = event.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setError(parsed.error);
                break;
              }
              if (parsed.replace && parsed.text) {
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: parsed.text }
                    : m
                ));
              } else if (parsed.text) {
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
  }, [t, apiBaseUrl]);

  // Auto-greet once
  useEffect(() => {
    if (hasCheckin && !greetedRef.current) {
      greetedRef.current = true;
      sendMessage('[AUTO_GREETING]');
    }
  }, [hasCheckin, sendMessage]);

  // Debounced checkin-updated
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const key = `${energy}-${stress}-${sleep}`;
    if (prevCheckinRef.current !== key && hasCheckin && greetedRef.current) {
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

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    Keyboard.dismiss();
    sendMessage(trimmed);
  };

  const handlePromptClick = (label: string) => {
    setInput('');
    sendMessage(label);
  };

  const displayMessages = messages.slice(-10);

  const markdownStyles = StyleSheet.create({
    body: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: FONTS.body,
      color: colors.textPrimary,
    },
    heading2: {
      fontSize: 15,
      fontWeight: '600',
      fontFamily: FONTS.bodySemiBold,
      color: colors.textPrimary,
      marginTop: 8,
      marginBottom: 4,
    },
    heading3: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: FONTS.bodySemiBold,
      color: colors.textPrimary,
      marginTop: 6,
      marginBottom: 3,
    },
    paragraph: {
      marginBottom: 6,
    },
    bullet_list: {
      marginBottom: 6,
    },
    ordered_list: {
      marginBottom: 6,
    },
    list_item: {
      marginBottom: 3,
    },
    strong: {
      fontWeight: '700',
      fontFamily: FONTS.bodyBold,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: 8,
    },
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>💛</Text>
          </View>
          <Text style={styles.title}>{t('caregiverApp.toolkit.agent.title')}</Text>
        </View>
        <TouchableOpacity onPress={() => setExpanded(e => !e)}>
          <Text style={styles.expandText}>
            {expanded
              ? t('caregiverApp.toolkit.agent.collapse')
              : t('caregiverApp.toolkit.agent.expand')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={[styles.messagesContainer, expanded && styles.messagesExpanded]}
        contentContainerStyle={styles.messagesContent}
      >
        {displayMessages.length === 0 && !isLoading ? (
          <Text style={styles.greetingText}>{t('caregiverApp.toolkit.agent.greeting')}</Text>
        ) : (
          displayMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {msg.content ? (
                msg.role === 'assistant' ? (
                  <Markdown style={markdownStyles}>{msg.content}</Markdown>
                ) : (
                  <Text style={[styles.bubbleText, styles.userBubbleText]}>
                    {msg.content}
                  </Text>
                )
              ) : isLoading ? (
                <Text style={styles.bubbleText}>...</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      {/* Suggested Prompts */}
      {messages.length <= 1 && !isLoading && (
        <View style={styles.promptsRow}>
          {suggestedPrompts().map(p => (
            <TouchableOpacity
              key={p.key}
              style={styles.promptChip}
              onPress={() => handlePromptClick(p.label)}
            >
              <Text style={styles.promptText} numberOfLines={1}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t('caregiverApp.toolkit.agent.placeholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          editable={!isLoading}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim() || isLoading}
        >
          <Text style={styles.sendText}>{t('common.send')}</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>{t('caregiverApp.toolkit.agent.disclaimer')}</Text>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  card: {
    backgroundColor: colors.brand50,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.brand200,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.brand100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: colors.brand800,
  },
  expandText: {
    fontSize: 12,
    color: colors.brand600,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
  },
  messagesContainer: {
    maxHeight: 250,
  },
  messagesExpanded: {
    maxHeight: 400,
  },
  messagesContent: {
    gap: 8,
    paddingBottom: 4,
  },
  greetingText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
    fontFamily: FONTS.body,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: colors.brand600,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.background,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  promptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  promptChip: {
    backgroundColor: colors.brand100,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  promptText: {
    fontSize: 12,
    color: colors.brand700,
    fontFamily: FONTS.body,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 8,
    fontFamily: FONTS.body,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.brand200,
  },
  sendButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: FONTS.bodySemiBold,
  },
  disclaimer: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: FONTS.body,
  },
}));
