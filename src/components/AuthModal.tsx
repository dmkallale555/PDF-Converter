import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  loginUser, 
  registerUser, 
  requestPasswordReset, 
  resetPasswordWithToken 
} from '../utils/authStorage';
import { User, AuthSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot-password';
  onAuthSuccess: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>(initialMode);
  
  // Login & Register Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot / Reset Password state
  const [resetToken, setResetToken] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Status & Errors
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Too short', color: 'bg-gray-200 dark:bg-gray-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 10, label: 'Too short', color: 'bg-red-400' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginUser(email, password, rememberMe);
      setIsLoading(false);

      if (!res.success || !res.session) {
        setError(res.error || 'Login failed.');
        return;
      }

      onAuthSuccess(res.session);
      onClose();
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerUser(name, email, password);
      if (!res.success || !res.user) {
        setIsLoading(false);
        setError(res.error || 'Registration failed.');
        return;
      }

      // Auto login
      const loginRes = loginUser(email, password, true);
      setIsLoading(false);
      if (loginRes.session) {
        onAuthSuccess(loginRes.session);
      }
      onClose();
    }, 500);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Please enter your account email.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = requestPasswordReset(email);
      if (!res.success || !res.token) {
        setError(res.error || 'Could not find account.');
        return;
      }

      setResetToken(res.token);
      setSuccess(`Password reset token generated: ${res.token}`);
      setMode('reset-password');
    }, 500);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetToken) {
      setError('Reset token is required.');
      return;
    }
    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = resetPasswordWithToken(resetToken, password);
      if (!res.success) {
        setError(res.error || 'Password reset failed.');
        return;
      }

      setResetSuccessMessage('Password reset successfully! You can now log in.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    }, 500);
  };

  const handleQuickDemoLogin = (demoRole: 'ADMIN' | 'USER') => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const emailToUse = demoRole === 'ADMIN' ? 'admin@convertpro.com' : 'alex@example.com';
      const pwdToUse = demoRole === 'ADMIN' ? 'Admin@1234' : 'User@1234';
      const res = loginUser(emailToUse, pwdToUse, true);
      setIsLoading(false);
      if (res.session) {
        onAuthSuccess(res.session);
        onClose();
      } else {
        setError(res.error || 'Demo login failed');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                {mode === 'login' && 'Sign in to ConvertPro'}
                {mode === 'register' && 'Create your Free Account'}
                {mode === 'forgot-password' && 'Reset your Password'}
                {mode === 'reset-password' && 'Enter New Password'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                {mode === 'login' && 'Access your conversion history & high-DPI presets'}
                {mode === 'register' && 'No credit card required • 100% Free forever'}
                {mode === 'forgot-password' && "We'll verify your email and provide a reset link"}
                {mode === 'reset-password' && 'Choose a secure new password for your account'}
              </p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Login Bar for Testing */}
        {(mode === 'login' || mode === 'register') && (
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 px-6 py-2.5 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Quick Test:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="demo-user-login-btn"
                onClick={() => handleQuickDemoLogin('USER')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
              >
                Demo User
              </button>
              <button
                type="button"
                id="demo-admin-login-btn"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-2xs"
              >
                Admin Panel
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {(success || resetSuccessMessage) && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resetSuccessMessage || success}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setError(null);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="login-remember-me-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Remember me on this device
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Taylor"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 mb-1">
                      <span>Password strength:</span>
                      <span className="font-bold">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-left">
                  <input
                    id="register-terms-checkbox"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-0.5"
                  />
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight">
                    I agree to the <span className="text-indigo-600 underline">Terms of Service</span> and <span className="text-indigo-600 underline">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="register-submit-btn"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? 'Creating Account...' : 'Create Free Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="forgot-submit-btn"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? 'Sending Reset Token...' : 'Generate Reset Token'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Reset Token
                </label>
                <input
                  id="reset-token-input"
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="rst_..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  id="reset-new-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min 6 characters)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="reset-confirm-password-input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                id="reset-submit-btn"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? 'Updating Password...' : 'Save New Password & Login'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Footer Navigation Switcher */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/60 text-center text-xs text-gray-500 dark:text-gray-400">
          {mode === 'login' ? (
            <div>
              Don't have an account yet?{' '}
              <button
                id="switch-to-register-btn"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign up free
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <button
                id="switch-to-login-btn"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign in
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
