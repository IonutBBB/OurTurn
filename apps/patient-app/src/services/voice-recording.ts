import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@memoguard/supabase';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri: string | null;
  error: Error | null;
}

export interface VoiceNoteUploadResult {
  storageUrl: string;
  transcript: string | null;
}

let recording: Audio.Recording | null = null;
let durationUpdateInterval: NodeJS.Timeout | null = null;

/**
 * Request audio recording permissions
 */
export async function requestAudioPermission(): Promise<boolean> {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    return granted;
  } catch (error) {
    console.error('Failed to request audio permission:', error);
    return false;
  }
}

/**
 * Configure audio session for recording
 */
export async function configureAudioSession(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

/**
 * Start recording a voice note
 */
export async function startRecording(
  onDurationUpdate?: (duration: number) => void
): Promise<{ success: boolean; error?: Error }> {
  try {
    // Request permission
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      return {
        success: false,
        error: new Error('Audio recording permission not granted'),
      };
    }

    // Configure audio session
    await configureAudioSession();

    // Create new recording
    recording = new Audio.Recording();

    // Configure recording options
    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    });

    // Start recording
    await recording.startAsync();

    // Set up duration tracking
    let duration = 0;
    durationUpdateInterval = setInterval(() => {
      duration += 1;
      onDurationUpdate?.(duration);
    }, 1000);

    return { success: true };
  } catch (error) {
    console.error('Failed to start recording:', error);
    recording = null;
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to start recording'),
    };
  }
}

/**
 * Stop recording and return the URI
 */
export async function stopRecording(): Promise<{
  success: boolean;
  uri?: string;
  duration?: number;
  error?: Error;
}> {
  try {
    // Clear duration interval
    if (durationUpdateInterval) {
      clearInterval(durationUpdateInterval);
      durationUpdateInterval = null;
    }

    if (!recording) {
      return {
        success: false,
        error: new Error('No recording in progress'),
      };
    }

    // Get recording status for duration
    const status = await recording.getStatusAsync();
    const duration = status.isRecording
      ? Math.floor(status.durationMillis / 1000)
      : 0;

    // Stop recording
    await recording.stopAndUnloadAsync();

    // Get URI
    const uri = recording.getURI();

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    recording = null;

    if (!uri) {
      return {
        success: false,
        error: new Error('No recording URI available'),
      };
    }

    return { success: true, uri, duration };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    recording = null;
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to stop recording'),
    };
  }
}

/**
 * Cancel recording without saving
 */
export async function cancelRecording(): Promise<void> {
  try {
    if (durationUpdateInterval) {
      clearInterval(durationUpdateInterval);
      durationUpdateInterval = null;
    }

    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  } catch (error) {
    console.error('Failed to cancel recording:', error);
    recording = null;
  }
}

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
    console.error('Failed to upload voice note:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to upload voice note'),
    };
  }
}

/**
 * Play a voice note
 */
export async function playVoiceNote(
  uri: string,
  onPlaybackStatusUpdate?: (status: any) => void
): Promise<{ sound: Audio.Sound; success: boolean; error?: Error }> {
  try {
    // Configure audio for playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Load and play the sound
    const { sound, status } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    return { sound, success: true };
  } catch (error) {
    console.error('Failed to play voice note:', error);
    return {
      sound: new Audio.Sound(),
      success: false,
      error: error instanceof Error ? error : new Error('Failed to play voice note'),
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
