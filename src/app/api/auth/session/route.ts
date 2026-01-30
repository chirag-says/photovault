/**
 * ===========================================
 * PHOTOVAULT - Session Check API Route
 * ===========================================
 * Returns current user session status
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { findUserById } from '@/lib/db';
import type { ApiResponse, UserWithoutPassword } from '@/lib/types';

export async function GET(): Promise<NextResponse<ApiResponse<{ user: UserWithoutPassword | null }>>> {
    try {
        const session = await getCurrentUser();

        if (!session) {
            return NextResponse.json({
                success: true,
                data: { user: null },
            });
        }

        // Get fresh user data from database
        const user = await findUserById(session.userId);

        if (!user || !user.is_active) {
            return NextResponse.json({
                success: true,
                data: { user: null },
            });
        }

        const userWithoutPassword: UserWithoutPassword = {
            id: user.id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        return NextResponse.json({
            success: true,
            data: { user: userWithoutPassword },
        });
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json({
            success: true,
            data: { user: null },
        });
    }
}
