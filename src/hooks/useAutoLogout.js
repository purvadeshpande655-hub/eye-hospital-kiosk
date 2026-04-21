import { useState, useEffect, useRef } from 'react';

export const useAutoLogout = (timeoutSeconds = 20, onLogout) => {
  const [timeRemaining, setTimeRemaining] = useState(timeoutSeconds);
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const resetTimer = () => {
    setTimeRemaining(timeoutSeconds);
    setIsActive(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const startTimer = () => {
    resetTimer();
    setIsActive(true);
    
    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      if (onLogout) {
        onLogout();
      }
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, timeoutSeconds * 1000);
  };

  const cancelTimer = () => {
    resetTimer();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeRemaining,
    isActive,
    startTimer,
    resetTimer,
    cancelTimer
  };
};
