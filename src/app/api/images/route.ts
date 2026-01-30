/**
 * ===========================================
 * PHOTOVAULT - Image Upload API Route
 * ===========================================
 * Handles image uploads, processing, and storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processImage, generateStoragePaths } from '@/lib/image-processing';
import { uploadFile, getSignedUrl } from '@/lib/supabase';
import { saveImageMetadata, getUserImages } from '@/lib/db';
import { validateImageFile } from '@/lib/validation';
import { checkUploadRateLimit, getClientIP, formatRateLimitError } from '@/lib/rate-limit';
import type { ApiResponse, ImageWithUrls, PaginatedResponse } from '@/lib/types';

// ===========================================
// GET - Fetch User's Images
// ===========================================

export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<ImageWithUrls>>> {
    try {
        // Get current user
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                    data: [],
                    page: 1,
                    limit: 20,
                    total: 0,
                    hasMore: false,
                },
                { status: 401 }
            );
        }

        // Parse pagination params
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        // Fetch images
        const { images, total } = await getUserImages(session.userId, page, limit);

        // Generate signed URLs for each image
        const imagesWithUrls: ImageWithUrls[] = await Promise.all(
            images.map(async (image) => {
                const previewUrl = await getSignedUrl(image.preview_path) || '';
                const fullUrl = await getSignedUrl(image.full_path) || '';
                return {
                    ...image,
                    preview_url: previewUrl,
                    full_url: fullUrl,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: imagesWithUrls,
            page,
            limit,
            total,
            hasMore: page * limit < total,
        });
    } catch (error) {
        console.error('Get images error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch images',
                data: [],
                page: 1,
                limit: 20,
                total: 0,
                hasMore: false,
            },
            { status: 500 }
        );
    }
}

// ===========================================
// POST - Upload New Image
// ===========================================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ImageWithUrls>>> {
    try {
        // ===========================================
        // AUTHENTICATION
        // ===========================================
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

        // ===========================================
        // RATE LIMITING
        // ===========================================
        const clientIP = getClientIP(request.headers);
        const rateLimitResult = await checkUploadRateLimit(`${session.userId}-${clientIP}`);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: formatRateLimitError(rateLimitResult.msBeforeNext),
                },
                { status: 429 }
            );
        }

        // ===========================================
        // PARSE FORM DATA
        // ===========================================
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No file provided',
                },
                { status: 400 }
            );
        }

        // ===========================================
        // VALIDATE FILE
        // ===========================================
        const validation = validateImageFile(file);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error,
                },
                { status: 400 }
            );
        }

        // ===========================================
        // PROCESS IMAGE
        // ===========================================
        const buffer = Buffer.from(await file.arrayBuffer());
        const processed = await processImage(buffer);

        // Generate storage paths
        const { previewPath, fullPath } = generateStoragePaths(
            session.userId,
            processed.filename
        );

        // ===========================================
        // UPLOAD TO STORAGE
        // ===========================================
        const [previewUpload, fullUpload] = await Promise.all([
            uploadFile(previewPath, processed.preview.buffer, 'image/webp'),
            uploadFile(fullPath, processed.full.buffer, 'image/webp'),
        ]);

        if (!previewUpload.success || !fullUpload.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to upload image to storage',
                },
                { status: 500 }
            );
        }

        // ===========================================
        // SAVE METADATA TO DATABASE
        // ===========================================
        const savedImage = await saveImageMetadata(
            session.userId,
            processed.filename,
            file.name,
            previewPath,
            fullPath,
            processed.preview.size,
            processed.full.size,
            'image/webp',
            processed.full.width,
            processed.full.height
        );

        if (!savedImage) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to save image metadata',
                },
                { status: 500 }
            );
        }

        // Get signed URLs
        const previewUrl = await getSignedUrl(previewPath) || '';
        const fullUrl = await getSignedUrl(fullPath) || '';

        const imageWithUrls: ImageWithUrls = {
            ...savedImage,
            preview_url: previewUrl,
            full_url: fullUrl,
        };

        return NextResponse.json({
            success: true,
            data: imageWithUrls,
            message: 'Image uploaded successfully',
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to upload image',
            },
            { status: 500 }
        );
    }
}
