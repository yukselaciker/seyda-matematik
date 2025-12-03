import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle, Search, RefreshCw, LogOut } from 'lucide-react';
import { API_URL, API_ENDPOINTS } from '../config/api';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'replied' | 'email_failed';
}

interface AdminMessagesProps {
  onSessionExpired?: () => void; // Callback when session expires (401/403)
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
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

// Get API key as fallback (for admin access)
const ADMIN_API_KEY = (import.meta as any).env?.VITE_ADMIN_API_KEY || '6d01500d8b81f0160b863f1745e7a3bbb69a3525674241c8e2a30fd6cb4c2e53';

const AdminMessages: React.FC<AdminMessagesProps> = ({ onSessionExpired }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'auth' | 'server' | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Handle session expiration
  const handleSessionExpired = useCallback(() => {
    // Clear stored credentials
    localStorage.removeItem('mockUser');
    localStorage.removeItem('auth_token');
    
    // Notify parent component
    if (onSessionExpired) {
      onSessionExpired();
    }
  }, [onSessionExpired]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);
    
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Use Bearer token if available, otherwise fallback to API key
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Fallback to API key for admin access
        headers['X-API-Key'] = ADMIN_API_KEY;
      }
      
      console.log('📡 Fetching messages from:', `${API_URL}${API_ENDPOINTS.CONTACTS}`);
      
      const response = await fetch(`${API_URL}${API_ENDPOINTS.CONTACTS}?limit=100`, {
        method: 'GET',
        headers,
        credentials: 'include', // Include cookies for session handling
      });
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Authentication failed:', response.status);
        setErrorType('auth');
        setError('Oturum süreniz dolmuş veya yetkiniz yok. Lütfen tekrar giriş yapın.');
        return;
      }
      
      // Handle server errors
      if (!response.ok) {
        console.error('❌ Server error:', response.status);
        setErrorType('server');
        throw new Error(`Sunucu hatası: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data || []);
        console.log('✅ Loaded', data.data?.length || 0, 'messages');
      } else {
        throw new Error(data.message || 'Mesajlar alınamadı');
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching messages:', err);
      
      // Check if it's a network error
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setErrorType('network');
        setError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
      } else if (!errorType) {
        setErrorType('server');
        setError(err.message || 'Mesajlar yüklenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  }, [errorType]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'read' | 'replied') => {
    setUpdatingId(id);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Use Bearer token if available, otherwise fallback to API key
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['X-API-Key'] = ADMIN_API_KEY;
      }
      
      const response = await fetch(`${API_URL}${API_ENDPOINTS.CONTACTS}/${id}/status`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        setErrorType('auth');
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => msg._id === id ? { ...msg, status: newStatus } : msg)
        );
        console.log('✅ Status updated:', id, '->', newStatus);
      } else {
        console.error('❌ Failed to update status:', response.status);
      }
    } catch (err) {
      console.error('❌ Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Yeni</span>;
      case 'read':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Okundu</span>;
      case 'replied':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yanıtlandı</span>;
      case 'email_failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Hata</span>;
      default:
        return null;
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gelen Mesajlar</h2>
          <p className="text-slate-500 text-sm">İletişim formundan gelen talepler</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tümü</option>
            <option value="new">Yeni Mesajlar</option>
            <option value="replied">Yanıtlananlar</option>
          </select>
          
          <button 
            onClick={fetchMessages}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className={`p-8 text-center m-6 rounded-lg ${
          errorType === 'auth' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
        }`}>
          {errorType === 'auth' ? (
            <LogOut className="w-12 h-12 mx-auto mb-3 opacity-50" />
          ) : (
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          )}
          <p className="font-medium mb-2">
            {errorType === 'auth' ? 'Oturum Süresi Doldu' : 'Bağlantı Hatası'}
          </p>
          <p className="text-sm mb-4">{error}</p>
          
          {errorType === 'auth' ? (
            <button 
              onClick={handleSessionExpired}
              className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              Tekrar Giriş Yap
            </button>
          ) : (
            <button 
              onClick={fetchMessages} 
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Tekrar Dene
            </button>
          )}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Henüz mesaj yok</p>
          <p className="text-sm">İletişim formundan gönderilen mesajlar burada görünecektir.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {filteredMessages.map((msg) => (
            <div key={msg._id} className={`p-6 hover:bg-slate-50 transition-colors ${msg.status === 'new' ? 'bg-blue-50/30' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                    msg.status === 'new' ? 'bg-indigo-500' : 'bg-slate-400'
                  }`}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{msg.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="w-3 h-3" /> {msg.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="w-3 h-3" /> {msg.phone}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {new Date(msg.date).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  {getStatusBadge(msg.status)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap mb-4">
                {msg.message}
              </div>

              <div className="flex justify-end gap-3">
                {msg.status !== 'replied' && (
                  <button
                    onClick={() => handleStatusUpdate(msg._id, 'replied')}
                    disabled={updatingId === msg._id}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {updatingId === msg._id ? 'Güncelleniyor...' : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Yanıtlandı Olarak İşaretle
                      </>
                    )}
                  </button>
                )}
                
                <a 
                  href={`mailto:${msg.email}`}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  E-posta Gönder
                </a>
                
                <a 
                  href={`tel:${msg.phone}`}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Ara
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
