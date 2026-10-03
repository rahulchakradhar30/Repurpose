'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type definitions for standard & webkit implementations
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

interface VoiceSearchOptions {
  onTranscript: (transcript: string) => void;
  onError?: (errorMessage: string) => void;
  lang?: string;
}

export function useVoiceSearch({ onTranscript, onError, lang = 'en-US' }: VoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as WindowWithSpeech;
      const hasSpeech = Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
      setIsSupported(hasSpeech);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors if recognition already ended
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const win = window as WindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      const msg = 'Voice recognition is not supported in this browser.';
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    setErrorMessage(null);

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          // Clean up speech artifacts like trailing punctuation
          const cleaned = transcript.trim().replace(/[.,?!]+$/, '');
          onTranscript(cleaned);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let msg = 'Voice recognition error. Please try again.';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          msg = 'Microphone access was denied. Please allow microphone permissions in your browser.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Please speak clearly into your microphone.';
        } else if (event.error === 'network') {
          msg = 'Speech recognition network connection interrupted.';
        }
        setErrorMessage(msg);
        onError?.(msg);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      console.error('Failed to start voice recognition:', err);
      const msg = err instanceof Error ? err.message : 'Could not activate microphone.';
      setErrorMessage(msg);
      onError?.(msg);
      setIsListening(false);
    }
  }, [isListening, lang, onTranscript, onError, stopListening]);

  // Clean up recognition instance when unmounting
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    errorMessage,
    startListening,
    stopListening,
    clearError: () => setErrorMessage(null),
  };
}
