/**
 * ===========================================
 * PHOTOVAULT - Album Images API Route
 * ===========================================
 * POST: Add images to album
 * DELETE: Remove image from album
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/albums/[id]/images - Add images to album
export async function POST(request: NextRequest, { params }: RouteParams) {
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

        // Check album ownership
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
        const imageIds: string[] = body.imageIds || [];

        if (imageIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No images provided' },
                { status: 400 }
            );
        }

        // Get current max order
        const { data: maxOrder } = await supabase
            .from('album_images')
            .select('display_order')
            .eq('album_id', id)
            .order('display_order', { ascending: false })
            .limit(1)
            .single();

        let order = (maxOrder?.display_order || 0) + 1;

        // Insert images
        const inserts = imageIds.map((imageId) => ({
            album_id: id,
            image_id: imageId,
            display_order: order++,
        }));

        const { error } = await supabase
            .from('album_images')
            .upsert(inserts, { onConflict: 'album_id,image_id' });

        if (error) {
            console.error('Error adding images to album:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to add images' },
                { status: 500 }
            );
        }

        // Set cover if album has no cover
        const { data: updatedAlbum } = await supabase
            .from('albums')
            .select('cover_image_id')
            .eq('id', id)
            .single();

        if (!updatedAlbum?.cover_image_id && imageIds.length > 0) {
            await supabase
                .from('albums')
                .update({ cover_image_id: imageIds[0] })
                .eq('id', id);
        }

        return NextResponse.json({
            success: true,
            message: `Added ${imageIds.length} image(s) to album`,
        });
    } catch (error) {
        console.error('Album images POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/albums/[id]/images - Remove image from album
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

        const imageId = request.nextUrl.searchParams.get('imageId');
        if (!imageId) {
            return NextResponse.json(
                { success: false, error: 'Image ID required' },
                { status: 400 }
            );
        }

        // Check album ownership
        const { data: album } = await supabase
            .from('albums')
            .select('user_id, cover_image_id')
            .eq('id', id)
            .single();

        if (!album || album.user_id !== user.userId) {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        // Remove from album
        const { error } = await supabase
            .from('album_images')
            .delete()
            .eq('album_id', id)
            .eq('image_id', imageId);

        if (error) {
            return NextResponse.json(
                { success: false, error: 'Failed to remove image' },
                { status: 500 }
            );
        }

        // If removed image was cover, update cover
        if (album.cover_image_id === imageId) {
            const { data: firstImage } = await supabase
                .from('album_images')
                .select('image_id')
                .eq('album_id', id)
                .order('display_order', { ascending: true })
                .limit(1)
                .single();

            await supabase
                .from('albums')
                .update({ cover_image_id: firstImage?.image_id || null })
                .eq('id', id);
        }

        return NextResponse.json({
            success: true,
            message: 'Image removed from album',
        });
    } catch (error) {
        console.error('Album images DELETE error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
