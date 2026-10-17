import React from 'react';
import { X, ShieldCheck, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 z-10 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-3 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In to NEXUS
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
              Your personal studio dashboard for tracked orders, instant checkout, and delivery updates.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Authentication Notice</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-rose-200 text-[11px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Continue with Google Action */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-lg shadow-white/5 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            {/* Google Multi-Color SVG Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-sm">
              {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </span>
          </button>

          <p className="text-[11px] text-center text-slate-500">
            One-tap authentication powered by Google OAuth 2.0
          </p>
        </div>

        {/* Security & Policy Box */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Identity Policy</span>
          </div>
          <p className="leading-relaxed">
            Only authenticated Google accounts (<strong className="text-slate-300">@gmail.com</strong>) are permitted. Unverified or dummy email inputs are strictly disabled to protect customer order records.
          </p>
          <div className="flex items-center gap-1.5 text-slate-500 pt-1 border-t border-slate-800/80">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>End-to-end encrypted session & Supabase authentication</span>
          </div>
        </div>

      </div>
    </div>
  );
};
