/**
 * ===========================================
 * PHOTOVAULT - Admin Users API Route
 * ===========================================
 * Handles user management for admins
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserStatus } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse, UserWithoutPassword } from '@/lib/types';

// ===========================================
// GET - List All Users
// ===========================================

export async function GET(): Promise<NextResponse<ApiResponse<UserWithoutPassword[]>>> {
    try {
        const users = await getAllUsers();

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch users',
            },
            { status: 500 }
        );
    }
}

// ===========================================
// PATCH - Update User Status
// ===========================================

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
        // Get current admin user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId, isActive } = body;

        if (!userId || typeof isActive !== 'boolean') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User ID and active status are required',
                },
                { status: 400 }
            );
        }

        // Prevent admin from deactivating themselves
        if (userId === currentUser.userId && !isActive) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'You cannot deactivate your own account',
                },
                { status: 400 }
            );
        }

        const success = await updateUserStatus(userId, isActive);

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to update user status',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
    } catch (error) {
        console.error('Update user status error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update user status',
            },
            { status: 500 }
        );
    }
}
