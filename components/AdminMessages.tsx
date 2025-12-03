import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle, Search, RefreshCw } from 'lucide-react';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'replied' | 'email_failed';
}

const API_URL = (import.meta as any).env?.VITE_API_URL || (process as any).env?.REACT_APP_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const userStr = localStorage.getItem('mockUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token || null;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return null;
};

// Get API key as fallback
const ADMIN_API_KEY = (import.meta as any).env?.VITE_ADMIN_API_KEY || '6d01500d8b81f0160b863f1745e7a3bbb69a3525674241c8e2a30fd6cb4c2e53';

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Use Bearer token if available, otherwise fallback to API key
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-api-key'] = ADMIN_API_KEY;
      }
      
      const response = await fetch(`${API_URL}/api/contacts?limit=100`, {
        headers,
      });
      if (!response.ok) {
        throw new Error('Mesajlar alınamadı');
      }
      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Mesajlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

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
        headers['x-api-key'] = ADMIN_API_KEY;
      }
      
      const response = await fetch(`${API_URL}/api/contacts/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => msg._id === id ? { ...msg, status: newStatus } : msg)
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
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
        <div className="p-8 text-center text-red-600 bg-red-50 m-6 rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{error}</p>
          <button onClick={fetchMessages} className="mt-4 text-sm underline">Tekrar Dene</button>
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
