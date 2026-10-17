import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { CustomerUser } from '../types';
import {
  supabase,
  signInWithGoogleOAuth,
  signOutCustomer,
  validateGoogleAuthUser,
  formatCustomerUser,
} from '../services/supabase';

interface AuthState {
  user: CustomerUser | null;
  session: Session | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;

  // Actions
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: (redirectPath?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isAuthModalOpen: false,

  openAuthModal: () => set({ isAuthModalOpen: true, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),
  clearError: () => set({ error: null }),

  loginWithGoogle: async (redirectPath: string = window.location.pathname) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithGoogleOAuth(redirectPath);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let friendlyMessage = err.message || 'Google authentication failed.';
      if (friendlyMessage.includes('provider is not enabled') || friendlyMessage.includes('unsupported_provider')) {
        friendlyMessage =
          'Google Provider is not yet enabled in the Supabase Dashboard. Please enable Google under Authentication > Providers in Supabase.';
      }
      set({ error: friendlyMessage, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOutCustomer();
    } catch (e) {
      console.warn('Signout warning:', e);
    } finally {
      localStorage.removeItem('nexus_customer_user');
      set({
        user: null,
        session: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  initAuth: async () => {
    set({ isLoading: true });

    try {
      // 1. Check current active session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.warn('Error reading Supabase session:', error.message);
      }

      if (session?.user) {
        // Enforce Google validation: Only authentic Google email accounts allowed
        const validation = validateGoogleAuthUser(session.user);
        if (!validation.valid) {
          console.warn('Rejected non-Google user session:', session.user.email);
          await signOutCustomer();
          set({
            user: null,
            session: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: validation.reason || 'Only verified Google accounts are allowed.',
          });
          return;
        }

        const formattedUser = formatCustomerUser(session.user);
        localStorage.setItem('nexus_customer_user', JSON.stringify(formattedUser));
        set({
          user: formattedUser,
          session,
          token: session.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          session: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }

      // 2. Clean URL hash if redirected back with OAuth tokens
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error'))) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      // 3. Subscribe to real-time auth state changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newSession?.user) {
            const validation = validateGoogleAuthUser(newSession.user);
            if (!validation.valid) {
              await signOutCustomer();
              set({
                user: null,
                session: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: validation.reason || 'Only verified Google accounts are allowed.',
              });
              return;
            }

            const formattedUser = formatCustomerUser(newSession.user);
            localStorage.setItem('nexus_customer_user', JSON.stringify(formattedUser));

            // Sync user profile to profiles table in Supabase
            try {
              await supabase
                .from('profiles')
                .upsert({
                  id: newSession.user.id,
                  full_name: formattedUser.fullName,
                  avatar_url: formattedUser.avatarUrl,
                  updated_at: new Date().toISOString(),
                });
            } catch {
              // Non-blocking
            }

            set({
              user: formattedUser,
              session: newSession,
              token: newSession.access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              isAuthModalOpen: false,
            });

            // Redirect if a post_login_redirect was requested
            try {
              const pendingRedirect = sessionStorage.getItem('post_login_redirect');
              if (pendingRedirect) {
                sessionStorage.removeItem('post_login_redirect');
                if (window.location.pathname !== pendingRedirect) {
                  window.location.href = pendingRedirect;
                }
              }
            } catch {
              // Ignore
            }
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('nexus_customer_user');
          set({
            user: null,
            session: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });
    } catch (err: any) {
      console.error('Auth initialization error:', err);
      set({ isLoading: false });
    }
  },
}));
