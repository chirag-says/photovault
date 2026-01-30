/**
 * ===========================================
 * PHOTOVAULT - Admin Dashboard API Route
 * ===========================================
 * Returns admin statistics and overview data
 */

import { NextResponse } from 'next/server';
import { getAdminStats, getAllUsers, getAllInviteCodes } from '@/lib/db';
import type { ApiResponse, AdminStats, UserWithoutPassword, InviteCode } from '@/lib/types';

interface AdminDashboardData {
    stats: AdminStats;
    recentUsers: UserWithoutPassword[];
    recentInviteCodes: InviteCode[];
}

export async function GET(): Promise<NextResponse<ApiResponse<AdminDashboardData>>> {
    try {
        // Fetch all admin data in parallel
        const [stats, users, inviteCodes] = await Promise.all([
            getAdminStats(),
            getAllUsers(),
            getAllInviteCodes(),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                stats,
                recentUsers: users.slice(0, 10), // Last 10 users
                recentInviteCodes: inviteCodes.slice(0, 10), // Last 10 invite codes
            },
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch admin data',
            },
            { status: 500 }
        );
    }
}
