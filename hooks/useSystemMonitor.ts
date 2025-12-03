/**
 * useSystemMonitor.ts - System Watchdog Hook (Layer 2: The Watchdog)
 * 
 * Continuously monitors system health and auto-repairs corrupt data
 * Runs checks on mount and every 10 seconds
 */

import { useEffect, useCallback, useRef } from 'react';

// --- DEFAULT DATA FOR SELF-HEALING ---
const DEFAULT_USERS = [
  { 
    id: '1', 
    full_name: 'Şeyda Açıker', 
    email: 'seyda.aciker@gmail.com', 
    password: 'demo123', 
    role: 'teacher', 
    avatar: 'https://ui-avatars.com/api/?name=Seyda+Aciker&background=1C2A5E&color=fff' 
  },
  { 
    id: '2', 
    full_name: 'Ali Efe İnaç', 
    email: 'ali@student.com', 
    password: 'demo123', 
    role: 'student', 
    is_premium: true, 
    parentId: '3', 
    avatar: 'https://ui-avatars.com/api/?name=Ali+Efe' 
  },
  { 
    id: '3', 
    full_name: 'Ali\'nin Velisi', 
    email: 'veli@parent.com', 
    password: 'demo123', 
    role: 'parent', 
    childId: '2', 
    avatar: 'https://ui-avatars.com/api/?name=Veli' 
  },
  { 
    id: '4', 
    full_name: 'Zehra Yılmaz', 
    email: 'zehra@student.com', 
    password: 'demo123', 
    role: 'student', 
    is_premium: false, 
    avatar: 'https://ui-avatars.com/api/?name=Zehra' 
  },
];

const DEFAULT_HOMEWORKS = [
  { 
    id: 'hw1', 
    studentId: '2', 
    teacherId: '1', 
    title: 'Çarpanlar ve Katlar', 
    description: 'Sayfa 45-50 arası çözülecek.', 
    status: 'delivered', 
    grade: 95, 
    feedback: 'Harika iş çıkardın!', 
    dueDate: '2024-05-20', 
    createdAt: '2024-05-15', 
    fileUrl: '#' 
  },
  { 
    id: 'hw2', 
    studentId: '2', 
    teacherId: '1', 
    title: 'Üslü İfadeler', 
    description: 'Test 3 çözülecek.', 
    status: 'pending', 
    dueDate: '2024-05-25', 
    createdAt: '2024-05-21' 
  },
];

// Keys to monitor with their default values
interface StorageKeyConfig {
  key: string;
  defaultValue: any;
  isRequired: boolean;
  validateFn?: (data: any) => boolean;
}

const MONITORED_KEYS: StorageKeyConfig[] = [
  { 
    key: 'app_users', 
    defaultValue: DEFAULT_USERS, 
    isRequired: true,
    validateFn: (data) => Array.isArray(data) && data.length > 0
  },
  { 
    key: 'app_homeworks', 
    defaultValue: DEFAULT_HOMEWORKS, 
    isRequired: false,
    validateFn: (data) => Array.isArray(data)
  },
  { 
    key: 'app_appointments', 
    defaultValue: [], 
    isRequired: false,
    validateFn: (data) => Array.isArray(data)
  },
  { 
    key: 'app_videos', 
    defaultValue: [], 
    isRequired: false,
    validateFn: (data) => Array.isArray(data)
  },
  { 
    key: 'app_notifications', 
    defaultValue: [], 
    isRequired: false,
    validateFn: (data) => Array.isArray(data)
  },
  { 
    key: 'app_calendar_events', 
    defaultValue: [], 
    isRequired: false,
    validateFn: (data) => Array.isArray(data)
  },
  { 
    key: 'app_flashcard_decks', 
    defaultValue: [], 
    isRequired: false,
    validateFn: (data) => Array.isArray(data)
  },
  { 
    key: 'app_chat_messages', 
    defaultValue: [], 
    isRequired: false,
    validateFn: (data) => Array.isArray(data)
  },
];

// Health check result
interface HealthCheckResult {
  isHealthy: boolean;
  repairedKeys: string[];
  errors: string[];
  timestamp: Date;
}

// Hook options
interface UseSystemMonitorOptions {
  enabled?: boolean;
  intervalMs?: number;
  onHealthCheck?: (result: HealthCheckResult) => void;
  onRepair?: (key: string, reason: string) => void;
}

/**
 * System Health Monitor Hook
 * Continuously monitors and auto-repairs localStorage data
 */
export function useSystemMonitor(options: UseSystemMonitorOptions = {}) {
  const {
    enabled = true,
    intervalMs = 10000, // 10 seconds
    onHealthCheck,
    onRepair,
  } = options;

  const isFirstRun = useRef(true);
  const lastCheckResult = useRef<HealthCheckResult | null>(null);

  /**
   * Safely get and parse localStorage item
   */
  const safeGetItem = useCallback((key: string): { success: boolean; data: any; error?: string } => {
    try {
      const raw = localStorage.getItem(key);
      
      if (raw === null) {
        return { success: false, data: null, error: 'Key does not exist' };
      }

      const parsed = JSON.parse(raw);
      return { success: true, data: parsed };
    } catch (error) {
      return { 
        success: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown parse error' 
      };
    }
  }, []);

  /**
   * Safely set localStorage item
   */
  const safeSetItem = useCallback((key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`❌ System Monitor: Failed to write ${key}:`, error);
      return false;
    }
  }, []);

  /**
   * Repair a single storage key
   */
  const repairKey = useCallback((config: StorageKeyConfig, reason: string): boolean => {
    console.warn(`🔧 System Health: Repairing "${config.key}" - Reason: ${reason}`);
    
    const success = safeSetItem(config.key, config.defaultValue);
    
    if (success) {
      console.log(`✅ System Health: Successfully repaired "${config.key}"`);
      onRepair?.(config.key, reason);
    }
    
    return success;
  }, [safeSetItem, onRepair]);

  /**
   * Run full system health check
   */
  const runHealthCheck = useCallback((): HealthCheckResult => {
    const result: HealthCheckResult = {
      isHealthy: true,
      repairedKeys: [],
      errors: [],
      timestamp: new Date(),
    };

    if (isFirstRun.current) {
      console.log('🏥 System Monitor: Running initial health check...');
    }

    for (const config of MONITORED_KEYS) {
      const { success, data, error } = safeGetItem(config.key);

      // Case 1: Key doesn't exist
      if (!success && error === 'Key does not exist') {
        if (config.isRequired) {
          // Required key missing - repair it
          if (repairKey(config, 'Missing required key')) {
            result.repairedKeys.push(config.key);
          } else {
            result.isHealthy = false;
            result.errors.push(`Failed to repair ${config.key}`);
          }
        }
        // Non-required keys can be missing - that's fine
        continue;
      }

      // Case 2: Parse error (corrupt data)
      if (!success) {
        result.isHealthy = false;
        console.error(`💥 System Health: Corrupt data detected in "${config.key}": ${error}`);
        
        if (repairKey(config, `Corrupt data: ${error}`)) {
          result.repairedKeys.push(config.key);
          result.isHealthy = true; // Recovered
        } else {
          result.errors.push(`Corrupt and unrepairable: ${config.key}`);
        }
        continue;
      }

      // Case 3: Data exists but fails validation
      if (config.validateFn && !config.validateFn(data)) {
        console.warn(`⚠️ System Health: Invalid data structure in "${config.key}"`);
        
        if (repairKey(config, 'Failed validation')) {
          result.repairedKeys.push(config.key);
        }
        continue;
      }
    }

    // Log summary
    if (result.repairedKeys.length > 0) {
      console.log(`🔧 System Health: Repaired ${result.repairedKeys.length} key(s):`, result.repairedKeys);
    } else if (isFirstRun.current) {
      console.log('✅ System Health: All systems operational');
    }

    lastCheckResult.current = result;
    onHealthCheck?.(result);
    isFirstRun.current = false;

    return result;
  }, [safeGetItem, repairKey, onHealthCheck]);

  /**
   * Force repair all monitored keys (nuclear option)
   */
  const forceRepairAll = useCallback((): void => {
    console.warn('🚨 System Monitor: Force repairing ALL monitored keys...');
    
    for (const config of MONITORED_KEYS) {
      repairKey(config, 'Force repair requested');
    }
    
    console.log('✅ System Monitor: Force repair complete');
  }, [repairKey]);

  /**
   * Get current health status
   */
  const getHealthStatus = useCallback((): HealthCheckResult | null => {
    return lastCheckResult.current;
  }, []);

  // Set up monitoring interval
  useEffect(() => {
    if (!enabled) return;

    // Run initial check immediately
    runHealthCheck();

    // Set up periodic checks
    const intervalId = setInterval(() => {
      runHealthCheck();
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, intervalMs, runHealthCheck]);

  // Listen for storage events from other tabs
  useEffect(() => {
    if (!enabled) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith('app_')) {
        // Another tab modified our data - verify it's valid
        const config = MONITORED_KEYS.find(k => k.key === event.key);
        if (config) {
          const { success, data } = safeGetItem(event.key!);
          if (!success || (config.validateFn && !config.validateFn(data))) {
            console.warn(`⚠️ System Monitor: External modification corrupted "${event.key}", repairing...`);
            repairKey(config, 'External modification caused corruption');
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [enabled, safeGetItem, repairKey]);

  return {
    runHealthCheck,
    forceRepairAll,
    getHealthStatus,
    isEnabled: enabled,
  };
}

export default useSystemMonitor;




