/**
 * ActiveClassmates.tsx - Live Classroom Social Presence Widget
 * 
 * Features:
 * - Displays randomly selected "online" students
 * - Green pulsing ring animation
 * - Dynamic count display
 * - Clean, minimal design
 */

import React, { memo, useMemo, useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { User } from '../../types';

interface ActiveClassmatesProps {
  currentUserId?: string;
}

// --- STORAGE ---
const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem('app_users');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load users', e);
  }
  return [];
};

// --- MAIN COMPONENT ---
export const ActiveClassmates: React.FC<ActiveClassmatesProps> = memo(({ currentUserId }) => {
  const [activeStudents, setActiveStudents] = useState<User[]>([]);
  const [activeCount, setActiveCount] = useState(0);

  // Get all students and randomly select 3-5
  useEffect(() => {
    const updateActiveStudents = () => {
      const allUsers = getStoredUsers();
      const students = allUsers.filter(
        (u: User) => u.role === 'student' && u.id !== currentUserId
      );

      if (students.length === 0) {
        setActiveStudents([]);
        setActiveCount(0);
        return;
      }

      // Randomly select 3-5 students
      const count = Math.min(Math.max(3, Math.floor(Math.random() * 3) + 3), students.length);
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);

      setActiveStudents(selected);
      setActiveCount(count);
    };

    // Initial load
    updateActiveStudents();

    // Update every 30 seconds to simulate activity
    const interval = setInterval(updateActiveStudents, 30000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  if (activeCount === 0) {
    return (
      <div className="px-4 py-3 border-t border-indigo-900/50">
        <div className="flex items-center gap-2 text-xs text-indigo-300">
          <Users className="w-4 h-4" />
          <span>Henüz aktif öğrenci yok</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-indigo-900/50">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-indigo-300" />
        <span className="text-xs text-indigo-300">
          Şu an <span className="font-bold text-green-400">{activeCount}</span> öğrenci çalışıyor
        </span>
      </div>
      
      {/* Avatar Row with Status Dots */}
      <div className="flex items-center -space-x-2">
        {activeStudents.map((student, index) => (
          <div
            key={student.id}
            className="relative"
            style={{ zIndex: activeStudents.length - index }}
          >
            {/* Avatar */}
            <img
              src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || '')}&background=10b981&color=fff`}
              alt={student.full_name}
              className="w-10 h-10 rounded-full border-2 border-[#1C2A5E] bg-slate-700"
              title={student.full_name}
            />
            {/* PRODUCTION: Static green dot - non-distracting */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1C2A5E]" />
          </div>
        ))}
      </div>
    </div>
  );
});

ActiveClassmates.displayName = 'ActiveClassmates';

export default ActiveClassmates;

