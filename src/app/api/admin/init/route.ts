/**
 * ===========================================
 * PHOTOVAULT - Admin Initialization API Route
 * ===========================================
 * Initializes the first admin user from environment variables
 * Call this endpoint once on first deployment
 */

import { NextResponse } from 'next/server';
import { initializeAdminUser } from '@/lib/db';
import type { ApiResponse } from '@/lib/types';

export async function POST(): Promise<NextResponse<ApiResponse>> {
    try {
        await initializeAdminUser();

        return NextResponse.json({
            success: true,
            message: 'Admin initialization completed',
        });
    } catch (error) {
        console.error('Admin initialization error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to initialize admin',
            },
            { status: 500 }
        );
    }
}
