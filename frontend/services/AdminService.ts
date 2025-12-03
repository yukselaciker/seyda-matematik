/**
 * AdminService.ts - Admin API Service
 * 
 * Handles all admin-related API calls with proper authentication.
 * Uses centralized API configuration and token management.
 */

import { API_URL, API_ENDPOINTS, getAuthToken } from '../config/api';

// --- TYPES ---
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  is_premium: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'replied' | 'email_failed';
}

export interface AdminStats {
  totalUsers: number;
  totalContacts: number;
  newContacts: number;
  studentCount: number;
  teacherCount: number;
}

// --- API KEY FALLBACK ---
const ADMIN_API_KEY = (import.meta as any).env?.VITE_ADMIN_API_KEY || '6d01500d8b81f0160b863f1745e7a3bbb69a3525674241c8e2a30fd6cb4c2e53';

// --- HELPER: Build headers with auth ---
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Fallback to API key
    headers['X-API-Key'] = ADMIN_API_KEY;
  }
  
  return headers;
};

// --- HELPER: Handle API response ---
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (response.status === 401 || response.status === 403) {
    return {
      success: false,
      message: 'Oturum süreniz dolmuş veya yetkiniz yok. Lütfen tekrar giriş yapın.',
    };
  }
  
  if (!response.ok) {
    return {
      success: false,
      message: `Sunucu hatası: ${response.status}`,
    };
  }
  
  return response.json();
};

// --- ADMIN SERVICE ---
export const AdminService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<AdminStats>> {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ADMIN_STATS}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return handleResponse<AdminStats>(response);
    } catch (error) {
      console.error('❌ AdminService.getStats error:', error);
      return { success: false, message: 'Bağlantı hatası.' };
    }
  },

  /**
   * Get all users
   */
  async getUsers(params?: { role?: string; limit?: number; page?: number }): Promise<ApiResponse<User[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append('role', params.role);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const url = `${API_URL}${API_ENDPOINTS.ADMIN_USERS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return handleResponse<User[]>(response);
    } catch (error) {
      console.error('❌ AdminService.getUsers error:', error);
      return { success: false, message: 'Bağlantı hatası.' };
    }
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ADMIN_USERS}/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return handleResponse<{ id: string }>(response);
    } catch (error) {
      console.error('❌ AdminService.deleteUser error:', error);
      return { success: false, message: 'Bağlantı hatası.' };
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ADMIN_USERS}/${userId}/role`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      return handleResponse<User>(response);
    } catch (error) {
      console.error('❌ AdminService.updateUserRole error:', error);
      return { success: false, message: 'Bağlantı hatası.' };
    }
  },

  /**
   * Get all contact messages
   */
  async getContacts(params?: { status?: string; limit?: number; page?: number }): Promise<ApiResponse<ContactMessage[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const url = `${API_URL}${API_ENDPOINTS.CONTACTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return handleResponse<ContactMessage[]>(response);
    } catch (error) {
      console.error('❌ AdminService.getContacts error:', error);
      return { success: false, message: 'Bağlantı hatası.' };
    }
  },

  /**
   * Update contact status
   */
  async updateContactStatus(contactId: string, status: string): Promise<ApiResponse<ContactMessage>> {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.CONTACTS}/${contactId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      return handleResponse<ContactMessage>(response);
    } catch (error) {
      console.error('❌ AdminService.updateContactStatus error:', error);
      return { success: false, message: 'Bağlantı hatası.' };
    }
  },

  /**
   * Delete a contact message
   */
  async deleteContact(contactId: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.CONTACTS}/${contactId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      return handleResponse<{ id: string }>(response);
    } catch (error) {
      console.error('❌ AdminService.deleteContact error:', error);
      return { success: false, message: 'Bağlantı hatası.' };
    }
  },
};

export default AdminService;
