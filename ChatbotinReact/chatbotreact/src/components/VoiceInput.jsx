import React, { useState, useEffect, useRef } from 'react';
import { getText } from '../utils/translations';
import './VoiceInput.css';

const VoiceInput = ({ onTranscript, language = 'en-IN', disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Set language based on prop
    if (language === 'hi-IN') {
      recognition.lang = 'hi-IN';
    } else if (language === 'mr-IN') {
      recognition.lang = 'mr-IN';
    } else {
      recognition.lang = 'en-IN';
    }

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        alert(getText('errorVoice', language));
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTranscript]);

  const handleToggleRecording = () => {
    if (!isSupported) {
      alert(getText('voiceNotSupported', language));
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert(getText('errorVoice', language));
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      className={`voice-input-button ${isRecording ? 'recording' : ''}`}
      onClick={handleToggleRecording}
      disabled={disabled}
      title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
      type="button"
    >
      🎤
    </button>
  );
};

export default VoiceInput;
