import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { supabase } from '@ourturn/supabase';
import type { HelpRequest } from '@ourturn/shared';
import { HELP_REQUEST_TEMPLATES } from '@ourturn/shared';
import { createThemedStyles, useColors, FONTS, RADIUS, SHADOWS } from '../../theme';
import type { ThemeColors } from '../../theme';

interface HelpRequestFormProps {
  caregiverId: string;
  householdId: string;
  initialRequests: HelpRequest[];
}

function getStatusColors(colors: ThemeColors): Record<string, string> {
  return {
    pending: colors.amber,
    accepted: colors.brand600,
    completed: colors.success,
    expired: colors.textMuted,
  };
}

export function HelpRequestForm({ caregiverId, householdId, initialRequests }: HelpRequestFormProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const colors = useColors();
  const [requests, setRequests] = useState<HelpRequest[]>(initialRequests);
  const [customMessage, setCustomMessage] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const statusColors = getStatusColors(colors);

  const sendRequest = async (message: string, templateKey?: string) => {
    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('caregiver_help_requests')
        .insert({
          requester_id: caregiverId,
          household_id: householdId,
          message,
          template_key: templateKey || null,
        })
        .select()
        .single();

      if (error) throw error;

      setRequests((prev) => [data, ...prev]);
      setCustomMessage('');
      setShowCustom(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('', t('common.error'));
    } finally {
      setIsSending(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t('caregiverApp.toolkit.help.statusPending'),
      accepted: t('caregiverApp.toolkit.help.statusAccepted'),
      completed: t('caregiverApp.toolkit.help.statusCompleted'),
      expired: t('caregiverApp.toolkit.help.statusExpired'),
    };
    return map[status] || status;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('caregiverApp.toolkit.help.title')}</Text>

      {/* Template buttons */}
      <View style={styles.templates}>
        {HELP_REQUEST_TEMPLATES.map((tpl) => (
          <TouchableOpacity
            key={tpl.key}
            style={styles.templateButton}
            onPress={() => {
              if (tpl.key === 'custom') {
                setShowCustom(true);
              } else {
                sendRequest(t(`caregiverApp.toolkit.help.message_${tpl.key}`), tpl.key);
              }
            }}
            disabled={isSending}
            activeOpacity={0.7}
          >
            <Text style={styles.templateText}>{t(`caregiverApp.toolkit.help.template_${tpl.key}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom input */}
      {showCustom && (
        <View style={styles.customRow}>
          <TextInput
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder={t('caregiverApp.toolkit.help.customPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.customInput}
            returnKeyType="send"
            onSubmitEditing={() => {
              if (customMessage.trim()) sendRequest(customMessage.trim(), 'custom');
            }}
          />
          <TouchableOpacity
            onPress={() => customMessage.trim() && sendRequest(customMessage.trim(), 'custom')}
            disabled={!customMessage.trim() || isSending}
            style={[styles.sendButton, (!customMessage.trim() || isSending) && styles.sendButtonDisabled]}
          >
            <Text style={styles.sendButtonText}>{t('caregiverApp.toolkit.help.sendRequest')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent requests */}
      {requests.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>{t('caregiverApp.toolkit.help.recentRequests')}</Text>
          {requests.slice(0, 5).map((req) => (
            <View key={req.id} style={styles.requestItem}>
              <View style={styles.requestContent}>
                <Text style={styles.requestMessage} numberOfLines={1}>{req.message}</Text>
                <Text style={styles.requestTime}>
                  {new Date(req.created_at).toLocaleDateString(i18n.language, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[req.status] + '20' }]}>
                <Text style={[styles.statusText, { color: statusColors[req.status] }]}>
                  {getStatusLabel(req.status)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles((colors) => ({
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.display,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  templates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.brand200,
    backgroundColor: colors.brand50,
  },
  templateText: {
    fontSize: 13,
    color: colors.brand700,
    fontFamily: FONTS.bodyMedium,
    fontWeight: '500',
  },
  customRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.brand200,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.brand600,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  recentSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  requestContent: {
    flex: 1,
    marginRight: 12,
  },
  requestMessage: {
    fontSize: 14,
    fontFamily: FONTS.body,
    color: colors.textPrimary,
  },
  requestTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: FONTS.body,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
}));
