/**
 * ===========================================
 * PHOTOVAULT - Logout API Route
 * ===========================================
 * Handles user session termination
 */

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

export async function POST(): Promise<NextResponse<ApiResponse>> {
    try {
        // Clear the authentication cookie
        await clearAuthCookie();

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to logout',
            },
            { status: 500 }
        );
    }
}
