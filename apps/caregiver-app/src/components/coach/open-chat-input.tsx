import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, useColors, FONTS, RADIUS, SPACING } from '../../theme';

interface OpenChatInputProps {
  patientName: string;
  onSubmit: (message: string) => void;
}

export default function OpenChatInput({ patientName, onSubmit }: OpenChatInputProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useColors();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <View>
      <Text style={styles.title}>{t('caregiverApp.coach.hub.askAnything.title')}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('caregiverApp.coach.hub.askAnything.placeholder', { name: patientName })}
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Text style={styles.sendText}>{t('caregiverApp.coach.send')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.disclaimer}>
        {t('caregiverApp.coach.disclaimerShort')}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  title: {
    fontSize: 11,
    fontFamily: FONTS.displayMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: SPACING[3],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.brand200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    fontSize: 16,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.brand600,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[3],
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontSize: 16,
    fontFamily: FONTS.bodySemiBold,
    color: colors.textInverse,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: FONTS.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: SPACING[2],
  },
}));
