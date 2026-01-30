/**
 * ===========================================
 * PHOTOVAULT - Browse All Albums API
 * ===========================================
 * GET: List all albums (public + private) for browsing
 * Shows album info but restricts access based on visibility
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Album, BrowseAlbum } from '@/lib/types';

// GET /api/albums/browse - List all albums for public browsing
export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        // Fetch ALL albums (public and private) with creator info
        const { data: albums, error } = await supabase
            .from('albums')
            .select(`
                *,
                cover_image:images!cover_image_id(preview_path),
                user:users!user_id(email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching albums:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch albums' },
                { status: 500 }
            );
        }

        // Get signed URLs for covers and format response
        const albumsForBrowsing: BrowseAlbum[] = await Promise.all(
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

                // Get creator name from email (username part)
                const creatorEmail = album.user?.email || '';
                const created_by = creatorEmail.split('@')[0] || 'Anonymous';

                return {
                    id: album.id,
                    name: album.name,
                    description: album.description,
                    visibility: album.visibility,
                    image_count: album.image_count,
                    cover_url,
                    created_by,
                    created_at: album.created_at,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: albumsForBrowsing,
        });
    } catch (error) {
        console.error('Browse albums error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
