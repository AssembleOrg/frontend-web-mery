/**
 * Auth Migration Utilities
 * Clean up legacy insecure cookies
 */

import Cookies from 'js-cookie';

/**
 * Remove legacy auth_user cookie (insecure)
 * This function should be called once on app initialization
 */
export function cleanupLegacyCookies() {
  // Remove old insecure cookie if it exists
  const legacyCookie = Cookies.get('auth_user');
  
  if (legacyCookie) {
    console.warn('[Auth Migration] Removing legacy auth_user cookie (security upgrade)');
    Cookies.remove('auth_user');
    Cookies.remove('auth_user', { path: '/' });
    Cookies.remove('auth_user', { domain: window.location.hostname });
    
    console.log('[Auth Migration] ✓ Legacy cookie removed');
  }
}

/**
 * Check if user has legacy cookies
 */
export function hasLegacyCookies(): boolean {
  return !!Cookies.get('auth_user');
}

