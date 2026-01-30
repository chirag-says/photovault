/**
 * ===========================================
 * PHOTOVAULT - Authentication Utilities
 * ===========================================
 * Handles JWT generation/verification and session management
 * Compatible with Edge Runtime
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { JWTPayload, UserRole, UserWithoutPassword } from './types';

// ===========================================
// CONFIGURATION
// ===========================================

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_NAME = 'photovault_session';

// ===========================================
// JWT TOKEN MANAGEMENT
// ===========================================

/**
 * Generate a JWT token for a user
 */
export async function generateToken(user: UserWithoutPassword): Promise<string> {
    const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    // Parse expiration time
    const expiresIn = parseExpirationTime(JWT_EXPIRES_IN);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(JWT_SECRET);

    return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Parse expiration time string to a format jose understands
 */
function parseExpirationTime(time: string): string {
    // Already in correct format (e.g., '7d', '24h', '60m')
    return time;
}

// ===========================================
// COOKIE MANAGEMENT
// ===========================================

/**
 * Set the authentication cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies();

    // Calculate max age in seconds
    const maxAge = parseMaxAge(JWT_EXPIRES_IN);

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
    });
}

/**
 * Get the authentication cookie value
 */
export async function getAuthCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    return cookie?.value || null;
}

/**
 * Clear the authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * Get auth cookie from request (for middleware)
 */
export function getAuthCookieFromRequest(request: NextRequest): string | null {
    const cookie = request.cookies.get(COOKIE_NAME);
    return cookie?.value || null;
}

/**
 * Parse expiration string to seconds
 */
function parseMaxAge(time: string): number {
    const match = time.match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60; // Default: 7 days

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 'd':
            return value * 24 * 60 * 60;
        case 'h':
            return value * 60 * 60;
        case 'm':
            return value * 60;
        case 's':
            return value;
        default:
            return 7 * 24 * 60 * 60;
    }
}

// ===========================================
// SESSION HELPERS
// ===========================================

/**
 * Get the current user from the session cookie
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
    const token = await getAuthCookie();
    if (!token) return null;
    return verifyToken(token);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Check if user is an admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'admin';
}

/**
 * Verify role from request (for middleware)
 */
export async function verifyRoleFromRequest(
    request: NextRequest,
    requiredRole?: UserRole
): Promise<{ authenticated: boolean; authorized: boolean; user: JWTPayload | null }> {
    const token = getAuthCookieFromRequest(request);

    if (!token) {
        return { authenticated: false, authorized: false, user: null };
    }

    const user = await verifyToken(token);

    if (!user) {
        return { authenticated: false, authorized: false, user: null };
    }

    if (requiredRole && user.role !== requiredRole) {
        return { authenticated: true, authorized: false, user };
    }

    return { authenticated: true, authorized: true, user };
}
