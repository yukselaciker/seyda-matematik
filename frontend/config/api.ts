/**
 * API Configuration - Dynamic URL Detection
 * 
 * Automatically detects environment:
 * - Local development: http://localhost:5001
 * - Production (Vercel): https://seyda-matematik-api.onrender.com
 */

const getApiUrl = (): string => {
  // Check if we have an explicit API URL from environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Check if running in development mode
  if (import.meta.env.DEV) {
    // Local development
    return 'http://localhost:5001';
  }

  // Production - Render backend URL
  return 'https://seyda-matematik-api.onrender.com';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Helper function to make API calls
 */
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  return fetch(url, defaultOptions);
};

/**
 * Helper function for GET requests
 */
export const apiGet = async (endpoint: string, headers?: HeadersInit): Promise<Response> => {
  return apiCall(endpoint, {
    method: 'GET',
    headers,
  });
};

/**
 * Helper function for POST requests
 */
export const apiPost = async (
  endpoint: string,
  data: any,
  headers?: HeadersInit
): Promise<Response> => {
  return apiCall(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
};

/**
 * Helper function for PATCH requests
 */
export const apiPatch = async (
  endpoint: string,
  data: any,
  headers?: HeadersInit
): Promise<Response> => {
  return apiCall(endpoint, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
};

/**
 * Helper function for DELETE requests
 */
export const apiDelete = async (endpoint: string, headers?: HeadersInit): Promise<Response> => {
  return apiCall(endpoint, {
    method: 'DELETE',
    headers,
  });
};

// Export the base URL for direct use if needed
export default API_CONFIG;


