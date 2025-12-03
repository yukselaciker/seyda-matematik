/**
 * VideoManagementTab.tsx - Admin Video Management with Table View
 * 
 * Features:
 * - Upload form at top
 * - Table view of all videos below
 * - Delete functionality
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import { Video, Trash2, BookOpen } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { VideoUploadTab } from './VideoUploadTab';
import type { UploadedVideo } from './VideoUploadTab';

// --- STORAGE ---
const VIDEOS_STORAGE_KEY = 'app_videos';

const getStoredVideos = (): UploadedVideo[] => {
  try {
    const stored = localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load videos', e);
  }
  return [];
};

const saveVideos = (videos: UploadedVideo[]): void => {
  try {
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videos));
    window.dispatchEvent(new StorageEvent('storage', {
      key: VIDEOS_STORAGE_KEY,
      newValue: JSON.stringify(videos),
    }));
  } catch (e) {
    console.error('Failed to save videos', e);
  }
};

interface VideoManagementTabProps {
  teacherName?: string;
}

// --- MAIN COMPONENT ---
export const VideoManagementTab: React.FC<VideoManagementTabProps> = memo(({ teacherName = 'Şeyda Açıker' }) => {
  const { showToast } = useToast();
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load videos on mount and when refreshKey changes
  useEffect(() => {
    setVideos(getStoredVideos());
  }, [refreshKey]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setVideos(getStoredVideos());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle delete video
  const handleDeleteVideo = useCallback((videoId: string, videoTitle: string) => {
    if (!confirm(`"${videoTitle}" adlı videoyu silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const updatedVideos = videos.filter(v => v.id !== videoId);
      setVideos(updatedVideos);
      saveVideos(updatedVideos);
      showToast('Video başarıyla silindi.', 'info');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete video:', error);
      showToast('Video silinirken bir hata oluştu.', 'error');
    }
  }, [videos, showToast]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <Video className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ders Yönetimi</h2>
          <p className="text-slate-500 text-sm">Video derslerinizi yükleyin ve yönetin</p>
        </div>
      </div>

      {/* Upload Form - Using VideoUploadTab's form logic */}
      <VideoUploadTab teacherName={teacherName} />

      {/* Videos Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Yüklü Videolar (Library)
            {videos.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                {videos.length}
              </span>
            )}
          </h3>
        </div>

        {videos.length === 0 ? (
          <div className="p-12 text-center">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Henüz video yüklenmedi</p>
            <p className="text-xs text-slate-400 mt-1">Yukarıdaki formu kullanarak video ekleyin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Başlık</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Konu</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Yüklenme Tarihi</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{video.title}</p>
                      {video.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{video.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {video.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{formatDate(video.uploadedAt)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteVideo(video.id, video.title)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                        title="Videoyu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Sil</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

VideoManagementTab.displayName = 'VideoManagementTab';

export default VideoManagementTab;

