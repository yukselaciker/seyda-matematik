/**
 * GamificationHeader - Student profile and XP display
 * 
 * NOTE: Role-based features removed. Roles are determined by RBAC at login,
 * not by UI toggles. This component is for STUDENTS only.
 */

import React, { memo } from 'react';
import { Trophy, Flame, LogOut, Loader2 } from 'lucide-react';
import { User } from '../../types';

interface GamificationHeaderProps {
  user: User;
  xp: number;
  level: number;
  streak: number;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export const GamificationHeader: React.FC<GamificationHeaderProps> = memo(({
  user,
  xp,
  level,
  streak,
  onLogout,
  isLoggingOut = false,
}) => {
  const nextLevelXp = level * 1000;
  const currentLevelProgress = ((xp % 1000) / 1000) * 100;
  const xpToNextLevel = nextLevelXp - xp;

  // Safe access to user properties
  const userName = user?.full_name || 'Öğrenci';
  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1C2A5E&color=fff`;

  return (
    <div className="bg-[#1C2A5E] rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden transition-colors">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Trophy size={100} />
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="h-16 w-16 rounded-full border-4 border-[#D4AF37] overflow-hidden bg-slate-700">
            <img 
              src={userAvatar} 
              alt={userName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1C2A5E&color=fff`;
              }}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{userName}</h2>
            <div className="flex items-center gap-2 text-indigo-200">
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-bold border border-white/20">
                Seviye {level}
              </span>
              {streak > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <Flame className="w-3 h-3 text-orange-400" />
                  {streak} gün seri
                </span>
              )}
            </div>
          </div>
        </div>

        {/* XP Progress Section */}
        <div className="w-full md:w-1/3 flex items-end gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1 text-[#D4AF37]">
              <span>{xp.toLocaleString('tr-TR')} XP</span>
              <span>{nextLevelXp.toLocaleString('tr-TR')} XP</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-3 backdrop-blur-sm overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-[#D4AF37] h-3 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(currentLevelProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-center mt-2 text-indigo-300">
              Bir sonraki seviyeye {xpToNextLevel.toLocaleString('tr-TR')} XP kaldı!
            </p>
          </div>
          
          {/* Logout Button */}
          {onLogout && (
            <button 
              onClick={onLogout}
              disabled={isLoggingOut}
              className="hidden md:flex flex-col items-center justify-center p-3 rounded-xl bg-red-500/10 text-red-200 hover:bg-red-500 hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              title="Güvenli Çıkış"
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-[10px] mt-1 font-bold">Çıkış</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

GamificationHeader.displayName = 'GamificationHeader';

export default GamificationHeader;
