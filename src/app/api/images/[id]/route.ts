/**
 * ===========================================
 * PHOTOVAULT - Single Image API Route
 * ===========================================
 * Handles individual image operations (get, delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getImageById, deleteImage } from '@/lib/db';
import { deleteFiles, getSignedUrl } from '@/lib/supabase';
import type { ApiResponse, ImageWithUrls } from '@/lib/types';

// ===========================================
// GET - Fetch Single Image
// ===========================================

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ImageWithUrls>>> {
    try {
        const { id } = await params;

        // Get current user
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        // Fetch image
        const image = await getImageById(id, session.userId);

        if (!image) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Image not found',
                },
                { status: 404 }
            );
        }

        // Generate signed URLs
        const previewUrl = await getSignedUrl(image.preview_path) || '';
        const fullUrl = await getSignedUrl(image.full_path) || '';

        const imageWithUrls: ImageWithUrls = {
            ...image,
            preview_url: previewUrl,
            full_url: fullUrl,
        };

        return NextResponse.json({
            success: true,
            data: imageWithUrls,
        });
    } catch (error) {
        console.error('Get image error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch image',
            },
            { status: 500 }
        );
    }
}

// ===========================================
// DELETE - Delete Single Image
// ===========================================

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
    try {
        const { id } = await params;

        // Get current user
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        // Delete image record and get paths
        const deletedPaths = await deleteImage(id, session.userId);

        if (!deletedPaths) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Image not found or already deleted',
                },
                { status: 404 }
            );
        }

        // Delete files from storage
        await deleteFiles([deletedPaths.previewPath, deletedPaths.fullPath]);

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully',
        });
    } catch (error) {
        console.error('Delete image error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete image',
            },
            { status: 500 }
        );
    }
}
