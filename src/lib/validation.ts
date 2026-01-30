/**
 * ===========================================
 * PHOTOVAULT - Validation Schemas & Utilities
 * ===========================================
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';

// ===========================================
// USER VALIDATION
// ===========================================

export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim();

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    );

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    inviteCode: z
        .string()
        .min(1, 'Invite code is required')
        .trim()
        .toUpperCase(),
});

// ===========================================
// INVITE CODE VALIDATION
// ===========================================

export const inviteCodeSchema = z.object({
    max_uses: z
        .number()
        .int()
        .min(1, 'Max uses must be at least 1')
        .max(1000, 'Max uses cannot exceed 1000')
        .optional()
        .default(1),
    expires_at: z
        .string()
        .datetime()
        .optional()
        .refine(
            (date) => {
                if (!date) return true;
                return new Date(date) > new Date();
            },
            { message: 'Expiry date must be in the future' }
        ),
});

// ===========================================
// IMAGE VALIDATION
// ===========================================

// Allowed MIME types for image uploads
export const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
] as const;

// Maximum file size in bytes (default: 10MB)
export const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024;

export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
        };
    }

    return { valid: true };
}

// ===========================================
// GENERAL UTILITIES
// ===========================================

/**
 * Sanitize a string for safe use
 */
export function sanitizeString(str: string): string {
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .slice(0, 1000); // Limit length
}

/**
 * Validate UUID format
 */
export function isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

/**
 * Parse and validate pagination parameters
 */
export function parsePagination(
    page?: string | number,
    limit?: string | number
): { page: number; limit: number; offset: number } {
    const parsedPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 20), 10) || 20));
    const offset = (parsedPage - 1) * parsedLimit;

    return { page: parsedPage, limit: parsedLimit, offset };
}

// ===========================================
// TYPE EXPORTS
// ===========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateInviteCodeInput = z.infer<typeof inviteCodeSchema>;
