/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Automatically detects environment and uses appropriate backend URL.
 * 
 * Features:
 * - Dynamic URL detection (Vercel/localhost)
 * - Timeout handling for Render free tier (server sleep)
 * - "Server waking up" status detection
 */

// Production backend URL (Render)
const PRODUCTION_API_URL = 'https://seyda-matematik-api.onrender.com';

// Development backend URL (Local)
const DEVELOPMENT_API_URL = 'http://localhost:5001';

// Timeout settings (Render free tier can take up to 60s to wake up)
export const API_TIMEOUT_MS = 60000; // 60 seconds
export const SERVER_WAKE_THRESHOLD_MS = 5000; // Show "waking up" message after 5 seconds

/**
 * Determines if we're running in production environment
 * Checks multiple indicators:
 * 1. Vite's import.meta.env.PROD
 * 2. Hostname (vercel.app or custom domain)
 * 3. Explicit VITE_API_URL environment variable
 */
const isProduction = (): boolean => {
  // Check Vite's built-in production flag
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) {
    return true;
  }
  
  // Check if running on Vercel or production domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (
      hostname.includes('vercel.app') ||
      hostname.includes('seyda-matematik') ||
      hostname !== 'localhost' && hostname !== '127.0.0.1'
    ) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get the API base URL based on environment
 * Priority:
 * 1. VITE_API_URL environment variable (if set)
 * 2. Auto-detect based on environment
 */
export const getApiUrl = (): string => {
  // First check for explicit environment variable
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Auto-detect based on environment
  return isProduction() ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
};

/**
 * API Base URL - use this in your fetch/axios calls
 * @example
 * fetch(`${API_URL}/api/contact`, { ... })
 */
export const API_URL = getApiUrl();

/**
 * API Endpoints - centralized endpoint definitions
 */
export const API_ENDPOINTS = {
  // Contact form
  CONTACT: '/api/contact',
  CONTACTS: '/api/contacts',
  
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  
  // Admin endpoints
  ADMIN_USERS: '/api/admin/users',
  ADMIN_STATS: '/api/admin/stats',
  
  // Health check
  HEALTH: '/api/health',
} as const;

/**
 * Helper function to build full API URL
 * @param endpoint - API endpoint path
 * @returns Full API URL
 * @example
 * const url = buildApiUrl(API_ENDPOINTS.CONTACT);
 * // Returns: "https://seyda-matematik-api.onrender.com/api/contact" in production
 * // Returns: "http://localhost:5001/api/contact" in development
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};

/**
 * Default fetch options with credentials for cookie/session handling
 */
export const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Helper function for API POST requests
 */
export const apiPost = async <T>(endpoint: string, data: object): Promise<T> => {
  const response = await fetch(buildApiUrl(endpoint), {
    ...defaultFetchOptions,
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * Helper function for API GET requests
 */
export const apiGet = async <T>(endpoint: string, token?: string): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(buildApiUrl(endpoint), {
    ...defaultFetchOptions,
    method: 'GET',
    headers,
  });
  return response.json();
};

/**
 * Helper function for API DELETE requests
 */
export const apiDelete = async <T>(endpoint: string, token?: string): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(buildApiUrl(endpoint), {
    ...defaultFetchOptions,
    method: 'DELETE',
    headers,
  });
  return response.json();
};

/**
 * Helper function for API PATCH requests
 */
export const apiPatch = async <T>(endpoint: string, data: object, token?: string): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(buildApiUrl(endpoint), {
    ...defaultFetchOptions,
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  try {
    // Try mockUser first (used by AuthPage)
    const mockUserStr = localStorage.getItem('mockUser');
    if (mockUserStr) {
      const user = JSON.parse(mockUserStr);
      if (user.token) return user.token;
    }
    
    // Try auth_token directly
    const directToken = localStorage.getItem('auth_token');
    if (directToken) return directToken;
    
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return null;
};

// ============================================
// ROBUST FETCH WITH TIMEOUT & SERVER WAKE-UP
// ============================================

/**
 * API Response type for robust fetch
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  isServerWaking?: boolean;
  isTimeout?: boolean;
}

/**
 * Fetch with timeout - aborts request after specified time
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number = API_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Robust API fetch with timeout handling and server wake-up detection
 * 
 * @param endpoint - API endpoint (e.g., '/api/contact')
 * @param options - Fetch options
 * @param onServerWaking - Callback when server appears to be waking up
 * @returns ApiResult with data or error
 * 
 * @example
 * const result = await apiFetch('/api/contact', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * }, () => setIsServerWaking(true));
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
  onServerWaking?: () => void
): Promise<ApiResult<T>> => {
  const url = buildApiUrl(endpoint);
  const startTime = Date.now();
  
  // Set up wake-up detection
  let wakeUpTimeout: NodeJS.Timeout | null = null;
  if (onServerWaking) {
    wakeUpTimeout = setTimeout(() => {
      onServerWaking();
    }, SERVER_WAKE_THRESHOLD_MS);
  }
  
  const fetchOptions: RequestInit = {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetchWithTimeout(url, fetchOptions, API_TIMEOUT_MS);
    
    // Clear wake-up timeout
    if (wakeUpTimeout) clearTimeout(wakeUpTimeout);
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ API Response: ${response.status} (${elapsed}ms)`);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Sunucu hatası: ${response.status}`,
        isServerWaking: elapsed > SERVER_WAKE_THRESHOLD_MS,
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data.data || data,
      isServerWaking: elapsed > SERVER_WAKE_THRESHOLD_MS,
    };
    
  } catch (error: any) {
    // Clear wake-up timeout
    if (wakeUpTimeout) clearTimeout(wakeUpTimeout);
    
    const elapsed = Date.now() - startTime;
    console.error(`❌ API Error (${elapsed}ms):`, error);
    
    // Handle abort (timeout)
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Bağlantı zaman aşımına uğradı. Sunucu yanıt vermiyor.',
        isTimeout: true,
        isServerWaking: true,
      };
    }
    
    // Handle network errors
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      return {
        success: false,
        error: 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.',
        isServerWaking: elapsed > SERVER_WAKE_THRESHOLD_MS,
      };
    }
    
    return {
      success: false,
      error: error.message || 'Beklenmeyen bir hata oluştu.',
    };
  }
};

/**
 * Check if the API server is awake/healthy
 * Useful for showing "server waking up" message proactively
 */
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(
      buildApiUrl(API_ENDPOINTS.HEALTH),
      { method: 'GET' },
      10000 // 10 second timeout for health check
    );
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Log current API configuration (for debugging)
 */
export const logApiConfig = (): void => {
  console.log('🔧 API Configuration:');
  console.log('  - Base URL:', API_URL);
  console.log('  - Environment:', isProduction() ? 'Production' : 'Development');
  console.log('  - Timeout:', API_TIMEOUT_MS / 1000, 'seconds');
};

// Log config on load (development only)
if (typeof window !== 'undefined' && !isProduction()) {
  logApiConfig();
}

export default API_URL;
