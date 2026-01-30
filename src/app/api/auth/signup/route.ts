/**
 * ===========================================
 * PHOTOVAULT - Signup API Route
 * ===========================================
 * Handles user registration with invite code validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser, validateInviteCode, incrementInviteCodeUsage } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { signupSchema } from '@/lib/validation';
import { checkAuthRateLimit, getClientIP, formatRateLimitError } from '@/lib/rate-limit';
import type { ApiResponse, AuthResponse } from '@/lib/types';

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
        const validation = signupSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error.issues[0].message,
                },
                { status: 400 }
            );
        }

        const { email, password, inviteCode } = validation.data;

        // ===========================================
        // VALIDATE INVITE CODE
        // ===========================================
        const inviteValidation = await validateInviteCode(inviteCode);

        if (!inviteValidation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: inviteValidation.error,
                },
                { status: 400 }
            );
        }

        // ===========================================
        // CHECK IF USER ALREADY EXISTS
        // ===========================================
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'An account with this email already exists',
                },
                { status: 409 }
            );
        }

        // ===========================================
        // CREATE USER
        // ===========================================
        const user = await createUser({
            email,
            password,
            role: 'user', // New users are always regular users
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to create account. Please try again.',
                },
                { status: 500 }
            );
        }

        // ===========================================
        // INCREMENT INVITE CODE USAGE
        // ===========================================
        if (inviteValidation.inviteCode) {
            await incrementInviteCodeUsage(inviteValidation.inviteCode.id, user.id);
        }

        // ===========================================
        // GENERATE TOKEN & SET COOKIE
        // ===========================================
        const token = await generateToken(user);
        await setAuthCookie(token);

        // ===========================================
        // RETURN SUCCESS
        // ===========================================
        return NextResponse.json({
            success: true,
            data: {
                user,
            },
            message: 'Account created successfully',
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}
