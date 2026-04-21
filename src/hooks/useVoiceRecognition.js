import { useState, useEffect } from 'react';

export const useVoiceRecognition = (language) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'Marathi' ? 'mr-IN' : 'en-US';
      
      recognitionInstance.onstart = () => {
        setListening(true);
        setTranscript('');
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };
      
      recognitionInstance.onend = () => {
        setListening(false);
      };
      
      setRecognition(recognitionInstance);
      setSupported(true);
    }
  }, [language]);

  const startListening = () => {
    if (recognition && !listening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && listening) {
      recognition.stop();
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    listening,
    transcript,
    supported,
    startListening,
    stopListening,
    resetTranscript
  };
};
