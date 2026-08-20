import React from 'react';
import { 
  Lock, 
  Sparkles, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { handleFirebaseGoogleAuth, loginUser } from '../utils/authStorage';
import { User, AuthSession } from '../types';

interface AuthGateProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSuccessfulAuth: (session: AuthSession) => void;
  activeToolName?: string;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  onOpenAuth,
  onSuccessfulAuth,
  activeToolName = 'Document Tools',
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success || !res.user) {
        setError(res.error || 'Google Sign-In was cancelled.');
        setIsGoogleLoading(false);
        return;
      }
      const session = await handleFirebaseGoogleAuth(res.user);
      setIsGoogleLoading(false);
      onSuccessfulAuth(session);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setError(err?.message || 'Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemo = (role: 'USER' | 'ADMIN') => {
    const email = role === 'ADMIN' ? 'admin@convertpro.com' : 'alex@example.com';
    const password = role === 'ADMIN' ? 'Admin@1234' : 'User@1234';
    const result = loginUser(email, password, true);
    if (result.success && result.session) {
      onSuccessfulAuth(result.session);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10">
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-8 sm:px-10 sm:py-12 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold mb-4 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Authentication Required to Access Tools</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Sign In or Register to Unlock {activeToolName}
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Create a free account or sign in to access ultra high-res PDF rendering, document merging, batch processing, and secure cloud sync.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <button
              id="authgate-google-signin-btn"
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="py-3.5 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <button
              id="authgate-register-btn"
              type="button"
              onClick={() => onOpenAuth('register')}
              className="py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Free Account</span>
            </button>

            <button
              id="authgate-login-btn"
              type="button"
              onClick={() => onOpenAuth('login')}
              className="py-3.5 px-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In with Email</span>
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                Testing the app? Instant 1-click test logins:
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleQuickDemo('USER')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-indigo-400 text-gray-700 dark:text-gray-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                Demo User
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 hover:border-purple-400 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                Demo Admin
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div>
            <h3 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
              Included in Your Free Member Access
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-700/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Ultra High-Res PDF to Image</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Render individual or all PDF pages into crisp PNG, JPEG, WEBP, TIFF, or BMP at up to 600 DPI.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-700/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Multi-PDF Merger & Page Ranges</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Combine multiple PDFs in any custom order, extract specific page ranges, and rotate on the fly.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-700/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Image to PDF & Image Converter</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Assemble JPGs and PNGs into polished multi-page PDFs or convert images across formats.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-700/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">100% Private In-Browser Privacy</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Files are processed exclusively inside your web browser. No confidential document ever leaves your device.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
