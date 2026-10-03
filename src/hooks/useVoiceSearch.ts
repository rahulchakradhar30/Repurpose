'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type definitions for standard & webkit implementations
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
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
  onTranscript: (transcript: string, alternatives?: string[]) => void;
  onError?: (errorMessage: string) => void;
  lang?: string;
}

export function useVoiceSearch({ onTranscript, onError, lang = 'en-US' }: VoiceSearchOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as WindowWithSpeech;
      const hasSpeech = Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
      setIsSupported(hasSpeech);
    }
  }, []);

  // Safe and thorough cleanup of active recognition instance
  const cleanupRecognition = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        const inst = recognitionRef.current;
        inst.onstart = null;
        inst.onend = null;
        inst.onerror = null;
        inst.onresult = null;
        inst.abort();
      } catch {
        // Ignore errors if recognition already aborted
      }
      recognitionRef.current = null;
    }

    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  // Stop listening gracefully
  const stopListening = useCallback(() => {
    cleanupRecognition();
  }, [cleanupRecognition]);

  // Start speech recognition session
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

    // Always cleanly reset any existing instance first
    cleanupRecognition();
    setErrorMessage(null);

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.continuous = false;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results?.[0];
        if (!result) return;

        const mainTranscript = result[0]?.transcript?.trim().replace(/[.,?!]+$/, '') || '';
        const alternatives: string[] = [];
        for (let i = 0; i < result.length; i++) {
          const alt = result[i]?.transcript?.trim().replace(/[.,?!]+$/, '');
          if (alt && !alternatives.includes(alt)) {
            alternatives.push(alt);
          }
        }

        if (mainTranscript) {
          onTranscript(mainTranscript, alternatives);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        isListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;

        // Aborted error occurs naturally during stop/restart; don't alert the user
        if (event.error === 'aborted') {
          return;
        }

        let msg = 'Voice recognition encountered an error. Please try again.';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          msg = 'Microphone access denied. Please allow microphone permissions in your browser.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Please speak clearly into your microphone.';
        } else if (event.error === 'network') {
          msg = 'Speech recognition network interrupted.';
        }
        setErrorMessage(msg);
        onError?.(msg);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      // In case browser is still transitioning internal microphone state, schedule quick retry
      cleanupRecognition();
      restartTimeoutRef.current = setTimeout(() => {
        try {
          const retryRecognition = new SpeechRecognitionClass();
          retryRecognition.lang = lang;
          retryRecognition.interimResults = false;
          retryRecognition.maxAlternatives = 5;
          retryRecognition.continuous = false;

          retryRecognition.onstart = () => {
            isListeningRef.current = true;
            setIsListening(true);
          };

          retryRecognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results?.[0];
            if (!result) return;
            const mainTranscript = result[0]?.transcript?.trim().replace(/[.,?!]+$/, '') || '';
            const alternatives: string[] = [];
            for (let i = 0; i < result.length; i++) {
              const alt = result[i]?.transcript?.trim().replace(/[.,?!]+$/, '');
              if (alt && !alternatives.includes(alt)) alternatives.push(alt);
            }
            if (mainTranscript) onTranscript(mainTranscript, alternatives);
          };

          retryRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            isListeningRef.current = false;
            setIsListening(false);
            recognitionRef.current = null;
            if (event.error !== 'aborted') {
              setErrorMessage('Microphone failed to start. Please try again.');
            }
          };

          retryRecognition.onend = () => {
            isListeningRef.current = false;
            setIsListening(false);
            recognitionRef.current = null;
          };

          recognitionRef.current = retryRecognition;
          retryRecognition.start();
        } catch (retryErr: unknown) {
          console.error('Failed to start voice recognition on retry:', retryErr);
          const msg = retryErr instanceof Error ? retryErr.message : 'Could not activate microphone.';
          setErrorMessage(msg);
          onError?.(msg);
          setIsListening(false);
          isListeningRef.current = false;
        }
      }, 100);
    }
  }, [lang, onTranscript, onError, cleanupRecognition]);

  // Unified toggle helper to avoid state desync or race conditions
  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [stopListening, startListening]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  return {
    isSupported,
    isListening,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setErrorMessage(null),
  };
}
