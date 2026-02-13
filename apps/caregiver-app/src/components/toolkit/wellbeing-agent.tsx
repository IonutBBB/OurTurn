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
import i18n from '../../i18n';
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
      const geminiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
      if (!geminiKey) throw new Error('Gemini API key not configured');

      const { energy: e, stress: s, sleep: sl } = checkinRef.current;

      // Build system prompt
      const energyVal = e ?? 'unknown';
      const stressVal = s ?? 'unknown';
      const sleepVal = sl ?? 'unknown';

      let systemPrompt = `You are the OurTurn Care Wellbeing Companion for ${caregiverName}, who is a family caregiver for someone living with dementia.

TODAY'S CHECK-IN:
- Energy: ${energyVal}/5 (1=exhausted, 5=energized)
- Stress: ${stressVal}/5 (1=calm, 5=overwhelmed)
- Sleep quality: ${sleepVal}/5 (1=terrible, 5=great)

WHO YOU ARE:
You are like a wise, compassionate friend who deeply understands caregiving. You speak with warmth and honesty.

HOW TO HELP:
- LISTEN FIRST. Respond to what they actually said.
- VALIDATE genuinely. Not robotic. More like "That sounds exhausting, and honestly, anyone in your shoes would feel the same."
- OFFER REAL WISDOM when appropriate — insights about the caregiving journey.
- When they ask for help, offer PRACTICAL SUPPORT: a specific technique, a perspective reframe, or permission to lower standards today.

RESPONSE LENGTH: 3-6 sentences. Like a friend texting.

ABSOLUTE RULES:
1. NEVER discuss the patient's condition — redirect to "The Care Coach in the Coach tab is great for that."
2. NEVER diagnose or use clinical terms
3. NEVER recommend medication changes
4. Use ${caregiverName}'s name occasionally, not every message
5. Vary your responses — never repeat the same advice twice

TONE: Warm, real, grounded. Like a late-night conversation with someone who gets it.`;

      // Language instruction
      const locale = i18n.language;
      const langNames: Record<string, string> = {
        ro: 'Romanian', de: 'German', fr: 'French', es: 'Spanish', it: 'Italian',
        pt: 'Portuguese', nl: 'Dutch', pl: 'Polish', el: 'Greek', cs: 'Czech',
        hu: 'Hungarian', sv: 'Swedish', da: 'Danish', fi: 'Finnish', bg: 'Bulgarian',
        hr: 'Croatian', sk: 'Slovak', sl: 'Slovenian', lt: 'Lithuanian', lv: 'Latvian',
        et: 'Estonian', ga: 'Irish', mt: 'Maltese',
      };
      const targetLang = locale !== 'en' ? langNames[locale] : null;
      if (targetLang) {
        systemPrompt += `\n\nIMPORTANT: You MUST respond entirely in ${targetLang}. All your text must be in ${targetLang}.`;
      }

      // Transform auto messages into natural language
      let userMessage = text;
      if (text === '[AUTO_GREETING]') {
        const stressHigh = s != null && s >= 4;
        const energyLow = e != null && e <= 2;
        const sleepPoor = sl != null && sl <= 2;
        const doingWell = !stressHigh && !energyLow && !sleepPoor;

        if (stressHigh && sleepPoor) userMessage = `Hey. Rough day — I'm really stressed and barely slept.`;
        else if (stressHigh && energyLow) userMessage = `I'm overwhelmed and I have nothing left in the tank today.`;
        else if (stressHigh) userMessage = `I'm carrying a lot of stress today. Some days it just hits harder.`;
        else if (energyLow && sleepPoor) userMessage = `I'm so tired. Didn't sleep and I still have to get through the whole day.`;
        else if (energyLow) userMessage = `Running on empty today. Everything takes extra effort.`;
        else if (sleepPoor) userMessage = `Didn't sleep well. I'm functional but my head feels foggy.`;
        else if (doingWell) userMessage = `Hi. Actually having a decent day today, which feels rare.`;
        else userMessage = `Hey, just checking in. It's been a mixed kind of day.`;
      } else if (text === '[CHECKIN_UPDATED]') {
        const stressHigh = s != null && s >= 4;
        const energyLow = e != null && e <= 2;
        if (stressHigh) userMessage = `Things are feeling heavier now. The stress is really building up.`;
        else if (energyLow) userMessage = `I'm fading. The energy just isn't there anymore today.`;
        else userMessage = `Things shifted a bit since we last talked. Feeling a little different.`;
      }

      // Build conversation history
      const history = messagesRef.current
        .filter(m => m.content.trim() !== '')
        .slice(-6)
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
      // Ensure history starts with user role (Gemini requirement)
      const firstUserIdx = history.findIndex(m => m.role === 'user');
      const cleanHistory = firstUserIdx >= 0 ? history.slice(firstUserIdx) : [];

      // Add current message
      cleanHistory.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: cleanHistory,
            generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) throw new Error('Request failed');

      const result = await response.json();
      const fullResponse = (result.candidates?.[0]?.content?.parts || [])
        .map((p: { text?: string }) => p.text || '')
        .join('');

      if (!fullResponse) throw new Error('Empty response');

      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId ? { ...m, content: fullResponse } : m
      ));
    } catch (err) {
      if (controller.signal.aborted) return;
      if (__DEV__) console.error('Wellbeing agent error:', err);
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
  }, [t, caregiverName]);

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
