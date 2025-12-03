
import { LucideIcon } from 'lucide-react';

// --- UI Types ---
export interface ServiceItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  message: string;
  grades?: string[];
}

// --- LMS Domain Types ---

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface User {
  id: string;
  email: string;
  password?: string; // Hashed password for secure auth
  full_name: string;
  role: UserRole;
  avatar?: string;
  is_premium?: boolean; // For students
  parentId?: string; // Link student to parent
  childId?: string; // Link parent to student
}

export interface Homework {
  id: string;
  studentId: string;
  teacherId: string;
  title: string;
  description: string;
  fileUrl?: string; // Teacher's attachment
  studentFileUrl?: string; // Student's submission
  status: 'pending' | 'delivered' | 'feedback_needed' | 'revision_needed';
  grade?: number;
  feedback?: string;
  dueDate: string;
  createdAt: string;
}

export interface ProgressStat {
  date: string;
  discipline: number; // 0-100
  mastery: number; // 0-100
  motivation: number; // 0-100
}

export interface Topic {
  id: string;
  studentId: string;
  subject: string;
  name: string;
  status: 'completed' | 'in_progress' | 'missing';
}

export interface Appointment {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  type: 'folder' | 'pdf' | 'image';
  parentId?: string; // null for root
  url?: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  url: string; // YouTube embed ID or URL
  assignedTo: string[]; // student IDs
  completedBy: string[]; // student IDs
}
