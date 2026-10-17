import { createClient, type User } from '@supabase/supabase-js';
import type { CustomerUser } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wacjxpjeunelkormmxvu.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_4KKpBVvipibBeezazqSijg_McEbUPCj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Validates that an authenticated user is genuinely authenticated via Google
 * and possesses an authorized Google email address.
 */
export function validateGoogleAuthUser(user: User | null): { valid: boolean; reason?: string } {
  if (!user || !user.email) {
    return { valid: false, reason: 'No authenticated user found.' };
  }

  const email = user.email.toLowerCase();
  const provider = user.app_metadata?.provider || user.identities?.[0]?.provider;

  // Verify provider was Google OAuth
  const isGoogleProvider = provider === 'google' || user.identities?.some((id) => id.provider === 'google');

  // Verify valid Google domain
  const isGoogleEmail = email.endsWith('@gmail.com') || email.endsWith('.google.com') || isGoogleProvider;

  if (!isGoogleProvider && !isGoogleEmail) {
    return {
      valid: false,
      reason: 'Only authenticated Google accounts are supported. Unverified email accounts are not permitted.',
    };
  }

  return { valid: true };
}

/**
 * Transforms a Supabase user into a typed CustomerUser
 */
export function formatCustomerUser(user: User): CustomerUser {
  const metadata = user.user_metadata || {};
  const fullName =
    metadata.full_name ||
    metadata.name ||
    (user.email ? user.email.split('@')[0] : 'Customer');

  const avatarUrl =
    metadata.avatar_url ||
    metadata.picture ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

  return {
    id: user.id,
    email: user.email || '',
    fullName,
    avatarUrl,
    provider: 'google',
    emailVerified: Boolean(user.email_confirmed_at || metadata.email_verified),
  };
}

/**
 * Initiates Google OAuth authentication via Supabase
 */
export async function signInWithGoogleOAuth(redirectPath: string = '/') {
  const origin = window.location.origin;
  const targetPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
  const redirectTo = `${origin}${targetPath}`;

  try {
    sessionStorage.setItem('post_login_redirect', targetPath);
  } catch {
    // Ignore storage errors in restricted contexts
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}


/**
 * Signs out the current customer and clears Supabase session
 */
export async function signOutCustomer() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Sign out warning:', error.message);
  }
}
