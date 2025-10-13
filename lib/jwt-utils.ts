/**
 * JWT Utilities
 * Decode JWT tokens on the client-side (read-only)
 */

interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: 'ADMIN' | 'SUBADMIN' | 'USER';
  iat?: number; // issued at
  exp?: number; // expires at
}

/**
 * Decode a JWT token (client-side only)
 * This is safe because:
 * 1. We're only READING the token, not trusting it for authentication
 * 2. Backend still validates the token on every request
 * 3. This is just for displaying user info in the UI
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[JWT] Invalid token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 URL decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload) as JWTPayload;
    
    // Basic validation
    if (!decoded.sub || !decoded.email || !decoded.role) {
      console.error('[JWT] Missing required fields in token');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('[JWT] Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired (client-side check only)
 * Backend should always validate tokens regardless
 */
export function isJWTExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Get user data from JWT token
 */
export function getUserFromJWT(token: string) {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  return {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
}

