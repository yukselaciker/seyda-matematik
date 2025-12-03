/**
 * useStudentSystem - Custom Hook for Student Platform Logic
 * 
 * Handles all business logic for the student panel:
 * - Data fetching and caching
 * - Homework submission
 * - Chat messaging
 * - Gamification (XP/Level)
 * - Settings management
 * 
 * UI components should only render data and call these functions.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Homework, ProgressStat, Topic } from '../types';
import StorageService, { GamificationData, PomodoroState } from '../services/StorageService';

// --- INTERFACES ---
export interface CalendarEvent {
  id: string;
  day: number;
  title: string;
  type: 'exam' | 'deadline' | 'lesson';
}

export interface LearningMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  subject: string;
  thumbnail?: string;
  duration?: string;
  pages?: number;
}

export interface ChatMsg {
  id: string;
  text: string;
  sender: 'me' | 'bot';
  time: string;
}

export interface StudentSystemState {
  // Data
  homeworks: Homework[];
  stats: ProgressStat[];
  topics: Topic[];
  calendarEvents: CalendarEvent[];
  materials: LearningMaterial[];
  chatMessages: ChatMsg[];
  
  // Gamification
  xp: number;
  level: number;
  streak: number;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Pomodoro
  pomodoro: PomodoroState;
  pomodoroTimeLeft: number;
}

export interface StudentSystemActions {
  // Homework
  submitHomework: (homeworkId: string) => Promise<{ success: boolean; xpGained: number }>;
  
  // Chat
  sendMessage: (text: string) => void;
  
  // Gamification
  addXp: (amount: number) => GamificationData;
  
  // Pomodoro
  startPomodoro: (duration?: number, mode?: 'work' | 'break') => void;
  stopPomodoro: () => void;
  
  // AI Plan
  generateAiPlan: () => Promise<string>;
  
  // Refresh
  refreshData: () => void;
}

// --- STATIC DATA ---
const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'e1', day: 12, title: 'Matematik Sınavı', type: 'exam' },
  { id: 'e2', day: 15, title: 'Ödev Teslimi', type: 'deadline' },
  { id: 'e3', day: 24, title: 'Birebir Ders', type: 'lesson' },
  { id: 'e4', day: 28, title: 'Deneme Sınavı', type: 'exam' },
];

const MATERIALS: LearningMaterial[] = [
  { id: 'm1', title: 'LGS Çıkmış Sorular 2023', type: 'pdf', subject: 'LGS Hazırlık', pages: 24 },
  { id: 'm2', title: 'Üçgenlerde Benzerlik', type: 'video', subject: 'Geometri', duration: '14:20', thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=300' },
  { id: 'm3', title: 'Kareköklü Sayılar Özeti', type: 'pdf', subject: 'Matematik', pages: 5 },
  { id: 'm4', title: 'Veri Analizi Giriş', type: 'video', subject: 'Matematik', duration: '08:45', thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=300' },
];

const BOT_RESPONSES = [
  'Harika bir soru! Bu konuda sana yakında detaylı bir kaynak göndereceğim.',
  'Matematikte en önemli şey pratik yapmak. Her gün 10 soru çözmeyi dene!',
  'Bu konuyu anlamak için önce temelleri kavramak önemli. Video derslerimize göz at!',
  'Sorunun cevabını bulmak için önce problemi adım adım analiz etmeyi dene.',
  'Çok güzel bir ilerleme kaydediyorsun! Aynı şekilde devam et!',
];

// --- HOOK ---
export function useStudentSystem(user: User | null): [StudentSystemState, StudentSystemActions] {
  // Refs for stable callbacks
  const userRef = useRef(user);
  userRef.current = user;

  // State
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [stats, setStats] = useState<ProgressStat[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { id: 'init', text: 'Merhaba! Ben Matematik Asistanı. Sana nasıl yardımcı olabilirim?', sender: 'bot', time: '10:00' }
  ]);
  
  const [gamification, setGamification] = useState<GamificationData>({ xp: 0, level: 1, streak: 0, lastActiveDate: '' });
  const [pomodoro, setPomodoro] = useState<PomodoroState>({ isRunning: false, startTime: null, duration: 25 * 60, mode: 'work' });
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data load
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load all data from storage
      const loadedHomeworks = StorageService.getHomeworksForStudent(user.id);
      const loadedStats = StorageService.getStatsForStudent(user.id);
      const loadedTopics = StorageService.getTopicsForStudent(user.id);
      const loadedGamification = StorageService.getGamification(user.id);
      const loadedPomodoro = StorageService.getPomodoro();

      setHomeworks(loadedHomeworks);
      setStats(loadedStats);
      setTopics(loadedTopics);
      setGamification(loadedGamification);
      setPomodoro(loadedPomodoro);

      // Calculate initial pomodoro time
      if (loadedPomodoro.isRunning && loadedPomodoro.startTime) {
        const elapsed = Math.floor((Date.now() - loadedPomodoro.startTime) / 1000);
        const remaining = Math.max(0, loadedPomodoro.duration - elapsed);
        setPomodoroTimeLeft(remaining);
      } else {
        setPomodoroTimeLeft(loadedPomodoro.duration);
      }

    } catch (err) {
      console.error('Failed to load student data:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Pomodoro timer effect
  useEffect(() => {
    if (!pomodoro.isRunning || !pomodoro.startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pomodoro.startTime!) / 1000);
      const remaining = Math.max(0, pomodoro.duration - elapsed);
      setPomodoroTimeLeft(remaining);

      if (remaining === 0) {
        // Timer finished
        setPomodoro(prev => ({ ...prev, isRunning: false, startTime: null }));
        StorageService.stopPomodoro();
        // Could trigger a notification here
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoro.isRunning, pomodoro.startTime, pomodoro.duration]);

  // --- ACTIONS ---

  const submitHomework = useCallback(async (homeworkId: string): Promise<{ success: boolean; xpGained: number }> => {
    const currentUser = userRef.current;
    if (!currentUser?.id) {
      return { success: false, xpGained: 0 };
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update in storage
      const updatedHw = StorageService.submitHomework(homeworkId);
      if (!updatedHw) {
        return { success: false, xpGained: 0 };
      }

      // Update local state
      setHomeworks(prev => 
        prev.map(hw => hw.id === homeworkId ? { ...hw, status: 'delivered' as const } : hw)
      );

      // Add XP
      const xpGained = 50;
      const newGamification = StorageService.addXp(currentUser.id, xpGained);
      setGamification(newGamification);

      return { success: true, xpGained };
    } catch (err) {
      console.error('Failed to submit homework:', err);
      return { success: false, xpGained: 0 };
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg: ChatMsg = {
      id: `msg_${Date.now()}`,
      text: text.trim(),
      sender: 'me',
      time: timeStr,
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Simulate bot response after delay
    setTimeout(() => {
      const botResponse = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      const botMsg: ChatMsg = {
        id: `msg_${Date.now() + 1}`,
        text: botResponse,
        sender: 'bot',
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1000 + Math.random() * 1000);
  }, []);

  const addXp = useCallback((amount: number): GamificationData => {
    const currentUser = userRef.current;
    if (!currentUser?.id) {
      return gamification;
    }

    const newGamification = StorageService.addXp(currentUser.id, amount);
    setGamification(newGamification);
    return newGamification;
  }, [gamification]);

  const startPomodoroTimer = useCallback((duration: number = 25 * 60, mode: 'work' | 'break' = 'work') => {
    const newState: PomodoroState = {
      isRunning: true,
      startTime: Date.now(),
      duration,
      mode,
    };
    setPomodoro(newState);
    setPomodoroTimeLeft(duration);
    StorageService.startPomodoro(duration, mode);
  }, []);

  const stopPomodoroTimer = useCallback(() => {
    setPomodoro({ isRunning: false, startTime: null, duration: 25 * 60, mode: 'work' });
    setPomodoroTimeLeft(25 * 60);
    StorageService.stopPomodoro();
  }, []);

  const generateAiPlan = useCallback(async (): Promise<string> => {
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const plans = [
      `**Haftalık Çalışma Planı:**\n\n📅 **Pazartesi:** Çarpanlar ve Katlar tekrarı (30 dk)\n📅 **Salı:** 20 Soru Çözümü - Üslü İfadeler\n📅 **Çarşamba:** Video ders: Kareköklü Sayılar\n📅 **Perşembe:** Karma test (45 dk)\n📅 **Cuma:** Geometri - Üçgenler giriş`,
      `**Konu Bazlı Plan:**\n\n🎯 **Öncelik 1:** Kareköklü İfadeler (eksik)\n🎯 **Öncelik 2:** Üçgenler (eksik)\n🎯 **Öncelik 3:** Üslü İfadeler (devam)\n\n💡 **Öneri:** Günde 15 soru çözerek 2 hafta içinde tüm eksikleri kapatabilirsin!`,
    ];
    
    return plans[Math.floor(Math.random() * plans.length)];
  }, []);

  const refreshData = useCallback(() => {
    const currentUser = userRef.current;
    if (!currentUser?.id) return;

    try {
      setHomeworks(StorageService.getHomeworksForStudent(currentUser.id));
      setStats(StorageService.getStatsForStudent(currentUser.id));
      setTopics(StorageService.getTopicsForStudent(currentUser.id));
      setGamification(StorageService.getGamification(currentUser.id));
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }, []);

  // Memoized state object
  const state = useMemo<StudentSystemState>(() => ({
    homeworks,
    stats,
    topics,
    calendarEvents: CALENDAR_EVENTS,
    materials: MATERIALS,
    chatMessages,
    xp: gamification.xp,
    level: gamification.level,
    streak: gamification.streak,
    isLoading,
    error,
    pomodoro,
    pomodoroTimeLeft,
  }), [homeworks, stats, topics, chatMessages, gamification, isLoading, error, pomodoro, pomodoroTimeLeft]);

  // Memoized actions object
  const actions = useMemo<StudentSystemActions>(() => ({
    submitHomework,
    sendMessage,
    addXp,
    startPomodoro: startPomodoroTimer,
    stopPomodoro: stopPomodoroTimer,
    generateAiPlan,
    refreshData,
  }), [submitHomework, sendMessage, addXp, startPomodoroTimer, stopPomodoroTimer, generateAiPlan, refreshData]);

  return [state, actions];
}

export default useStudentSystem;




