import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../src/stores/auth-store';
import { useAICoach } from '../src/hooks/use-ai-coach';
import type { CarePlanSuggestion, DoctorNote } from '../src/services/ai-coach';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../src/theme';

export default function CoachConversationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    conversationType: string;
    conversationContext: string;
    initialMessage: string;
  }>();

  const { patient } = useAuthStore();
  const patientName = patient?.name || 'your loved one';

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    handleAddToPlan,
    handleAddDoctorNote,
    parseResponse,
  } = useAICoach({
    conversationType: params.conversationType,
    conversationContext: params.conversationContext,
    skipLoadLatest: true,
  });

  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const hasSentInitial = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Auto-send initial message
  useEffect(() => {
    if (!hasSentInitial.current && params.initialMessage) {
      hasSentInitial.current = true;
      sendMessage(params.initialMessage);
    }
  }, [params.initialMessage, sendMessage]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const onAddToPlan = async (suggestion: CarePlanSuggestion) => {
    const success = await handleAddToPlan(suggestion);
    if (success) {
      Alert.alert(t('caregiverApp.coach.success'), t('caregiverApp.coach.taskAddedSuccess'));
    } else {
      Alert.alert(t('common.errorTitle'), t('caregiverApp.coach.taskAddedError'));
    }
  };

  const onAddDoctorNote = async (note: DoctorNote) => {
    const success = await handleAddDoctorNote(note);
    if (success) {
      Alert.alert(t('caregiverApp.coach.success'), t('caregiverApp.coach.noteAddedSuccess'));
    } else {
      Alert.alert(t('common.errorTitle'), t('caregiverApp.coach.noteAddedError'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header with back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'\u2190'} {t('caregiverApp.coach.hub.backToHub')}</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => {
            const { cleanContent, carePlanSuggestions, doctorNotes } =
              message.role === 'assistant'
                ? parseResponse(message.content)
                : { cleanContent: message.content, carePlanSuggestions: [], doctorNotes: [] };

            const isLastMessage = index === messages.length - 1;
            const showLoading =
              isLoading && isLastMessage && message.role === 'assistant' && !cleanContent;

            return (
              <View
                key={index}
                style={[
                  styles.messageWrapper,
                  message.role === 'user'
                    ? styles.userMessageWrapper
                    : styles.assistantMessageWrapper,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.role === 'user'
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  {message.role === 'assistant' && (
                    <View style={styles.assistantHeader}>
                      <Text style={styles.assistantEmoji}>{'\u{1F917}'}</Text>
                      <Text style={styles.assistantName}>{t('caregiverApp.coach.careCoach')}</Text>
                    </View>
                  )}

                  {showLoading ? (
                    <View style={styles.loadingDots}>
                      <View style={styles.dot} />
                      <View style={[styles.dot, styles.dotDelayed1]} />
                      <View style={[styles.dot, styles.dotDelayed2]} />
                    </View>
                  ) : message.role === 'assistant' && cleanContent ? (
                    <Markdown style={markdownStyles}>{cleanContent}</Markdown>
                  ) : (
                    <Text
                      style={[
                        styles.messageText,
                        message.role === 'user' && styles.userMessageText,
                      ]}
                    >
                      {cleanContent}
                    </Text>
                  )}

                  {/* Care Plan Suggestions */}
                  {carePlanSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {carePlanSuggestions.map((suggestion, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.suggestionButton}
                          onPress={() => onAddToPlan(suggestion)}
                        >
                          <Text style={styles.suggestionIcon}>{'\u{1F4CB}'}</Text>
                          <View style={styles.suggestionContent}>
                            <Text style={styles.suggestionTitle}>
                              {t('caregiverApp.coach.addToCarePlanButton')}
                            </Text>
                            <Text style={styles.suggestionSubtitle}>
                              {suggestion.title}
                            </Text>
                          </View>
                          <Text style={styles.suggestionPlus}>+</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Doctor Notes */}
                  {doctorNotes.length > 0 && (
                    <View style={styles.notesContainer}>
                      {doctorNotes.map((note, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.noteButton}
                          onPress={() => onAddDoctorNote(note)}
                        >
                          <Text style={styles.noteIcon}>{'\u{1F4DD}'}</Text>
                          <View style={styles.noteContent}>
                            <Text style={styles.noteTitle}>
                              {t('caregiverApp.coach.saveForDoctorVisit')}
                            </Text>
                            <Text style={styles.noteSubtitle}>
                              {note.note}
                            </Text>
                          </View>
                          <Text style={styles.notePlus}>+</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('caregiverApp.coach.askAbout', { name: patientName })}
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={1000}
            editable={!isLoading}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.textInverse} size="small" />
            ) : (
              <Text style={styles.sendButtonText}>{t('caregiverApp.coach.send')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          {t('caregiverApp.coach.disclaimerShort')}
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  heading2: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
  strong: {
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  hr: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: 12,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 15,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.brand600,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  assistantMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: COLORS.brand600,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.sm,
    ...SHADOWS.sm,
  },
  assistantBubble: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.xl,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assistantEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  assistantName: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.brand700,
  },
  messageText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  userMessageText: {
    color: COLORS.textInverse,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand400,
  },
  dotDelayed1: {
    opacity: 0.7,
  },
  dotDelayed2: {
    opacity: 0.5,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand50,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  suggestionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.brand700,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: COLORS.brand600,
  },
  suggestionPlus: {
    fontSize: 20,
    color: COLORS.brand600,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 12,
  },
  noteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.amberBg,
    borderWidth: 1,
    borderColor: COLORS.amber,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  noteIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONTS.bodyMedium,
    color: COLORS.amber,
  },
  noteSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.body,
    color: COLORS.amber,
  },
  notePlus: {
    fontSize: 20,
    color: COLORS.amber,
    fontWeight: '500',
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.md,
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: COLORS.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.brand200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
    maxHeight: 100,
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
});
