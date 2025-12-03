/**
 * AuthPage.tsx - Secure Authentication Page with RBAC
 * 
 * Security Features:
 * - Role-Based Access Control (RBAC)
 * - Admin auto-creation for seyda@aciker.com
 * - Strong password validation (min 6 chars)
 * - Confirm password matching
 * - Secure login with email + password verification
 * - Duplicate email prevention
 * - Students can NEVER register as admin
 * - Show/Hide password toggle
 * - Clear inputs on failed attempts
 */

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { 
  Mail, Lock, User, Loader2, AlertCircle, CheckCircle, 
  Eye, EyeOff, ShieldCheck, ArrowLeft, UserPlus, LogIn
} from 'lucide-react';
// Removed unused: Bug, Zap, Shield
import { User as UserType } from '../types';

// --- ADMIN CREDENTIALS ---
// ⚠️ SECURITY WARNING: Move to backend API authentication in production!
// This localStorage-based auth is for development/demo purposes only.
// In production: Use JWT tokens, bcrypt password hashing, and server-side validation.
const ADMIN_EMAIL = 'seyda@aciker.com';
const ADMIN_PASSWORD = 'Seyda.2025'; // TODO: Remove when backend auth is implemented

// --- TYPES ---
type AuthMode = 'login' | 'register';

interface AuthPageProps {
  onNavigate: (view: string) => void;
  onLoginSuccess?: (user: UserType) => void;
  initialMode?: AuthMode;
}

// --- PRODUCTION ROLE DETERMINATION ---
const determineUserRole = (email: string, password: string): 'admin' | 'student' => {
  // STRICT: Admin role ONLY if exact credentials match
  if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    return 'admin';
  }
  return 'student';
};

// --- PASSWORD VALIDATION ---
interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  passwordsMatch: boolean;
  errors: string[];
}

const validatePassword = (password: string, confirmPassword: string): PasswordValidation => {
  const errors: string[] = [];
  const hasMinLength = password.length >= 6;
  const passwordsMatch = password === confirmPassword;

  if (!hasMinLength && password.length > 0) {
    errors.push('Şifre en az 6 karakter olmalıdır.');
  }
  if (!passwordsMatch && confirmPassword.length > 0) {
    errors.push('Şifreler eşleşmiyor!');
  }

  return {
    isValid: hasMinLength && passwordsMatch,
    hasMinLength,
    passwordsMatch,
    errors,
  };
};

// --- PASSWORD STRENGTH INDICATOR ---
interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = memo(({ password }) => {
  const strength = useMemo(() => {
    if (password.length === 0) return { level: 0, text: '', color: '' };
    if (password.length < 4) return { level: 1, text: 'Çok Zayıf', color: 'bg-red-500' };
    if (password.length < 6) return { level: 2, text: 'Zayıf', color: 'bg-orange-500' };
    if (password.length < 8) return { level: 3, text: 'Orta', color: 'bg-yellow-500' };
    if (password.length < 10) return { level: 4, text: 'Güçlü', color: 'bg-green-500' };
    return { level: 5, text: 'Çok Güçlü', color: 'bg-emerald-500' };
  }, [password]);

  if (password.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={'h-1 flex-1 rounded-full transition-colors ' + (
              level <= strength.level ? strength.color : 'bg-slate-200'
            )}
          />
        ))}
      </div>
      <p className={'text-xs font-medium ' + (
        strength.level <= 2 ? 'text-red-500' : 
        strength.level <= 3 ? 'text-yellow-600' : 'text-green-600'
      )}>
        {strength.text}
      </p>
    </div>
  );
});

PasswordStrength.displayName = 'PasswordStrength';

// --- MAIN AUTH PAGE COMPONENT ---
const AuthPage: React.FC<AuthPageProps> = memo(({ onNavigate, onLoginSuccess, initialMode = 'login' }) => {
  // State
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- AUTO-CREATE ADMIN USER ON MOUNT ---
  useEffect(() => {
    const ensureAdminExists = () => {
      try {
        const usersJson = localStorage.getItem('app_users');
        let users: UserType[] = [];
        
        if (usersJson) {
          try {
            users = JSON.parse(usersJson);
          } catch (e) {
            users = [];
          }
        }

        // Find existing admin
        const adminIndex = users.findIndex(
          (u: UserType) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        );

        const adminUser: UserType = {
          id: 'admin_seyda_001',
          full_name: 'Şeyda Açıker',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'admin',
          is_premium: true,
          avatar: 'https://ui-avatars.com/api/?name=Seyda+Aciker&background=1C2A5E&color=D4AF37&bold=true',
        };

        if (adminIndex >= 0) {
          // Update existing admin with correct password
          users[adminIndex] = adminUser;
          // Admin account updated
        } else {
          // Create new admin
          users.push(adminUser);
          // Admin account created
        }

        localStorage.setItem('app_users', JSON.stringify(users));
        // Admin initialized
      } catch (error) {
        console.error('Failed to ensure admin exists:', error);
      }
    };

    ensureAdminExists();
  }, []);

  // Password validation for registration
  const passwordValidation = useMemo(
    () => validatePassword(password, confirmPassword),
    [password, confirmPassword]
  );

  // Clear form
  const clearForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  // Clear sensitive fields on error
  const clearSensitiveFields = useCallback(() => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  // Switch between login and register
  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    clearForm();
  }, [clearForm]);

  // --- LOGIN HANDLER WITH RBAC ---
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    // Basic validation
    if (!trimmedEmail) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    if (!trimmedPassword) {
      setError('Lütfen şifrenizi girin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // Get all registered users from localStorage
      const usersJson = localStorage.getItem('app_users');
      let users: UserType[] = [];
      
      if (usersJson) {
        try {
          users = JSON.parse(usersJson);
        } catch (parseError) {
          console.error('Failed to parse users:', parseError);
          users = [];
        }
      }

      // Debug logs removed for production

      // Find user by email AND verify password
      const user = users.find(
        (u: UserType) => u.email?.toLowerCase() === trimmedEmail && u.password === trimmedPassword
      );

      if (!user) {
        // Check if user exists but password is wrong
        const userExists = users.find(
          (u: UserType) => u.email?.toLowerCase() === trimmedEmail
        );

        if (userExists) {
          setError('Şifre hatalı. Lütfen tekrar deneyin.');
        } else {
          setError('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.');
        }
        clearSensitiveFields();
        return;
      }

      // Strict role enforcement based on credentials
      const expectedRole = determineUserRole(user.email || '', trimmedPassword);
      if (user.role !== expectedRole) {
        user.role = expectedRole;
        
        // Update in storage
        const updatedUsers = users.map(u => 
          u.email?.toLowerCase() === trimmedEmail ? { ...u, role: expectedRole } : u
        );
        localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      }

      // Success! Save current user and redirect
      
      // Save current user to localStorage (without password for security)
      const safeUser = { ...user };
      delete safeUser.password;
      localStorage.setItem('mockUser', JSON.stringify(safeUser));

      if (onLoginSuccess) {
        onLoginSuccess(safeUser);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      clearSensitiveFields();
    } finally {
      setLoading(false);
    }
  }, [email, password, onLoginSuccess, clearSensitiveFields]);

  // --- REGISTER HANDLER (STUDENTS ONLY) ---
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Validation
    if (!trimmedName || trimmedName.length < 2) {
      setError('Lütfen geçerli bir ad soyad girin (en az 2 karakter).');
      return;
    }
    if (!trimmedEmail) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    // SECURITY: Prevent registration with admin email
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase()) {
      setError('Bu e-posta adresi yönetici hesabına aittir. Giriş yapmayı deneyin.');
      clearSensitiveFields();
      setTimeout(() => switchMode('login'), 2500);
      return;
    }

    if (!passwordValidation.hasMinLength) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (!passwordValidation.passwordsMatch) {
      setError('Şifreler eşleşmiyor!');
      clearSensitiveFields();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 700));

      // Get existing users
      const usersJson = localStorage.getItem('app_users');
      let users: UserType[] = [];
      
      if (usersJson) {
        try {
          users = JSON.parse(usersJson);
        } catch (parseError) {
          users = [];
        }
      }

      // Check for duplicate email
      const existingUser = users.find((u: UserType) => u.email?.toLowerCase() === trimmedEmail);
      if (existingUser) {
        setError('Bu e-posta adresiyle zaten bir hesap mevcut. Giriş yapmayı deneyin.');
        clearSensitiveFields();
        setTimeout(() => switchMode('login'), 2500);
        return;
      }

      // STRICT: Create new user as STUDENT only
      // Role is determined by email, but registration always creates students
      const newUser: UserType = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        full_name: trimmedName,
        email: trimmedEmail,
        password: password,
        role: 'student', // STRICT: Always student for registration
        is_premium: false,
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(trimmedName) + '&background=1C2A5E&color=fff',
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('app_users', JSON.stringify(users));

      // User registered successfully

      setSuccess(true);

      // Auto login after success animation
      setTimeout(() => {
        const safeUser = { ...newUser };
        delete safeUser.password;
        localStorage.setItem('mockUser', JSON.stringify(safeUser));
        
        if (onLoginSuccess) {
          onLoginSuccess(safeUser);
        }
      }, 1500);

    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMsg = err?.message || 'Kayıt sırasında bir hata oluştu.';
      setError(errorMsg);
      clearSensitiveFields();
    } finally {
      setLoading(false);
    }
  }, [fullName, email, password, passwordValidation, onLoginSuccess, clearSensitiveFields, switchMode]);

  // PRODUCTION: No demo mode in production

  // Check if register form is valid
  const isRegisterFormValid = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      email.trim().length > 0 &&
      passwordValidation.isValid
    );
  }, [fullName, email, passwordValidation]);

  // --- SUCCESS SCREEN ---
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center transition-colors">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fadeIn border border-slate-100 mx-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Kayıt Başarılı! 🎉
          </h2>
          <p className="text-slate-600">
            Hoş geldin! Öğrenci paneline yönlendiriliyorsun...
          </p>
          <div className="mt-6">
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-green-500 h-1.5 rounded-full animate-pulse"
                style={{ width: '100%', animation: 'grow 1.5s ease-out forwards' }}
              />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes grow {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // --- MAIN AUTH FORM ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 transition-colors">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 transition-colors">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {mode === 'login' ? (
                <ShieldCheck className="h-8 w-8 text-indigo-600" />
              ) : (
                <UserPlus className="h-8 w-8 text-indigo-600" />
              )}
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#1C2A5E]">
              {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </h2>
            <p className="text-slate-500 mt-2">
              {mode === 'login' 
                ? 'Şeyda Açıker Eğitim Platformu' 
                : 'Yeni öğrenci hesabı oluştur'}
            </p>
          </div>

          {/* Dev Message - Removed for production */}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start text-sm border border-red-100 animate-fadeIn">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{mode === 'login' ? 'Giriş Başarısız' : 'Kayıt Başarısız'}</p>
                <p className="mt-1 text-red-600">{error}</p>
                {error.includes('zaten') && (
                  <p className="mt-2 text-xs text-red-500 font-medium animate-pulse">
                    Giriş sayfasına yönlendiriliyorsun...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            {/* Full Name - Register Only */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Adınız Soyadınız"
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-posta Adresi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="ornek@email.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Şifre <span className="text-red-500">*</span>
                {mode === 'register' && (
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    (en az 6 karakter)
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={'block w-full pl-10 pr-10 py-3 border bg-white text-slate-900 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ' + (
                    mode === 'register' && password.length > 0 && !passwordValidation.hasMinLength
                      ? 'border-red-300'
                      : 'border-slate-300'
                  )}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={mode === 'register' ? 6 : undefined}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {mode === 'register' && <PasswordStrength password={password} />}
            </div>

            {/* Confirm Password - Register Only */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Şifre Tekrar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={'block w-full pl-10 pr-10 py-3 border bg-white text-slate-900 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ' + (
                      confirmPassword.length > 0 && !passwordValidation.passwordsMatch
                        ? 'border-red-300'
                        : confirmPassword.length > 0 && passwordValidation.passwordsMatch
                          ? 'border-green-300'
                          : 'border-slate-300'
                    )}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password match indicator */}
                {confirmPassword.length > 0 && (
                  <div className={'mt-2 flex items-center gap-2 text-xs font-medium ' + (
                    passwordValidation.passwordsMatch 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  )}>
                    {passwordValidation.passwordsMatch ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Şifreler eşleşiyor
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Şifreler eşleşmiyor!
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (mode === 'register' && !isRegisterFormValid)}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#1C2A5E] hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  {mode === 'login' ? 'Giriş Yapılıyor...' : 'Kayıt Yapılıyor...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Giriş Yap
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Kayıt Ol
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center space-y-3">
            {mode === 'login' ? (
              <button 
                onClick={() => switchMode('register')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Hesabınız yok mu? <span className="underline">Kayıt Olun</span>
              </button>
            ) : (
              <button 
                onClick={() => switchMode('login')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Zaten hesabınız var mı? <span className="underline">Giriş Yapın</span>
              </button>
            )}
            <div>
              <button 
                onClick={() => onNavigate('landing')}
                className="text-sm text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Ana Sayfaya Dön
              </button>
            </div>
          </div>

          {/* PRODUCTION: Clean login screen - no demo buttons */}

          {/* Terms - Register Only */}
          {mode === 'register' && (
            <p className="mt-6 text-xs text-center text-slate-500">
              Kayıt olarak{' '}
              <a href="#" className="text-indigo-600 hover:underline">
                Kullanım Şartları
              </a>{' '}
              ve{' '}
              <a href="#" className="text-indigo-600 hover:underline">
                Gizlilik Politikası
              </a>
              'nı kabul etmiş olursun.
            </p>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Şeyda Açıker Eğitim Platformu - Güvenli Giriş
          </p>
        </div>
      </div>
    </div>
  );
});

AuthPage.displayName = 'AuthPage';

export default AuthPage;
