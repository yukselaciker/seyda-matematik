
import { User, Homework, ProgressStat, Topic, Appointment, ChatMessage, LibraryItem, VideoLesson, UserRole } from './types';

// --- STORAGE KEYS ---
const STORAGE_KEYS = {
  USERS: 'app_users',
  HOMEWORKS: 'app_homeworks',
  STATS: 'app_stats',
  TOPICS: 'app_topics',
  APPOINTMENTS: 'app_appointments',
  MESSAGES: 'app_messages',
  GAMIFICATION: 'app_gamification', // For XP and level
};

// --- DEFAULT DATA ---

const DEFAULT_USERS: User[] = [
  { id: '1', full_name: 'Şeyda Açıker', email: 'seyda.aciker@gmail.com', role: 'teacher', avatar: 'https://ui-avatars.com/api/?name=Seyda+Aciker&background=1C2A5E&color=fff' },
  { id: '2', full_name: 'Ali Efe İnaç', email: 'ali@student.com', role: 'student', is_premium: true, parentId: '3', avatar: 'https://ui-avatars.com/api/?name=Ali+Efe' },
  { id: '3', full_name: 'Ali\'nin Velisi', email: 'veli@parent.com', role: 'parent', childId: '2', avatar: 'https://ui-avatars.com/api/?name=Veli' },
  { id: '4', full_name: 'Zehra Yılmaz', email: 'zehra@student.com', role: 'student', is_premium: false, avatar: 'https://ui-avatars.com/api/?name=Zehra' },
];

const DEFAULT_HOMEWORKS: Homework[] = [
  { 
    id: 'hw1', studentId: '2', teacherId: '1', title: 'Çarpanlar ve Katlar', description: 'Sayfa 45-50 arası çözülecek.', 
    status: 'delivered', grade: 95, feedback: 'Harika iş çıkardın, sadece 3. soruda işlem hatası var.', 
    dueDate: '2024-05-20', createdAt: '2024-05-15', fileUrl: '#' 
  },
  { 
    id: 'hw2', studentId: '2', teacherId: '1', title: 'Üslü İfadeler', description: 'Test 3 çözülecek.', 
    status: 'pending', dueDate: '2024-05-25', createdAt: '2024-05-21' 
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

const DEFAULT_APPOINTMENTS: Appointment[] = [
  { id: 'a1', studentId: '2', teacherId: '1', date: '2024-05-24', time: '14:00', status: 'confirmed' },
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: 'm1', senderId: '2', text: 'Hocam 5. soruyu yapamadım, bakar mısınız?', timestamp: new Date(Date.now() - 1000000).toISOString() },
  { id: 'm2', senderId: '1', text: 'Tabii Ali, fotoğrafını atarsan yardımcı olurum.', timestamp: new Date(Date.now() - 900000).toISOString() },
];

const DEFAULT_GAMIFICATION: Record<string, { xp: number; level: number }> = {
  '2': { xp: 1250, level: 2 },
};

// --- STATIC DATA (not persisted) ---

const LIBRARY: LibraryItem[] = [
  { id: 'f1', title: 'LGS Hazırlık', type: 'folder' },
  { id: 'f2', title: 'Matematik', type: 'folder', parentId: 'f1' },
  { id: 'doc1', title: 'Üçgenler Konu Anlatımı.pdf', type: 'pdf', parentId: 'f2' },
  { id: 'doc2', title: 'Çıkmış Sorular 2023.pdf', type: 'pdf', parentId: 'f2' },
];

const VIDEOS: VideoLesson[] = [
  { id: 'v1', title: 'Kareköklü İfadeler Giriş', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', assignedTo: ['2'], completedBy: [] }
];

// --- GENERIC STORAGE HELPERS ---

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Failed to parse ${key}`, e);
  }
  // Initialize with default if empty
  saveToStorage(key, defaultValue);
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
}

// --- SPECIFIC GETTERS/SETTERS ---

const getStoredUsers = (): User[] => getFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
const saveUsers = (users: User[]) => saveToStorage(STORAGE_KEYS.USERS, users);

const getStoredHomeworks = (): Homework[] => getFromStorage(STORAGE_KEYS.HOMEWORKS, DEFAULT_HOMEWORKS);
const saveHomeworks = (homeworks: Homework[]) => saveToStorage(STORAGE_KEYS.HOMEWORKS, homeworks);

const getStoredStats = (): Record<string, ProgressStat[]> => getFromStorage(STORAGE_KEYS.STATS, DEFAULT_STATS);
const saveStats = (stats: Record<string, ProgressStat[]>) => saveToStorage(STORAGE_KEYS.STATS, stats);

const getStoredTopics = (): Topic[] => getFromStorage(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
const saveTopics = (topics: Topic[]) => saveToStorage(STORAGE_KEYS.TOPICS, topics);

const getStoredAppointments = (): Appointment[] => getFromStorage(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
const saveAppointments = (appointments: Appointment[]) => saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

const getStoredMessages = (): ChatMessage[] => getFromStorage(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
const saveMessages = (messages: ChatMessage[]) => saveToStorage(STORAGE_KEYS.MESSAGES, messages);

const getStoredGamification = (): Record<string, { xp: number; level: number }> => 
  getFromStorage(STORAGE_KEYS.GAMIFICATION, DEFAULT_GAMIFICATION);
const saveGamification = (data: Record<string, { xp: number; level: number }>) => 
  saveToStorage(STORAGE_KEYS.GAMIFICATION, data);

// --- API METHODS ---

export const mockApi = {
  // --- AUTH ---
  login: async (email: string) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Kullanıcı bulunamadı');
    return user;
  },

  register: async (name: string, email: string) => {
    await new Promise(r => setTimeout(r, 800));
    
    const users = getStoredUsers();
    
    const exists = users.some(u => u.email === email);
    if (exists) {
      throw new Error('Bu e-posta adresi ile zaten bir kayıt mevcut!');
    }

    const newUser: User = { 
      id: Math.random().toString(36).substr(2, 9), 
      full_name: name, 
      email, 
      role: 'student', 
      is_premium: false,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Initialize gamification for new user
    const gamification = getStoredGamification();
    gamification[newUser.id] = { xp: 0, level: 1 };
    saveGamification(gamification);
    
    return newUser;
  },

  // --- USERS ---
  getStudents: () => {
    return getStoredUsers().filter(u => u.role === 'student');
  },

  // --- HOMEWORKS ---
  getHomeworks: (userId: string, role: UserRole) => {
    const homeworks = getStoredHomeworks();
    if (role === 'student') return homeworks.filter(h => h.studentId === userId);
    if (role === 'teacher') return homeworks;
    if (role === 'parent') {
      const users = getStoredUsers();
      const parent = users.find(u => u.id === userId);
      return parent?.childId ? homeworks.filter(h => h.studentId === parent.childId) : [];
    }
    return [];
  },

  submitHomework: (hwId: string, fileUrl: string) => {
    const homeworks = getStoredHomeworks();
    const hw = homeworks.find(h => h.id === hwId);
    if (hw) {
      hw.status = 'delivered';
      hw.studentFileUrl = fileUrl;
      saveHomeworks(homeworks);
    }
  },

  gradeHomework: (hwId: string, grade: number, feedback: string) => {
    const homeworks = getStoredHomeworks();
    const hw = homeworks.find(h => h.id === hwId);
    if (hw) {
      hw.status = 'feedback_needed';
      hw.grade = grade;
      hw.feedback = feedback;
      saveHomeworks(homeworks);
    }
  },

  assignHomework: (studentId: string, title: string, desc: string) => {
    const homeworks = getStoredHomeworks();
    homeworks.push({
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      teacherId: '1',
      title,
      description: desc,
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });
    saveHomeworks(homeworks);
  },

  // --- STATS ---
  getStats: (studentId: string) => {
    const stats = getStoredStats();
    return stats[studentId] || [];
  },

  addStat: (studentId: string, discipline: number, mastery: number, motivation: number) => {
    const stats = getStoredStats();
    if (!stats[studentId]) {
      stats[studentId] = [];
    }
    const weekCount = stats[studentId].length + 1;
    stats[studentId].push({
      date: `H${weekCount}`,
      discipline,
      mastery,
      motivation
    });
    saveStats(stats);
  },

  // --- TOPICS ---
  getTopics: (studentId: string) => {
    const topics = getStoredTopics();
    return topics.filter(t => t.studentId === studentId);
  },

  updateTopicStatus: (topicId: string, status: Topic['status']) => {
    const topics = getStoredTopics();
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      topic.status = status;
      saveTopics(topics);
    }
  },

  // --- GAMIFICATION ---
  getGamification: (userId: string) => {
    const gamification = getStoredGamification();
    return gamification[userId] || { xp: 0, level: 1 };
  },

  addXp: (userId: string, amount: number) => {
    const gamification = getStoredGamification();
    if (!gamification[userId]) {
      gamification[userId] = { xp: 0, level: 1 };
    }
    gamification[userId].xp += amount;
    // Calculate new level (every 1000 XP = 1 level)
    gamification[userId].level = Math.floor(gamification[userId].xp / 1000) + 1;
    saveGamification(gamification);
    return gamification[userId];
  },

  // --- LIBRARY ---
  getLibrary: () => LIBRARY,

  // --- VIDEOS ---
  getVideos: (studentId: string) => VIDEOS.filter(v => v.assignedTo.includes(studentId)),

  // --- APPOINTMENTS ---
  getAppointments: (userId: string, role: UserRole) => {
    const appointments = getStoredAppointments();
    if (role === 'teacher') return appointments;
    if (role === 'student') return appointments.filter(a => a.studentId === userId);
    return [];
  },
  
  createAppointment: (studentId: string, date: string, time: string) => {
    const appointments = getStoredAppointments();
    appointments.push({
      id: Math.random().toString(),
      studentId,
      teacherId: '1',
      date,
      time,
      status: 'confirmed'
    });
    saveAppointments(appointments);
  },

  // --- MESSAGES ---
  getMessages: () => getStoredMessages(),

  sendMessage: (senderId: string, text: string) => {
    const messages = getStoredMessages();
    messages.push({
      id: Math.random().toString(),
      senderId,
      text,
      timestamp: new Date().toISOString()
    });
    saveMessages(messages);
  },

  // --- PREMIUM ---
  togglePremium: (studentId: string) => {
    const users = getStoredUsers();
    const student = users.find(u => u.id === studentId);
    if (student) {
      student.is_premium = !student.is_premium;
      saveUsers(users);
    }
  },
};
