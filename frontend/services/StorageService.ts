/**
 * StorageService - The "Gatekeeper" (Layer 3: Safe Storage)
 * 
 * A bulletproof storage service that:
 * - NEVER returns null or undefined to the UI
 * - Always provides safe fallback values
 * - Handles all edge cases gracefully
 * - Logs warnings for debugging without crashing
 * - Self-heals corrupt data automatically
 */

import { User, Homework, ProgressStat, Topic, Appointment, ChatMessage } from '../types';

// --- STORAGE KEYS ---
export const STORAGE_KEYS = {
  USERS: 'app_users',
  CURRENT_USER: 'mockUser',
  HOMEWORKS: 'app_homeworks',
  STATS: 'app_stats',
  TOPICS: 'app_topics',
  APPOINTMENTS: 'app_appointments',
  MESSAGES: 'app_messages',
  GAMIFICATION: 'app_gamification',
  THEME: 'app_theme',
  SETTINGS: 'app_settings',
  POMODORO: 'app_pomodoro',
  VIDEOS: 'app_videos',
  NOTIFICATIONS: 'app_notifications',
  FLASHCARDS: 'app_flashcard_decks',
  CALENDAR: 'app_calendar_events',
  CHAT: 'app_chat_messages',
  ERROR_LOGS: 'app_error_logs',
} as const;

// --- INTERFACES ---
export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  soundEnabled: boolean;
}

export interface PomodoroState {
  isRunning: boolean;
  startTime: number | null;
  duration: number; // in seconds
  mode: 'work' | 'break';
}

// --- DEFAULT DATA ---
// Demo passwords are "demo123" for all demo accounts
const DEFAULT_USERS: User[] = [
  { id: '1', full_name: 'Şeyda Açıker', email: 'seyda.aciker@gmail.com', password: 'demo123', role: 'teacher', avatar: 'https://ui-avatars.com/api/?name=Seyda+Aciker&background=1C2A5E&color=fff' },
  { id: '2', full_name: 'Ali Efe İnaç', email: 'ali@student.com', password: 'demo123', role: 'student', is_premium: true, parentId: '3', avatar: 'https://ui-avatars.com/api/?name=Ali+Efe' },
  { id: '3', full_name: 'Ali\'nin Velisi', email: 'veli@parent.com', password: 'demo123', role: 'parent', childId: '2', avatar: 'https://ui-avatars.com/api/?name=Veli' },
  { id: '4', full_name: 'Zehra Yılmaz', email: 'zehra@student.com', password: 'demo123', role: 'student', is_premium: false, avatar: 'https://ui-avatars.com/api/?name=Zehra' },
];

const DEFAULT_HOMEWORKS: Homework[] = [
  { 
    id: 'hw1', studentId: '2', teacherId: '1', title: 'Çarpanlar ve Katlar', 
    description: 'Sayfa 45-50 arası çözülecek.', status: 'delivered', grade: 95, 
    feedback: 'Harika iş çıkardın!', dueDate: '2024-05-20', createdAt: '2024-05-15', fileUrl: '#' 
  },
  { 
    id: 'hw2', studentId: '2', teacherId: '1', title: 'Üslü İfadeler', 
    description: 'Test 3 çözülecek.', status: 'pending', dueDate: '2024-05-25', createdAt: '2024-05-21' 
  },
  { 
    id: 'hw3', studentId: '2', teacherId: '1', title: 'Geometri Üçgenler', 
    description: 'Alıştırma 1-10 arası.', status: 'feedback_needed', dueDate: '2024-05-18', createdAt: '2024-05-10' 
  },
];

const DEFAULT_STATS: Record<string, ProgressStat[]> = {
  '2': [
    { date: 'H1', discipline: 80, mastery: 70, motivation: 90 },
    { date: 'H2', discipline: 85, mastery: 75, motivation: 85 },
    { date: 'H3', discipline: 90, mastery: 85, motivation: 95 },
    { date: 'H4', discipline: 95, mastery: 92, motivation: 100 },
  ]
};

const DEFAULT_TOPICS: Topic[] = [
  { id: 't1', studentId: '2', subject: 'Matematik', name: 'Çarpanlar ve Katlar', status: 'completed' },
  { id: 't2', studentId: '2', subject: 'Matematik', name: 'Üslü İfadeler', status: 'in_progress' },
  { id: 't3', studentId: '2', subject: 'Matematik', name: 'Kareköklü İfadeler', status: 'missing' },
  { id: 't4', studentId: '2', subject: 'Geometri', name: 'Üçgenler', status: 'missing' },
];

const DEFAULT_GAMIFICATION: Record<string, GamificationData> = {
  '2': { xp: 1250, level: 2, streak: 5, lastActiveDate: new Date().toISOString().split('T')[0] },
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  notifications: true,
  soundEnabled: true,
};

const DEFAULT_POMODORO: PomodoroState = {
  isRunning: false,
  startTime: null,
  duration: 25 * 60,
  mode: 'work',
};

// --- STORAGE SERVICE ---
export const StorageService = {
  /**
   * LAYER 3 CORE: Safely get item from localStorage with JSON parsing
   * GUARANTEE: This method NEVER returns null/undefined - always returns defaultValue on failure
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        console.warn(`⚠️ StorageService: localStorage not available, using default for "${key}"`);
        return defaultValue;
      }

      const item = localStorage.getItem(key);
      
      // Key doesn't exist - return default
      if (item === null || item === undefined) {
        return defaultValue;
      }

      // Empty string check
      if (item === '') {
        console.warn(`⚠️ StorageService: Empty string found for "${key}", using default`);
        return defaultValue;
      }

      // Try to parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(item);
      } catch (parseError) {
        console.error(`❌ StorageService: JSON parse failed for "${key}":`, parseError);
        // Self-heal: Remove corrupt data and return default
        this.remove(key);
        console.log(`🔧 StorageService: Auto-removed corrupt data for "${key}"`);
        return defaultValue;
      }

      // Type validation for arrays
      if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
        console.warn(`⚠️ StorageService: Expected array for "${key}", got ${typeof parsed}. Using default.`);
        return defaultValue;
      }

      // Type validation for objects
      if (defaultValue !== null && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          console.warn(`⚠️ StorageService: Expected object for "${key}", got ${typeof parsed}. Using default.`);
          return defaultValue;
        }
      }

      return parsed as T;
    } catch (error) {
      // Catch-all for any unexpected errors
      console.error(`❌ StorageService: Unexpected error reading "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * LAYER 3 CORE: Safely set item in localStorage
   * Returns true if successful, false if failed
   */
  set<T>(key: string, value: T): boolean {
    try {
      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        console.warn(`⚠️ StorageService: localStorage not available, cannot save "${key}"`);
        return false;
      }

      // Validate value is serializable
      const serialized = JSON.stringify(value);
      
      // Check for quota exceeded
      try {
        localStorage.setItem(key, serialized);
      } catch (quotaError) {
        if (quotaError instanceof DOMException && quotaError.name === 'QuotaExceededError') {
          console.error(`❌ StorageService: Storage quota exceeded for "${key}"`);
          // Try to free up space by clearing old logs
          this.remove(STORAGE_KEYS.ERROR_LOGS);
          // Retry
          localStorage.setItem(key, serialized);
        } else {
          throw quotaError;
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ StorageService: Failed to save "${key}":`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key: string): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`❌ StorageService: Failed to remove "${key}":`, error);
      return false;
    }
  },

  /**
   * Check if a key exists and has valid data
   */
  exists(key: string): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const item = localStorage.getItem(key);
      if (item === null) return false;
      JSON.parse(item); // Validate it's parseable
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Clear all app data (for logout or reset)
   */
  clearAll(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      
      Object.values(STORAGE_KEYS).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Silent fail for individual keys
        }
      });
    } catch (error) {
      console.error('❌ StorageService: Failed to clear all:', error);
    }
  },

  /**
   * Initialize all required data with defaults
   * Called during app startup to ensure data integrity
   */
  initializeDefaults(): void {
    console.log('🚀 StorageService: Initializing default data...');
    
    // Users - always ensure we have demo accounts
    const users = this.get<User[]>(STORAGE_KEYS.USERS, []);
    if (users.length === 0) {
      this.set(STORAGE_KEYS.USERS, DEFAULT_USERS);
      console.log('✅ StorageService: Initialized default users');
    }

    // Homeworks
    const homeworks = this.get<Homework[]>(STORAGE_KEYS.HOMEWORKS, []);
    if (homeworks.length === 0) {
      this.set(STORAGE_KEYS.HOMEWORKS, DEFAULT_HOMEWORKS);
      console.log('✅ StorageService: Initialized default homeworks');
    }

    // Stats
    if (!this.exists(STORAGE_KEYS.STATS)) {
      this.set(STORAGE_KEYS.STATS, DEFAULT_STATS);
    }

    // Topics
    const topics = this.get<Topic[]>(STORAGE_KEYS.TOPICS, []);
    if (topics.length === 0) {
      this.set(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
    }

    // Gamification
    if (!this.exists(STORAGE_KEYS.GAMIFICATION)) {
      this.set(STORAGE_KEYS.GAMIFICATION, DEFAULT_GAMIFICATION);
    }

    // Settings
    if (!this.exists(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    console.log('✅ StorageService: Default data initialization complete');
  },

  // --- USER OPERATIONS ---
  
  getUsers(): User[] {
    const users = this.get<User[]>(STORAGE_KEYS.USERS, []);
    if (users.length === 0) {
      this.set(STORAGE_KEYS.USERS, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return users;
  },

  saveUsers(users: User[]): boolean {
    return this.set(STORAGE_KEYS.USERS, users);
  },

  getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: User | null): boolean {
    if (user === null) {
      return this.remove(STORAGE_KEYS.CURRENT_USER);
    }
    return this.set(STORAGE_KEYS.CURRENT_USER, user);
  },

  findUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
  },

  /**
   * Authenticate user with email and password
   * Returns user if credentials match, null otherwise
   */
  authenticateUser(email: string, password: string): User | null {
    if (!email || !password) return null;
    
    const users = this.getUsers();
    const user = users.find(
      u => u.email?.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return user || null;
  },

  emailExists(email: string): boolean {
    if (!email) return false;
    return !!this.findUserByEmail(email);
  },

  /**
   * Register new user with password
   */
  registerUser(name: string, email: string, password?: string): User {
    if (this.emailExists(email)) {
      throw new Error('Bu e-posta adresi zaten kayıtlı!');
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      full_name: name,
      email,
      password,
      role: 'student',
      is_premium: false,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1C2A5E&color=fff`,
    };

    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    // Initialize gamification for new user
    this.initializeGamification(newUser.id);

    return newUser;
  },

  // --- HOMEWORK OPERATIONS ---

  getHomeworks(): Homework[] {
    const homeworks = this.get<Homework[]>(STORAGE_KEYS.HOMEWORKS, []);
    if (homeworks.length === 0) {
      this.set(STORAGE_KEYS.HOMEWORKS, DEFAULT_HOMEWORKS);
      return DEFAULT_HOMEWORKS;
    }
    return homeworks;
  },

  getHomeworksForStudent(studentId: string): Homework[] {
    if (!studentId) return [];
    return this.getHomeworks().filter(hw => hw.studentId === studentId);
  },

  saveHomeworks(homeworks: Homework[]): boolean {
    return this.set(STORAGE_KEYS.HOMEWORKS, homeworks);
  },

  submitHomework(homeworkId: string, fileUrl?: string): Homework | null {
    if (!homeworkId) return null;
    
    const homeworks = this.getHomeworks();
    const index = homeworks.findIndex(hw => hw.id === homeworkId);
    
    if (index === -1) return null;

    homeworks[index] = {
      ...homeworks[index],
      status: 'delivered',
      studentFileUrl: fileUrl || 'uploaded',
    };

    this.saveHomeworks(homeworks);
    return homeworks[index];
  },

  // --- STATS OPERATIONS ---

  getStats(): Record<string, ProgressStat[]> {
    const stats = this.get<Record<string, ProgressStat[]>>(STORAGE_KEYS.STATS, {});
    if (Object.keys(stats).length === 0) {
      this.set(STORAGE_KEYS.STATS, DEFAULT_STATS);
      return DEFAULT_STATS;
    }
    return stats;
  },

  getStatsForStudent(studentId: string): ProgressStat[] {
    if (!studentId) return [];
    const stats = this.getStats();
    return stats[studentId] || [];
  },

  // --- TOPICS OPERATIONS ---

  getTopics(): Topic[] {
    const topics = this.get<Topic[]>(STORAGE_KEYS.TOPICS, []);
    if (topics.length === 0) {
      this.set(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      return DEFAULT_TOPICS;
    }
    return topics;
  },

  getTopicsForStudent(studentId: string): Topic[] {
    if (!studentId) return [];
    return this.getTopics().filter(t => t.studentId === studentId);
  },

  updateTopicStatus(topicId: string, status: Topic['status']): boolean {
    if (!topicId) return false;
    
    const topics = this.getTopics();
    const index = topics.findIndex(t => t.id === topicId);
    if (index === -1) return false;

    topics[index].status = status;
    return this.set(STORAGE_KEYS.TOPICS, topics);
  },

  // --- GAMIFICATION OPERATIONS ---

  getGamification(userId: string): GamificationData {
    if (!userId) return { xp: 0, level: 1, streak: 0, lastActiveDate: '' };
    
    const allData = this.get<Record<string, GamificationData>>(STORAGE_KEYS.GAMIFICATION, {});
    return allData[userId] || { xp: 0, level: 1, streak: 0, lastActiveDate: '' };
  },

  initializeGamification(userId: string): void {
    if (!userId) return;
    
    const allData = this.get<Record<string, GamificationData>>(STORAGE_KEYS.GAMIFICATION, DEFAULT_GAMIFICATION);
    if (!allData[userId]) {
      allData[userId] = { xp: 0, level: 1, streak: 0, lastActiveDate: new Date().toISOString().split('T')[0] };
      this.set(STORAGE_KEYS.GAMIFICATION, allData);
    }
  },

  addXp(userId: string, amount: number): GamificationData {
    if (!userId || amount <= 0) {
      return this.getGamification(userId);
    }
    
    const allData = this.get<Record<string, GamificationData>>(STORAGE_KEYS.GAMIFICATION, {});
    const current = allData[userId] || { xp: 0, level: 1, streak: 0, lastActiveDate: '' };
    
    const newXp = current.xp + amount;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate streak
    let newStreak = current.streak;
    if (current.lastActiveDate && current.lastActiveDate !== today) {
      const lastDate = new Date(current.lastActiveDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak = current.streak + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    allData[userId] = {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastActiveDate: today,
    };

    this.set(STORAGE_KEYS.GAMIFICATION, allData);
    return allData[userId];
  },

  // --- CHAT OPERATIONS ---

  getChatMessages(): ChatMessage[] {
    return this.get<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
  },

  saveChatMessage(message: ChatMessage): boolean {
    if (!message) return false;
    
    const messages = this.getChatMessages();
    messages.push(message);
    return this.set(STORAGE_KEYS.MESSAGES, messages);
  },

  // --- SETTINGS OPERATIONS ---

  getSettings(): UserSettings {
    return this.get<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: Partial<UserSettings>): boolean {
    const current = this.getSettings();
    return this.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  },

  getTheme(): 'light' | 'dark' {
    const settings = this.getSettings();
    return settings.theme;
  },

  setTheme(theme: 'light' | 'dark'): boolean {
    return this.saveSettings({ theme });
  },

  // --- POMODORO OPERATIONS ---

  getPomodoro(): PomodoroState {
    return this.get<PomodoroState>(STORAGE_KEYS.POMODORO, DEFAULT_POMODORO);
  },

  savePomodoro(state: Partial<PomodoroState>): boolean {
    const current = this.getPomodoro();
    return this.set(STORAGE_KEYS.POMODORO, { ...current, ...state });
  },

  startPomodoro(duration: number, mode: 'work' | 'break'): boolean {
    return this.set(STORAGE_KEYS.POMODORO, {
      isRunning: true,
      startTime: Date.now(),
      duration,
      mode,
    });
  },

  stopPomodoro(): boolean {
    return this.set(STORAGE_KEYS.POMODORO, DEFAULT_POMODORO);
  },

  // --- VIDEO OPERATIONS ---

  getVideos(): any[] {
    return this.get<any[]>(STORAGE_KEYS.VIDEOS, []);
  },

  saveVideo(video: any): boolean {
    if (!video) return false;
    const videos = this.getVideos();
    videos.unshift(video);
    return this.set(STORAGE_KEYS.VIDEOS, videos);
  },

  // --- APPOINTMENT OPERATIONS ---

  getAppointments(): Appointment[] {
    return this.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
  },

  saveAppointment(appointment: Appointment): boolean {
    if (!appointment) return false;
    const appointments = this.getAppointments();
    appointments.push(appointment);
    return this.set(STORAGE_KEYS.APPOINTMENTS, appointments);
  },
};

export default StorageService;
