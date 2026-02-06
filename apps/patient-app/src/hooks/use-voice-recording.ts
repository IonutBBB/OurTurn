import { useState, useCallback, useRef, useEffect } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  createAudioPlayer,
} from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { uploadVoiceNote, formatDuration } from '../services/voice-recording';

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

const VOICE_RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
};

/**
 * Hook for voice recording in the patient app using expo-audio
 */
export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<AudioPlayer | null>(null);

  const recorder = useAudioRecorder(VOICE_RECORDING_OPTIONS, (status) => {
    if (status.isFinished && status.url) {
      setRecordingUri(status.url);
    }
    if (status.hasError && status.error) {
      setError(status.error);
    }
  });

  const recorderState = useAudioRecorderState(recorder, 1000);

  const duration = Math.floor(recorderState.durationMillis / 1000);
  const formattedDuration = formatDuration(duration);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
    };
  }, []);

  const startRecordingAsync = useCallback(async (): Promise<boolean> => {
    setError(null);
    setRecordingUri(null);

    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setError('Audio recording permission not granted');
        return false;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      return false;
    }
  }, [recorder]);

  const stopRecordingAsync = useCallback(async (): Promise<string | null> => {
    try {
      recorder.stop();

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      // The URI is set via the status callback, but also available on recorder
      const uri = recorder.uri;
      if (uri) {
        setRecordingUri(uri);
      }
      return uri;
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      return null;
    }
  }, [recorder]);

  const cancelRecordingAsync = useCallback(async (): Promise<void> => {
    try {
      recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    } catch {
      // Ignore errors during cancel
    }
    setRecordingUri(null);
    setError(null);
  }, [recorder]);

  const playRecordingAsync = useCallback(async (): Promise<void> => {
    if (!recordingUri) {
      setError('No recording to play');
      return;
    }

    try {
      // Clean up previous player
      if (playerRef.current) {
        playerRef.current.remove();
      }

      const player = createAudioPlayer({ uri: recordingUri });
      playerRef.current = player;

      // Listen for playback end
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      player.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to play recording');
    }
  }, [recordingUri]);

  const stopPlaybackAsync = useCallback(async (): Promise<void> => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

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

  const reset = useCallback(() => {
    try {
      recorder.stop();
    } catch {
      // Ignore if not recording
    }
    if (playerRef.current) {
      playerRef.current.remove();
      playerRef.current = null;
    }
    setIsPlaying(false);
    setIsUploading(false);
    setRecordingUri(null);
    setError(null);
  }, [recorder]);

  return {
    isRecording: recorderState.isRecording,
    isPaused: false,
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
