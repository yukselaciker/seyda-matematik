/**
 * PomodoroTimer - Fully Functional Focus Timer
 * 
 * Features:
 * - Real-time countdown with useEffect + setInterval
 * - Start/Pause/Reset functionality
 * - Work/Break mode toggle
 * - Persists state to localStorage (survives tab switches & reloads)
 * - Visual progress ring
 * - Sound notification on complete (optional)
 * - Session counter
 */

import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Sparkles, Volume2, VolumeX } from 'lucide-react';

// --- TYPES ---
interface PomodoroState {
  isRunning: boolean;
  startTime: number | null;
  pausedTimeRemaining: number | null;
  duration: number;
  mode: 'work' | 'break';
  sessionsCompleted: number;
}

interface PomodoroTimerProps {
  onComplete?: (mode: 'work' | 'break') => void;
  onXpGain?: (amount: number) => void;
}

// --- CONSTANTS ---
const WORK_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const STORAGE_KEY = 'app_pomodoro_state';

// --- STORAGE HELPERS ---
const getStoredState = (): PomodoroState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      // Validate state structure
      if (typeof state.duration === 'number' && typeof state.mode === 'string') {
        return state;
      }
    }
  } catch (e) {
    console.error('Failed to load pomodoro state', e);
  }
  
  return {
    isRunning: false,
    startTime: null,
    pausedTimeRemaining: null,
    duration: WORK_DURATION,
    mode: 'work',
    sessionsCompleted: 0,
  };
};

const saveState = (state: PomodoroState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save pomodoro state', e);
  }
};

// --- HELPERS ---
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// --- MAIN COMPONENT ---
export const PomodoroTimer: React.FC<PomodoroTimerProps> = memo(({ onComplete, onXpGain }) => {
  const [state, setState] = useState<PomodoroState>(getStoredState);
  const [timeLeft, setTimeLeft] = useState<number>(WORK_DURATION);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate time remaining based on stored state
  useEffect(() => {
    if (state.isRunning && state.startTime) {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      const remaining = Math.max(0, state.duration - elapsed);
      setTimeLeft(remaining);
    } else if (state.pausedTimeRemaining !== null) {
      setTimeLeft(state.pausedTimeRemaining);
    } else {
      setTimeLeft(state.duration);
    }
  }, [state.isRunning, state.startTime, state.duration, state.pausedTimeRemaining]);

  // Timer interval
  useEffect(() => {
    if (!state.isRunning || !state.startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.startTime!) / 1000);
      const remaining = Math.max(0, state.duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        // Timer complete!
        clearInterval(interval);
        
        // Play sound
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }

        // Update state
        const newSessionsCompleted = state.mode === 'work' 
          ? state.sessionsCompleted + 1 
          : state.sessionsCompleted;
        
        const newState: PomodoroState = {
          isRunning: false,
          startTime: null,
          pausedTimeRemaining: null,
          duration: state.mode === 'work' 
            ? (newSessionsCompleted % 4 === 0 ? LONG_BREAK_DURATION : SHORT_BREAK_DURATION)
            : WORK_DURATION,
          mode: state.mode === 'work' ? 'break' : 'work',
          sessionsCompleted: newSessionsCompleted,
        };

        setState(newState);
        saveState(newState);

        // Callbacks
        onComplete?.(state.mode);
        if (state.mode === 'work') {
          onXpGain?.(25); // Gain XP for completing work session
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, state.startTime, state.duration, state.mode, state.sessionsCompleted, soundEnabled, onComplete, onXpGain]);

  // --- ACTIONS ---
  const handleStart = useCallback(() => {
    const now = Date.now();
    const startFrom = state.pausedTimeRemaining !== null 
      ? now - (state.duration - state.pausedTimeRemaining) * 1000
      : now;

    const newState: PomodoroState = {
      ...state,
      isRunning: true,
      startTime: startFrom,
      pausedTimeRemaining: null,
    };

    setState(newState);
    saveState(newState);
  }, [state]);

  const handlePause = useCallback(() => {
    const newState: PomodoroState = {
      ...state,
      isRunning: false,
      startTime: null,
      pausedTimeRemaining: timeLeft,
    };

    setState(newState);
    saveState(newState);
  }, [state, timeLeft]);

  const handleReset = useCallback(() => {
    const newState: PomodoroState = {
      ...state,
      isRunning: false,
      startTime: null,
      pausedTimeRemaining: null,
    };

    setState(newState);
    saveState(newState);
    setTimeLeft(state.duration);
  }, [state]);

  const handleModeSwitch = useCallback((mode: 'work' | 'break') => {
    const duration = mode === 'work' ? WORK_DURATION : SHORT_BREAK_DURATION;
    
    const newState: PomodoroState = {
      ...state,
      isRunning: false,
      startTime: null,
      pausedTimeRemaining: null,
      duration,
      mode,
    };

    setState(newState);
    saveState(newState);
    setTimeLeft(duration);
  }, [state]);

  const handleQuickStart = useCallback((minutes: number, mode: 'work' | 'break') => {
    const duration = minutes * 60;
    const now = Date.now();

    const newState: PomodoroState = {
      ...state,
      isRunning: true,
      startTime: now,
      pausedTimeRemaining: null,
      duration,
      mode,
    };

    setState(newState);
    saveState(newState);
    setTimeLeft(duration);
  }, [state]);

  // Calculate progress
  const progress = ((state.duration - timeLeft) / state.duration) * 100;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-colors">
      {/* Hidden audio element for notification */}
      <audio 
        ref={audioRef} 
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleF0wXbDA6M6BKA48pNLnzZ9oJT6T0+Xo7sGRZT1FgKbLxruOWCwyYJe8zLiLThIjW5a+0MKebTYrS4aqwru+qXw5K0VypbK2saZyOSs6YJayq6GZcjgrO2mZsKqek3k1JjdolauglnY1Jjlrlq+mnHk3Jjtrla6jl3U0JTlplayjl3Y2JjtslKygl3U0JTlolKygl3c3KDxslKyglnQ0JDholKyglnc2JzxtlKuflnQ0JTlplKuflXY2KDxulKuglXM0JDholKuflHU1Jzttk6qek3M0JTlnk6qek3U1Jzttk6qek3M0JTlnk6qdk3U1KDxukqqdk3M0JTlnkqqdk3U1KDxukqqdk3M0JTlnkqqdk3U2KDxukqqdk3Q0JTlnkqqdknU2KT1ukqqdk3Q0JTlnkqqdk3Y2KD1vkqqdk3Q0Jjlokqqck3Y2KT1vkqqdk3Q0Jjlokqqdk3Y2KT1vkqqdk3Q0Jjlokqqck3Y2KT1vkqqdk3Q0Jjlokqqck3Y2KT1vkqqdk3Q0JjlokqqckzY="
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {state.mode === 'work' ? (
            <>
              <Brain className="w-5 h-5 text-indigo-500" />
              Odaklanma Modu
            </>
          ) : (
            <>
              <Coffee className="w-5 h-5 text-green-500" />
              Mola Zamanı
            </>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title={soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          {state.isRunning && (
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">
              Aktif
            </span>
          )}
        </div>
      </div>

      {/* Session Counter */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {[1, 2, 3, 4].map(session => (
          <div
            key={session}
            className={`w-3 h-3 rounded-full transition-colors ${
              session <= state.sessionsCompleted % 4 || (state.sessionsCompleted >= 4 && session === 4)
                ? 'bg-indigo-500'
                : 'bg-slate-200'
            }`}
            title={`Oturum ${session}`}
          />
        ))}
        <span className="text-xs text-slate-500 ml-2">
          {state.sessionsCompleted} oturum tamamlandı
        </span>
      </div>

      {/* Timer Display */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="70"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-100"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="70"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${
              state.mode === 'work' 
                ? 'text-indigo-500' 
                : 'text-green-500'
            }`}
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-800 font-mono">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-slate-500 mt-1">
            {state.mode === 'work' ? 'Çalışma' : 'Mola'}
          </span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleModeSwitch('work')}
          disabled={state.isRunning}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            state.mode === 'work'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Brain className="w-4 h-4 inline mr-1" />
          Çalışma
        </button>
        <button
          onClick={() => handleModeSwitch('break')}
          disabled={state.isRunning}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            state.mode === 'break'
              ? 'bg-green-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Coffee className="w-4 h-4 inline mr-1" />
          Mola
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {!state.isRunning ? (
          <button
            onClick={handleStart}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-all hover:scale-105 ${
              state.mode === 'work' 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <Play className="w-5 h-5" fill="currentColor" />
            {state.pausedTimeRemaining !== null ? 'Devam Et' : 'Başlat'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium transition-all hover:bg-amber-600 hover:scale-105"
          >
            <Pause className="w-5 h-5" />
            Duraklat
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Start Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-slate-500 w-full text-center mb-1">
          Hızlı Başlat:
        </span>
        {[
          { mins: 15, label: '15 dk', mode: 'work' as const },
          { mins: 25, label: '25 dk', mode: 'work' as const },
          { mins: 45, label: '45 dk', mode: 'work' as const },
          { mins: 5, label: '5 dk Mola', mode: 'break' as const },
        ].map(({ mins, label, mode }) => (
          <button
            key={label}
            onClick={() => handleQuickStart(mins, mode)}
            disabled={state.isRunning}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'work'
                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-500 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Pomodoro Tekniği:</strong> 25 dk çalış, 5 dk mola ver. Her 4 oturumda uzun mola (15 dk) al. 
            Tamamlanan her çalışma oturumu için +25 XP kazanırsın!
          </span>
        </p>
      </div>
    </div>
  );
});

PomodoroTimer.displayName = 'PomodoroTimer';

export default PomodoroTimer;
