/**
 * ===========================================
 * PHOTOVAULT - Albums API Route
 * ===========================================
 * GET: List user's albums
 * POST: Create new album
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { nanoid } from 'nanoid';
import type { Album, CreateAlbumInput } from '@/lib/types';

// GET /api/albums - List user's albums
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = getSupabaseAdmin();

        const { data: albums, error } = await supabase
            .from('albums')
            .select(`
                *,
                cover_image:images!cover_image_id(preview_path)
            `)
            .eq('user_id', user.userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching albums:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch albums' },
                { status: 500 }
            );
        }

        // Get signed URLs for covers
        const albumsWithUrls = await Promise.all(
            (albums || []).map(async (album: Album & { cover_image?: { preview_path: string } }) => {
                let cover_url = null;
                if (album.cover_image?.preview_path) {
                    const { data } = await supabase.storage
                        .from('photos')
                        .createSignedUrl(album.cover_image.preview_path, 3600);
                    cover_url = data?.signedUrl || null;
                }
                const { cover_image, ...rest } = album;
                return { ...rest, cover_url };
            })
        );

        return NextResponse.json({
            success: true,
            data: albumsWithUrls,
        });
    } catch (error) {
        console.error('Albums GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/albums - Create new album
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = getSupabaseAdmin();
        const body: CreateAlbumInput = await request.json();

        // Validate input
        if (!body.name?.trim()) {
            return NextResponse.json(
                { success: false, error: 'Album name is required' },
                { status: 400 }
            );
        }

        // Generate access code for private albums
        const access_code = body.visibility === 'private' ? nanoid(8).toUpperCase() : null;

        const { data: album, error } = await supabase
            .from('albums')
            .insert({
                user_id: user.userId,
                name: body.name.trim(),
                description: body.description?.trim() || null,
                visibility: body.visibility || 'private',
                access_code,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating album:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create album' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: album,
        });
    } catch (error) {
        console.error('Albums POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
