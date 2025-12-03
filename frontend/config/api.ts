/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Automatically detects environment and uses appropriate backend URL.
 */

// Production backend URL (Render)
const PRODUCTION_API_URL = 'https://seyda-matematik-api.onrender.com';

// Development backend URL (Local)
const DEVELOPMENT_API_URL = 'http://localhost:5001';

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

export default API_URL;
