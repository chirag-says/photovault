/**
 * ===========================================
 * PHOTOVAULT - Single Album API Route
 * ===========================================
 * GET: Get album details with images
 * PUT: Update album
 * DELETE: Delete album
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/albums/[id] - Get album with images
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        const supabase = getSupabaseAdmin();

        // Fetch album with creator info
        const { data: album, error: albumError } = await supabase
            .from('albums')
            .select(`
                *,
                creator:users!user_id(email)
            `)
            .eq('id', id)
            .single();

        if (albumError || !album) {
            return NextResponse.json(
                { success: false, error: 'Album not found' },
                { status: 404 }
            );
        }

        // Check access
        const isOwner = user?.userId === album.user_id;
        const isPublic = album.visibility === 'public';

        // For private albums, check access code from query
        if (!isOwner && !isPublic) {
            const code = request.nextUrl.searchParams.get('code');
            // Normalize to uppercase for case-insensitive comparison
            const normalizedCode = code?.toUpperCase().trim();
            const normalizedAccessCode = album.access_code?.toUpperCase();

            if (!normalizedCode || normalizedCode !== normalizedAccessCode) {
                return NextResponse.json(
                    { success: false, error: 'Access denied' },
                    { status: 403 }
                );
            }
        }

        // Fetch album images
        const { data: albumImages } = await supabase
            .from('album_images')
            .select(`
                image_id,
                display_order,
                images(*)
            `)
            .eq('album_id', id)
            .order('display_order', { ascending: true });

        // Get signed URLs for images
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const images = await Promise.all(
            (albumImages || []).map(async (ai: any) => {
                const img = ai.images;
                if (!img) return null;
                const [previewUrl, fullUrl] = await Promise.all([
                    supabase.storage.from('photos').createSignedUrl(img.preview_path, 3600),
                    supabase.storage.from('photos').createSignedUrl(img.full_path, 3600),
                ]);
                return {
                    ...img,
                    preview_url: previewUrl.data?.signedUrl || '',
                    full_url: fullUrl.data?.signedUrl || '',
                };
            })
        );

        const validImages = images.filter(Boolean);

        // Get cover URL
        let cover_url = null;
        if (album.cover_image_id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const coverImage = validImages.find((img: any) => img.id === album.cover_image_id);
            cover_url = coverImage?.preview_url || null;
        } else if (validImages.length > 0) {
            cover_url = validImages[0].preview_url;
        }

        // Extract creator name from email
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const creatorEmail = (album as any).creator?.email || '';
        const created_by = creatorEmail.split('@')[0] || 'Anonymous';

        // Remove the creator object before spreading to avoid including raw email
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { creator, ...albumWithoutCreator } = album as any;

        return NextResponse.json({
            success: true,
            data: {
                ...albumWithoutCreator,
                cover_url,
                images: validImages,
                isOwner,
                created_by,
            },
        });
    } catch (error) {
        console.error('Album GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/albums/[id] - Update album
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Check ownership
        const { data: album } = await supabase
            .from('albums')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!album || album.user_id !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const updates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (body.name !== undefined) updates.name = body.name.trim();
        if (body.description !== undefined) updates.description = body.description?.trim() || null;
        if (body.visibility !== undefined) updates.visibility = body.visibility;
        if (body.cover_image_id !== undefined) updates.cover_image_id = body.cover_image_id;

        const { data: updated, error } = await supabase
            .from('albums')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: 'Failed to update album' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error('Album PUT error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/albums/[id] - Delete album
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Check ownership
        const { data: album } = await supabase
            .from('albums')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!album || album.user_id !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        const { error } = await supabase
            .from('albums')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete album' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Album deleted',
        });
    } catch (error) {
        console.error('Album DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
