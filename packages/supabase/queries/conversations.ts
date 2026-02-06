import { supabase } from '../client';
import type {
  AIConversation,
  AIConversationInsert,
  AIMessage,
  AIMessageRole,
} from '@ourturn/shared';

/**
 * Create a new AI conversation
 */
export async function createConversation(
  caregiverId: string,
  householdId: string
): Promise<AIConversation> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      caregiver_id: caregiverId,
      household_id: householdId,
      messages: [],
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: AIMessageRole,
  content: string
): Promise<AIConversation> {
  // First get the current messages
  const { data: conversation, error: fetchError } = await supabase
    .from('ai_conversations')
    .select('messages')
    .eq('id', conversationId)
    .single();

  if (fetchError) throw fetchError;

  const currentMessages = (conversation.messages as AIMessage[]) || [];

  const newMessage: AIMessage = {
    role,
    content,
    timestamp: new Date().toISOString(),
  };

  const updatedMessages = [...currentMessages, newMessage];

  const { data, error } = await supabase
    .from('ai_conversations')
    .update({ messages: updatedMessages })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get a conversation by ID
 */
export async function getConversation(
  conversationId: string
): Promise<AIConversation | null> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get conversation list for a caregiver (with preview)
 */
export async function getConversationList(
  caregiverId: string,
  limit: number = 20
): Promise<
  Array<{
    id: string;
    created_at: string;
    updated_at: string;
    preview: string;
    message_count: number;
  }>
> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id, created_at, updated_at, messages')
    .eq('caregiver_id', caregiverId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data.map((conv) => {
    const messages = (conv.messages as AIMessage[]) || [];
    const firstUserMessage = messages.find((m) => m.role === 'user');

    return {
      id: conv.id,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      preview: firstUserMessage?.content?.substring(0, 100) || 'New conversation',
      message_count: messages.length,
    };
  });
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_conversations')
    .delete()
    .eq('id', conversationId);

  if (error) throw error;
}

/**
 * Get recent conversations for context (for AI)
 */
export async function getRecentConversationContext(
  caregiverId: string,
  maxMessages: number = 50
): Promise<AIMessage[]> {
  const conversations = await getConversationList(caregiverId, 5);

  const allMessages: AIMessage[] = [];

  for (const conv of conversations) {
    const fullConv = await getConversation(conv.id);
    if (fullConv) {
      allMessages.push(...(fullConv.messages as AIMessage[]));
    }

    if (allMessages.length >= maxMessages) {
      break;
    }
  }

  return allMessages.slice(0, maxMessages);
}

/**
 * Get conversation count for a caregiver (for rate limiting)
 */
export async function getConversationCount(
  caregiverId: string,
  sinceDate?: string
): Promise<number> {
  let query = supabase
    .from('ai_conversations')
    .select('*', { count: 'exact', head: true })
    .eq('caregiver_id', caregiverId);

  if (sinceDate) {
    query = query.gte('created_at', sinceDate);
  }

  const { count, error } = await query;

  if (error) throw error;

  return count || 0;
}

/**
 * Get message count for a caregiver this month (for rate limiting)
 */
export async function getMonthlyMessageCount(
  caregiverId: string
): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('ai_conversations')
    .select('messages')
    .eq('caregiver_id', caregiverId)
    .gte('created_at', startOfMonth.toISOString());

  if (error) throw error;

  let totalMessages = 0;
  for (const conv of data) {
    const messages = (conv.messages as AIMessage[]) || [];
    totalMessages += messages.filter((m) => m.role === 'user').length;
  }

  return totalMessages;
}
