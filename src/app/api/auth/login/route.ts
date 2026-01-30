/**
 * ===========================================
 * PHOTOVAULT - Login API Route
 * ===========================================
 * Handles user authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { verifyPassword } from '@/lib/auth-node';
import { loginSchema } from '@/lib/validation';
import { checkAuthRateLimit, getClientIP, formatRateLimitError } from '@/lib/rate-limit';
import type { ApiResponse, AuthResponse, UserWithoutPassword } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AuthResponse>>> {
    try {
        // ===========================================
        // RATE LIMITING
        // ===========================================
        const clientIP = getClientIP(request.headers);
        const rateLimitResult = await checkAuthRateLimit(clientIP);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: formatRateLimitError(rateLimitResult.msBeforeNext),
                },
                { status: 429 }
            );
        }

        // ===========================================
        // PARSE & VALIDATE INPUT
        // ===========================================
        const body = await request.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error.issues[0].message,
                },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        // ===========================================
        // FIND USER
        // ===========================================
        const user = await findUserByEmail(email);

        if (!user) {
            // Use generic error to prevent email enumeration
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password',
                },
                { status: 401 }
            );
        }

        // ===========================================
        // CHECK IF USER IS ACTIVE
        // ===========================================
        if (!user.is_active) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Your account has been deactivated. Please contact an administrator.',
                },
                { status: 403 }
            );
        }

        // ===========================================
        // VERIFY PASSWORD
        // ===========================================
        const isValidPassword = await verifyPassword(password, user.password_hash);

        if (!isValidPassword) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password',
                },
                { status: 401 }
            );
        }

        // ===========================================
        // GENERATE TOKEN & SET COOKIE
        // ===========================================
        const userWithoutPassword: UserWithoutPassword = {
            id: user.id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        const token = await generateToken(userWithoutPassword);
        await setAuthCookie(token);

        // ===========================================
        // RETURN SUCCESS
        // ===========================================
        return NextResponse.json({
            success: true,
            data: {
                user: userWithoutPassword,
            },
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}
