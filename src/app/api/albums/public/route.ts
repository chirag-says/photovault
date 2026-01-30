/**
 * ===========================================
 * PHOTOVAULT - Public Albums API
 * ===========================================
 * GET: List all public albums
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Album } from '@/lib/types';

// GET /api/albums/public - List public albums
export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        const { data: albums, error } = await supabase
            .from('albums')
            .select(`
                *,
                cover_image:images!cover_image_id(preview_path),
                user:users!user_id(email)
            `)
            .eq('visibility', 'public')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching public albums:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch albums' },
                { status: 500 }
            );
        }

        // Get signed URLs for covers
        const albumsWithUrls = await Promise.all(
            (albums || []).map(async (album: Album & {
                cover_image?: { preview_path: string };
                user?: { email: string };
            }) => {
                let cover_url = null;
                if (album.cover_image?.preview_path) {
                    const { data } = await supabase.storage
                        .from('photos')
                        .createSignedUrl(album.cover_image.preview_path, 3600);
                    cover_url = data?.signedUrl || null;
                }
                return {
                    id: album.id,
                    name: album.name,
                    description: album.description,
                    image_count: album.image_count,
                    cover_url,
                    created_by: album.user?.email?.split('@')[0] || 'Anonymous',
                    created_at: album.created_at,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: albumsWithUrls,
        });
    } catch (error) {
        console.error('Public albums error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
