import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import {
  startRecording,
  stopRecording,
  cancelRecording,
  uploadVoiceNote,
  playVoiceNote,
  formatDuration,
} from '../services/voice-recording';

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  isUploading: boolean;
  duration: number;
  formattedDuration: string;
  recordingUri: string | null;
  error: string | null;
  startRecordingAsync: () => Promise<boolean>;
  stopRecordingAsync: () => Promise<string | null>;
  cancelRecordingAsync: () => Promise<void>;
  playRecordingAsync: () => Promise<void>;
  stopPlaybackAsync: () => Promise<void>;
  uploadRecordingAsync: (
    householdId: string,
    date: string
  ) => Promise<string | null>;
  reset: () => void;
}

/**
 * Hook for voice recording in the patient app
 */
export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);

  const formattedDuration = formatDuration(duration);

  // Start recording
  const startRecordingAsync = useCallback(async (): Promise<boolean> => {
    setError(null);
    setDuration(0);
    setRecordingUri(null);

    const result = await startRecording((newDuration) => {
      setDuration(newDuration);
    });

    if (result.success) {
      setIsRecording(true);
      return true;
    } else {
      setError(result.error?.message || 'Failed to start recording');
      return false;
    }
  }, []);

  // Stop recording
  const stopRecordingAsync = useCallback(async (): Promise<string | null> => {
    const result = await stopRecording();

    setIsRecording(false);

    if (result.success && result.uri) {
      setRecordingUri(result.uri);
      if (result.duration) {
        setDuration(result.duration);
      }
      return result.uri;
    } else {
      setError(result.error?.message || 'Failed to stop recording');
      return null;
    }
  }, []);

  // Cancel recording
  const cancelRecordingAsync = useCallback(async (): Promise<void> => {
    await cancelRecording();
    setIsRecording(false);
    setDuration(0);
    setRecordingUri(null);
    setError(null);
  }, []);

  // Play recording
  const playRecordingAsync = useCallback(async (): Promise<void> => {
    if (!recordingUri) {
      setError('No recording to play');
      return;
    }

    // Stop any existing playback
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }

    const result = await playVoiceNote(recordingUri, (status) => {
      if (status.isLoaded) {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      }
    });

    if (result.success) {
      soundRef.current = result.sound;
      setIsPlaying(true);
    } else {
      setError(result.error?.message || 'Failed to play recording');
    }
  }, [recordingUri]);

  // Stop playback
  const stopPlaybackAsync = useCallback(async (): Promise<void> => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Upload recording
  const uploadRecordingAsync = useCallback(
    async (householdId: string, date: string): Promise<string | null> => {
      if (!recordingUri) {
        setError('No recording to upload');
        return null;
      }

      setIsUploading(true);
      setError(null);

      const result = await uploadVoiceNote(recordingUri, householdId, date);

      setIsUploading(false);

      if (result.success && result.url) {
        setRecordingUri(null);
        return result.url;
      } else {
        setError(result.error?.message || 'Failed to upload recording');
        return null;
      }
    },
    [recordingUri]
  );

  // Reset state
  const reset = useCallback(async () => {
    await cancelRecording();
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
    setIsUploading(false);
    setDuration(0);
    setRecordingUri(null);
    setError(null);
  }, []);

  return {
    isRecording,
    isPaused,
    isPlaying,
    isUploading,
    duration,
    formattedDuration,
    recordingUri,
    error,
    startRecordingAsync,
    stopRecordingAsync,
    cancelRecordingAsync,
    playRecordingAsync,
    stopPlaybackAsync,
    uploadRecordingAsync,
    reset,
  };
}
