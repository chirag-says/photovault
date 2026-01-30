/**
 * ===========================================
 * PHOTOVAULT - Album Access Verification API
 * ===========================================
 * POST: Verify access code for private album
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// POST /api/albums/access - Verify access code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code } = body;

        if (!code?.trim()) {
            return NextResponse.json(
                { success: false, error: 'Access code is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Find album by access code
        const { data: album, error } = await supabase
            .from('albums')
            .select('id, name, visibility')
            .eq('access_code', code.toUpperCase().trim())
            .eq('visibility', 'private')
            .single();

        if (error || !album) {
            return NextResponse.json(
                { success: false, error: 'Invalid access code' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                albumId: album.id,
                albumName: album.name,
            },
        });
    } catch (error) {
        console.error('Album access error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
