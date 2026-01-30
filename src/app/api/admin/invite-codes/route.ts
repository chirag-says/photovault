/**
 * ===========================================
 * PHOTOVAULT - Admin Invite Codes API Route
 * ===========================================
 * Handles invite code management (create, list, revoke)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createInviteCode, getAllInviteCodes, revokeInviteCode } from '@/lib/db';
import { inviteCodeSchema } from '@/lib/validation';
import type { ApiResponse, InviteCode } from '@/lib/types';

// ===========================================
// GET - List All Invite Codes
// ===========================================

export async function GET(): Promise<NextResponse<ApiResponse<InviteCode[]>>> {
    try {
        const inviteCodes = await getAllInviteCodes();

        return NextResponse.json({
            success: true,
            data: inviteCodes,
        });
    } catch (error) {
        console.error('Get invite codes error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch invite codes',
            },
            { status: 500 }
        );
    }
}

// ===========================================
// POST - Create New Invite Code
// ===========================================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<InviteCode>>> {
    try {
        // Get current admin user
        const session = await getCurrentUser();
        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        // Parse and validate input
        const body = await request.json();
        const validation = inviteCodeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error.issues[0].message,
                },
                { status: 400 }
            );
        }

        const { max_uses, expires_at } = validation.data;

        // Create invite code
        const inviteCode = await createInviteCode(
            session.userId,
            max_uses,
            expires_at
        );

        if (!inviteCode) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to create invite code',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: inviteCode,
            message: 'Invite code created successfully',
        });
    } catch (error) {
        console.error('Create invite code error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create invite code',
            },
            { status: 500 }
        );
    }
}

// ===========================================
// DELETE - Revoke Invite Code
// ===========================================

export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
        // Get code ID from URL params
        const { searchParams } = new URL(request.url);
        const codeId = searchParams.get('id');

        if (!codeId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invite code ID is required',
                },
                { status: 400 }
            );
        }

        // Revoke the code
        const success = await revokeInviteCode(codeId);

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to revoke invite code',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Invite code revoked successfully',
        });
    } catch (error) {
        console.error('Revoke invite code error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to revoke invite code',
            },
            { status: 500 }
        );
    }
}
