import * as FileSystem from 'expo-file-system';
import { supabase } from '@memoguard/supabase';

/**
 * Upload voice note to Supabase Storage
 */
export async function uploadVoiceNote(
  uri: string,
  householdId: string,
  date: string
): Promise<{ success: boolean; url?: string; error?: Error }> {
  try {
    // Read the file
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return {
        success: false,
        error: new Error('Recording file not found'),
      };
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Convert to blob
    const blob = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `voice-notes/${householdId}/${date}/${timestamp}.m4a`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('voice-notes')
      .upload(filename, blob, {
        contentType: 'audio/m4a',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('voice-notes').getPublicUrl(filename);

    // Clean up local file
    await FileSystem.deleteAsync(uri, { idempotent: true });

    return { success: true, url: publicUrl };
  } catch (error) {
    if (__DEV__) console.error('Failed to upload voice note:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to upload voice note'),
    };
  }
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
