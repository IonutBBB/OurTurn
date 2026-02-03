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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/stores/auth-store';
import { useAICoach } from '../../src/hooks/use-ai-coach';
import type { CarePlanSuggestion, DoctorNote } from '../../src/services/ai-coach';

const COLORS = {
  background: '#FAFAF8',
  card: '#FFFFFF',
  border: '#E7E5E4',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  brand50: '#F0FDFA',
  brand100: '#CCFBF1',
  brand200: '#99F6E4',
  brand400: '#2DD4BF',
  brand600: '#0D9488',
  brand700: '#0F766E',
  white: '#FFFFFF',
  red50: '#FEF2F2',
  red200: '#FECACA',
  red700: '#B91C1C',
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber200: '#FDE68A',
  amber600: '#D97706',
  amber700: '#B45309',
};

export default function CoachScreen() {
  const { t } = useTranslation();
  const { patient, caregiver, household } = useAuthStore();
  const {
    messages,
    isLoading,
    error,
    suggestedPrompts,
    sendMessage,
    handleAddToPlan,
    handleAddDoctorNote,
    startNewConversation,
    parseResponse,
  } = useAICoach();

  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const patientName = patient?.name || 'your loved one';
  const caregiverName = caregiver?.name || 'there';

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const onAddToPlan = async (suggestion: CarePlanSuggestion) => {
    const success = await handleAddToPlan(suggestion);
    if (success) {
      Alert.alert('Success', 'Task added to care plan!');
    } else {
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  const onAddDoctorNote = async (note: DoctorNote) => {
    const success = await handleAddDoctorNote(note);
    if (success) {
      Alert.alert('Success', 'Note saved for doctor visit!');
    } else {
      Alert.alert('Error', 'Failed to save note. Please try again.');
    }
  };

  if (!household) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>AI Care Coach</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Please complete onboarding first.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Care Coach</Text>
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={startNewConversation}
              style={styles.newChatButton}
            >
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emoji}>💙</Text>
              <Text style={styles.greeting}>Hi {caregiverName}!</Text>
              <Text style={styles.subGreeting}>
                I'm here to help you care for {patientName}. Ask me anything
                about daily care, activities, or managing challenging situations.
              </Text>

              <Text style={styles.suggestedLabel}>Try asking:</Text>
              {suggestedPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedButton}
                  onPress={() => handleSuggestedPrompt(prompt)}
                >
                  <Text style={styles.suggestedText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            messages.map((message, index) => {
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
                        <Text style={styles.assistantEmoji}>💙</Text>
                        <Text style={styles.assistantName}>Care Coach</Text>
                      </View>
                    )}

                    {showLoading ? (
                      <View style={styles.loadingDots}>
                        <View style={styles.dot} />
                        <View style={[styles.dot, styles.dotDelayed1]} />
                        <View style={[styles.dot, styles.dotDelayed2]} />
                      </View>
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
                            <Text style={styles.suggestionIcon}>📋</Text>
                            <View style={styles.suggestionContent}>
                              <Text style={styles.suggestionTitle}>
                                Add to Care Plan
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
                            <Text style={styles.noteIcon}>📝</Text>
                            <View style={styles.noteContent}>
                              <Text style={styles.noteTitle}>
                                Save for Doctor Visit
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
            })
          )}
        </ScrollView>

        {/* Error Message */}
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
            placeholder={`Ask about caring for ${patientName}...`}
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
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Care Coach provides general guidance only. Always consult healthcare
          professionals for medical advice.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  newChatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.brand50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.brand200,
  },
  newChatText: {
    fontSize: 14,
    color: COLORS.brand700,
    fontWeight: '500',
  },
  placeholder: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  suggestedLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  suggestedButton: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  suggestedText: {
    fontSize: 15,
    color: COLORS.textSecondary,
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: COLORS.brand600,
  },
  assistantBubble: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.brand700,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  userMessageText: {
    color: COLORS.white,
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
    borderRadius: 12,
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
    backgroundColor: COLORS.amber50,
    borderWidth: 1,
    borderColor: COLORS.amber200,
    borderRadius: 12,
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
    color: COLORS.amber700,
  },
  noteSubtitle: {
    fontSize: 13,
    color: COLORS.amber600,
  },
  notePlus: {
    fontSize: 20,
    color: COLORS.amber600,
    fontWeight: '500',
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    backgroundColor: COLORS.red50,
    borderWidth: 1,
    borderColor: COLORS.red200,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.red700,
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
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    maxHeight: 100,
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: COLORS.brand600,
    borderRadius: 20,
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
    color: COLORS.white,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
});
