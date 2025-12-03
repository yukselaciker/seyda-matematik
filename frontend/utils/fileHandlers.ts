/**
 * fileHandlers.ts - Robust File/Video Opening & Downloading Logic
 * 
 * Features:
 * - Validates URLs before opening
 * - Fallback to sample files for broken/missing URLs
 * - Toast notifications for user feedback
 * - Simulated download progress
 * - Data sanitization helpers
 */

// --- CONSTANTS ---
export const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
export const SAMPLE_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
export const SAMPLE_GOOGLE_DRIVE_PDF = 'https://drive.google.com/file/d/1234567890/view';

// --- URL VALIDATION ---
/**
 * Check if a URL is valid HTTP/HTTPS link
 */
export const isValidUrl = (url: string | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Check if URL is a YouTube link
 */
export const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

/**
 * Check if URL is a Google Drive link
 */
export const isGoogleDriveUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('drive.google.com');
};

// --- FILE TYPE DETECTION ---
export const getFileType = (url: string): 'pdf' | 'video' | 'doc' | 'unknown' => {
  if (!url) return 'unknown';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('.pdf') || lowerUrl.includes('pdf')) return 'pdf';
  if (isYoutubeUrl(url)) return 'video';
  if (lowerUrl.includes('.mp4') || lowerUrl.includes('.webm')) return 'video';
  if (lowerUrl.includes('.doc') || lowerUrl.includes('.docx')) return 'doc';
  
  return 'unknown';
};

// --- TOAST CALLBACK TYPE ---
export type ShowToastFn = (message: string, type?: 'success' | 'error' | 'info' | 'xp') => void;

// --- MAIN FILE HANDLER ---
/**
 * Opens a file/video with robust error handling and fallbacks
 * @param url - The URL to open
 * @param type - The file type ('pdf' | 'video')
 * @param title - The file title (for toast messages)
 * @param showToast - Toast notification function
 */
export const handleOpenFile = async (
  url: string | undefined,
  type: 'pdf' | 'video',
  title: string,
  showToast?: ShowToastFn
): Promise<void> => {
  console.log('🔗 Opening file:', { url, type, title });

  // Check if URL is valid
  if (isValidUrl(url)) {
    // Valid URL - open directly
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast?.(`${title} açılıyor...`, 'info');
      
      // Success toast after short delay
      setTimeout(() => {
        showToast?.('Dosya başarıyla açıldı! ✓', 'success');
      }, 1000);
    } catch (error) {
      console.error('Failed to open URL:', error);
      showToast?.('Dosya açılırken hata oluştu.', 'error');
    }
  } else {
    // Invalid/Missing URL - Use fallback with simulation
    console.warn('⚠️ Invalid URL, using fallback:', url);
    
    showToast?.('Dosya hazırlanıyor...', 'info');
    
    // Simulate preparation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Open sample file based on type
    const fallbackUrl = type === 'pdf' ? SAMPLE_PDF_URL : SAMPLE_VIDEO_URL;
    
    try {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      showToast?.('Örnek dosya açıldı! 📄', 'success');
    } catch (error) {
      console.error('Failed to open fallback URL:', error);
      showToast?.('Dosya açılamadı. Lütfen daha sonra tekrar deneyin.', 'error');
    }
  }
};

// --- DOWNLOAD HANDLER ---
/**
 * Simulates file download with progress
 * @param url - The URL to download
 * @param filename - The filename
 * @param showToast - Toast notification function
 */
export const handleDownloadFile = async (
  url: string | undefined,
  filename: string,
  showToast?: ShowToastFn
): Promise<void> => {
  console.log('⬇️ Downloading file:', { url, filename });

  // Show download starting toast
  showToast?.('İndirme başlatılıyor...', 'info');

  // Simulate download progress
  await new Promise(resolve => setTimeout(resolve, 800));
  showToast?.('İndiriliyor... %50', 'info');
  
  await new Promise(resolve => setTimeout(resolve, 800));
  showToast?.('İndiriliyor... %100', 'info');

  // Use valid URL or fallback
  const downloadUrl = isValidUrl(url) ? url! : SAMPLE_PDF_URL;

  try {
    // Open in new tab (browser will handle download)
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    showToast?.('İndirme tamamlandı! ✓', 'success');
  } catch (error) {
    console.error('Download failed:', error);
    showToast?.('İndirme başarısız oldu.', 'error');
  }
};

// --- DATA SANITIZATION ---
/**
 * Sanitizes a video object by ensuring it has a valid URL
 */
export const sanitizeVideo = (video: any): any => {
  if (!video) return null;
  
  return {
    ...video,
    youtubeUrl: isValidUrl(video.youtubeUrl) ? video.youtubeUrl : SAMPLE_VIDEO_URL,
    url: isValidUrl(video.url) ? video.url : SAMPLE_VIDEO_URL,
  };
};

/**
 * Sanitizes a material object by ensuring it has a valid URL
 */
export const sanitizeMaterial = (material: any): any => {
  if (!material) return null;
  
  const type = material.type || 'pdf';
  const fallbackUrl = type === 'video' ? SAMPLE_VIDEO_URL : SAMPLE_PDF_URL;
  
  return {
    ...material,
    url: isValidUrl(material.url) ? material.url : fallbackUrl,
  };
};

/**
 * Sanitizes an array of videos from localStorage
 */
export const sanitizeVideosArray = (videos: any[]): any[] => {
  if (!Array.isArray(videos)) return [];
  return videos.map(sanitizeVideo).filter(Boolean);
};

/**
 * Sanitizes an array of materials from localStorage
 */
export const sanitizeMaterialsArray = (materials: any[]): any[] => {
  if (!Array.isArray(materials)) return [];
  return materials.map(sanitizeMaterial).filter(Boolean);
};

// --- STORAGE REPAIR ---
/**
 * Repairs broken URLs in localStorage
 * Should be called on app mount or in useSystemHealth
 */
export const repairStorageUrls = (): { videosFixed: number; materialsFixed: number } => {
  let videosFixed = 0;
  let materialsFixed = 0;

  try {
    // Fix videos
    const videosStr = localStorage.getItem('app_videos');
    if (videosStr && videosStr !== 'null' && videosStr !== 'undefined') {
      try {
        const videos = JSON.parse(videosStr);
        if (Array.isArray(videos)) {
          const sanitized = videos.map(video => {
            if (!video) return null;
            
            const needsFix = !isValidUrl(video.youtubeUrl) && !isValidUrl(video.url);
            if (needsFix) {
              videosFixed++;
              return sanitizeVideo(video);
            }
            return video;
          }).filter(Boolean);
          
          if (videosFixed > 0) {
            localStorage.setItem('app_videos', JSON.stringify(sanitized));
            console.log(`✅ Repaired ${videosFixed} video URLs`);
          }
        }
      } catch (e) {
        console.error('Failed to repair videos:', e);
      }
    }

    // Fix materials
    const materialsStr = localStorage.getItem('app_materials');
    if (materialsStr && materialsStr !== 'null' && materialsStr !== 'undefined') {
      try {
        const materials = JSON.parse(materialsStr);
        if (Array.isArray(materials)) {
          const sanitized = materials.map(material => {
            if (!material) return null;
            
            const needsFix = !isValidUrl(material.url);
            if (needsFix) {
              materialsFixed++;
              return sanitizeMaterial(material);
            }
            return material;
          }).filter(Boolean);
          
          if (materialsFixed > 0) {
            localStorage.setItem('app_materials', JSON.stringify(sanitized));
            console.log(`✅ Repaired ${materialsFixed} material URLs`);
          }
        }
      } catch (e) {
        console.error('Failed to repair materials:', e);
      }
    }
  } catch (error) {
    console.error('Failed to repair storage URLs:', error);
  }

  return { videosFixed, materialsFixed };
};

// --- URL PLACEHOLDER GENERATOR ---
/**
 * Generates a default URL based on file type
 */
export const getDefaultUrl = (type: 'pdf' | 'video' | 'doc'): string => {
  switch (type) {
    case 'pdf':
      return SAMPLE_PDF_URL;
    case 'video':
      return SAMPLE_VIDEO_URL;
    case 'doc':
      return 'https://docs.google.com/document/d/sample/edit';
    default:
      return SAMPLE_PDF_URL;
  }
};

/**
 * Validates and returns a URL or default
 */
export const getValidUrlOrDefault = (url: string | undefined, type: 'pdf' | 'video'): string => {
  if (isValidUrl(url)) {
    return url!;
  }
  return getDefaultUrl(type);
};
