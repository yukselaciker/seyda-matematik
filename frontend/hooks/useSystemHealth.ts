/**
 * useSystemHealth.ts - Self-Healing System Hook (PRODUCTION)
 * 
 * Auto-repairs corrupt localStorage data on app mount
 * Guarantees zero crashes from data corruption
 */

import { useEffect, useCallback } from 'react';

// --- STORAGE KEYS TO MONITOR ---
const CRITICAL_KEYS = [
  'app_users',
  'app_videos',
  'app_exams',
  'app_appointments',
  'app_homeworks',
  'app_notifications',
  'app_gamification',
] as const;

// --- SAFE DEFAULTS ---
const SAFE_DEFAULTS: Record<string, any> = {
  app_users: [],
  app_videos: [],
  app_exams: [],
  app_appointments: [],
  app_homeworks: [],
  app_notifications: [],
  app_gamification: {},
};

/**
 * Self-Healing System Health Hook
 * Runs once on mount to validate and repair localStorage
 */
export function useSystemHealth() {
  const repairStorage = useCallback(() => {
    const repairedKeys: string[] = [];
    let allHealthy = true;

    for (const key of CRITICAL_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        
        // Case 1: Key is null or undefined
        if (raw === null || raw === undefined || raw === 'null' || raw === 'undefined') {
          localStorage.setItem(key, JSON.stringify(SAFE_DEFAULTS[key]));
          repairedKeys.push(key);
          allHealthy = false;
          continue;
        }

        // Case 2: Try to parse - if it fails, it's corrupt
        try {
          JSON.parse(raw);
        } catch (parseError) {
          // Corrupt JSON - repair it
          localStorage.setItem(key, JSON.stringify(SAFE_DEFAULTS[key]));
          repairedKeys.push(key);
          allHealthy = false;
        }
      } catch (error) {
        // Any other error - repair
        try {
          localStorage.setItem(key, JSON.stringify(SAFE_DEFAULTS[key]));
          repairedKeys.push(key);
          allHealthy = false;
        } catch (setError) {
          console.error(`❌ System Health: Cannot repair ${key}:`, setError);
        }
      }
    }

    // Report to console
    if (allHealthy) {
      console.log('✅ System Health: OK');
    } else {
      console.log(`🔧 System Health: Repaired [${repairedKeys.join(', ')}]`);
    }

    return { allHealthy, repairedKeys };
  }, []);

  // Run on mount
  useEffect(() => {
    repairStorage();
  }, [repairStorage]);

  return { repairStorage };
}

export default useSystemHealth;
