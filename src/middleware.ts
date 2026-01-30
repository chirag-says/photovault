/**
 * ===========================================
 * PHOTOVAULT - Middleware
 * ===========================================
 * Handles route protection and authentication checks
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyRoleFromRequest } from './lib/auth';

// ===========================================
// ROUTE CONFIGURATION
// ===========================================

// Routes that require authentication
const protectedRoutes = ['/gallery', '/upload', '/settings', '/albums'];

// Routes that require admin role
const adminRoutes = ['/admin'];



// API routes that require authentication
const protectedApiRoutes = ['/api/images', '/api/user', '/api/albums'];

// API routes that require admin role
const adminApiRoutes = ['/api/admin'];

// ===========================================
// MIDDLEWARE FUNCTION
// ===========================================

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ===========================================
    // API ROUTE PROTECTION
    // ===========================================

    if (pathname.startsWith('/api/')) {
        // Skip auth check for auth-related endpoints, init, and public album access
        if (
            pathname.startsWith('/api/auth/') ||
            pathname === '/api/health' ||
            pathname === '/api/admin/init' ||
            pathname === '/api/albums/public' ||
            pathname === '/api/albums/browse' ||
            pathname === '/api/albums/access'
        ) {
            return NextResponse.next();
        }

        // Check admin API routes
        if (adminApiRoutes.some((route) => pathname.startsWith(route))) {
            const { authenticated, authorized } = await verifyRoleFromRequest(
                request,
                'admin'
            );

            if (!authenticated) {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            if (!authorized) {
                return NextResponse.json(
                    { success: false, error: 'Forbidden - Admin access required' },
                    { status: 403 }
                );
            }

            return NextResponse.next();
        }

        // Check protected API routes
        if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
            const { authenticated } = await verifyRoleFromRequest(request);

            if (!authenticated) {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            return NextResponse.next();
        }

        return NextResponse.next();
    }

    // ===========================================
    // PAGE ROUTE PROTECTION
    // ===========================================

    // Check admin routes
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
        const { authenticated, authorized } = await verifyRoleFromRequest(
            request,
            'admin'
        );

        if (!authenticated) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (!authorized) {
            // Non-admin trying to access admin routes
            return NextResponse.redirect(new URL('/gallery', request.url));
        }

        return NextResponse.next();
    }

    // Check protected routes
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        const { authenticated } = await verifyRoleFromRequest(request);

        if (!authenticated) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (pathname === '/login' || pathname === '/signup') {
        const { authenticated } = await verifyRoleFromRequest(request);

        if (authenticated) {
            return NextResponse.redirect(new URL('/gallery', request.url));
        }
    }

    return NextResponse.next();
}

// ===========================================
// MIDDLEWARE CONFIG
// ===========================================

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};
