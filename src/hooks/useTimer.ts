import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState } from '../types';

interface UseTimerProps {
  onComplete: () => void;
}

export function useTimer({ onComplete }: UseTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    timeRemaining: 0,
    mode: 'idle',
    cyclesCompleted: 0,
  });

  const intervalRef = useRef<number | null>(null);

  // Start timer with specified duration in seconds
  const startTimer = useCallback(
    (durationInMinutes: number, mode: 'focus' | 'shortBreak' | 'longBreak') => {
      setTimerState({
        isActive: true,
        timeRemaining: durationInMinutes * 60,
        mode,
        cyclesCompleted: timerState.cyclesCompleted,
      });
    },
    [timerState.cyclesCompleted]
  );

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState((prev) => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  // Resume timer
  const resumeTimer = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isActive: true,
    }));
  }, []);

  // Add time to current timer (in seconds)
  const addTime = useCallback((seconds: number) => {
    setTimerState((prev) => ({
      ...prev,
      timeRemaining: prev.timeRemaining + seconds,
    }));
  }, []);

  // Stop timer and reset
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState({
      isActive: false,
      timeRemaining: 0,
      mode: 'idle',
      cyclesCompleted: timerState.cyclesCompleted,
    });
  }, [timerState.cyclesCompleted]);

  // Increment cycle count (called when focus timer completes)
  const incrementCycle = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      cyclesCompleted: prev.cyclesCompleted + 1,
    }));
  }, []);

  // Reset cycle count
  const resetCycles = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      cyclesCompleted: 0,
    }));
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (timerState.isActive && timerState.timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimerState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Timer completed
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            onComplete();
            return {
              ...prev,
              isActive: false,
              timeRemaining: 0,
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [timerState.isActive, timerState.timeRemaining, onComplete]);

  // Format time for display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    addTime,
    stopTimer,
    incrementCycle,
    resetCycles,
    formatTime,
  };
}
