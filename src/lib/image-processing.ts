/**
 * ===========================================
 * PHOTOVAULT - Image Processing Utilities
 * ===========================================
 * Uses Sharp for image processing, compression, and EXIF removal
 */

import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// ===========================================
// CONFIGURATION
// ===========================================

const PREVIEW_WIDTH = parseInt(process.env.PREVIEW_WIDTH || '300', 10);
const PREVIEW_QUALITY = parseInt(process.env.PREVIEW_QUALITY || '40', 10);
const FULL_WIDTH = parseInt(process.env.FULL_WIDTH || '2000', 10);
const FULL_QUALITY = parseInt(process.env.FULL_QUALITY || '75', 10);

// ===========================================
// TYPES
// ===========================================

export interface ProcessedImage {
    preview: {
        buffer: Buffer;
        width: number;
        height: number;
        size: number;
    };
    full: {
        buffer: Buffer;
        width: number;
        height: number;
        size: number;
    };
    filename: string;
    format: 'webp';
}

export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
}

// ===========================================
// PROCESSING FUNCTIONS
// ===========================================

/**
 * Process an uploaded image to create preview and full versions
 * - Removes EXIF metadata for privacy
 * - Creates a compressed preview (~300px wide, ~40 quality)
 * - Creates a compressed full version (~2000px wide, ~75 quality)
 * - Converts to WebP for optimal compression
 */
export async function processImage(
    inputBuffer: Buffer
): Promise<ProcessedImage> {
    // Generate unique filename
    const uniqueId = uuidv4();
    const filename = `${uniqueId}.webp`;

    // Load image and get metadata
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    // Calculate dimensions
    const originalWidth = metadata.width || 1920;
    const originalHeight = metadata.height || 1080;

    // ===========================================
    // CREATE PREVIEW VERSION
    // ===========================================
    // Target: ~300px width, ~40 quality, 20-50KB
    const previewWidth = Math.min(PREVIEW_WIDTH, originalWidth);
    const previewHeight = Math.round(
        (previewWidth / originalWidth) * originalHeight
    );

    const previewBuffer = await sharp(inputBuffer)
        // Remove all metadata (including EXIF, GPS, camera info)
        .rotate() // Auto-rotate based on EXIF orientation before stripping
        .resize(previewWidth, previewHeight, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({
            quality: PREVIEW_QUALITY,
            effort: 6, // Higher effort = better compression
        })
        .toBuffer();

    // ===========================================
    // CREATE FULL VERSION
    // ===========================================
    // Target: ~2000px width, ~75 quality, 200-500KB
    const fullWidth = Math.min(FULL_WIDTH, originalWidth);
    const fullHeight = Math.round((fullWidth / originalWidth) * originalHeight);

    const fullBuffer = await sharp(inputBuffer)
        // Remove all metadata (including EXIF, GPS, camera info)
        .rotate() // Auto-rotate based on EXIF orientation before stripping
        .resize(fullWidth, fullHeight, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({
            quality: FULL_QUALITY,
            effort: 4, // Balance between quality and speed
        })
        .toBuffer();

    return {
        preview: {
            buffer: previewBuffer,
            width: previewWidth,
            height: previewHeight,
            size: previewBuffer.length,
        },
        full: {
            buffer: fullBuffer,
            width: fullWidth,
            height: fullHeight,
            size: fullBuffer.length,
        },
        filename,
        format: 'webp',
    };
}

/**
 * Get image metadata without processing
 */
export async function getImageMetadata(
    inputBuffer: Buffer
): Promise<ImageMetadata | null> {
    try {
        const metadata = await sharp(inputBuffer).metadata();
        return {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || 'unknown',
        };
    } catch (error) {
        console.error('Error getting image metadata:', error);
        return null;
    }
}

/**
 * Validate if buffer is a valid image
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
    try {
        const metadata = await sharp(buffer).metadata();
        return !!metadata.format;
    } catch {
        return false;
    }
}

/**
 * Remove EXIF metadata from an image
 * Returns a buffer without any metadata
 */
export async function stripExifData(inputBuffer: Buffer): Promise<Buffer> {
    return sharp(inputBuffer)
        .rotate() // Auto-rotate based on EXIF before stripping
        .toBuffer();
}

/**
 * Generate storage paths for an image
 */
export function generateStoragePaths(
    userId: string,
    filename: string
): { previewPath: string; fullPath: string } {
    return {
        previewPath: `${userId}/previews/${filename}`,
        fullPath: `${userId}/full/${filename}`,
    };
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(
    originalSize: number,
    compressedSize: number
): number {
    return Math.round((1 - compressedSize / originalSize) * 100);
}
