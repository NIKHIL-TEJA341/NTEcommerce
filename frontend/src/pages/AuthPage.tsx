import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Package, ArrowRight, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const { user, isAuthenticated, loginWithGoogle, logout, isLoading, error, clearError } = useAuthStore();

  const isSignUp = location.pathname.includes('signup');

  // If already logged in, redirect to destination
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const timer = setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, isLoading, navigate, redirectTarget]);

  const handleGoogleAuth = async () => {
    try {
      sessionStorage.setItem('post_login_redirect', redirectTarget);
      await loginWithGoogle(redirectTarget);
    } catch (err) {
      console.error('Google auth error:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        
        {/* Card */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* If already authenticated */}
          {isAuthenticated && user ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Already Signed In</h2>
                <p className="text-xs text-slate-400">
                  Signed in as <span className="text-slate-200 font-semibold">{user.fullName}</span> ({user.email})
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Google Verified Account Active</span>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  to={redirectTarget}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <span>Continue to {redirectTarget === '/' ? 'Home' : redirectTarget.replace('/', '')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={logout}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Google Sign In / Sign Up View */
            <div className="space-y-6">
              
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
                  {/* Google Icon */}
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
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
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {isSignUp ? 'Create Your Account' : 'Welcome to NEXUS'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
                    {isSignUp
                      ? 'New users are registered automatically using your verified Google profile.'
                      : 'Sign in to access your personal order tracking, delivery invoices, and cart.'}
                  </p>
                </div>
              </div>

              {/* Error Message */}
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

              {/* Main Action: Continue with Google */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3.5 py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-xl shadow-white/5 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer group"
                >
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
                  <span className="text-sm font-bold">
                    {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
                  </span>
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Instant 1-click registration & sign in via official Google OAuth
                </p>
              </div>

              {/* Policy & Features */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Google Verified Identity Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Only authentic Google accounts (<strong className="text-slate-300">@gmail.com</strong>) are accepted. Dummy inputs, fake emails, and insecure passwords are fundamentally disabled.
                </p>
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Auto-linked orders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Supabase Secured</span>
                  </div>
                </div>
              </div>

              {/* Toggle Sign Up / Sign In mode */}
              <div className="text-center pt-2">
                {isSignUp ? (
                  <p className="text-xs text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                      Sign In
                    </Link>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    New to NEXUS?{' '}
                    <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
                      Create Account
                    </Link>
                  </p>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
