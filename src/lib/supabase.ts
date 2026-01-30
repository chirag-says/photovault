/**
 * ===========================================
 * PHOTOVAULT - Supabase Client Configuration
 * ===========================================
 * Configures both client-side and server-side Supabase clients
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ===========================================
// ENVIRONMENT VARIABLES
// ===========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validation
if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// ===========================================
// CLIENT-SIDE SUPABASE CLIENT
// ===========================================
// Used for client-side operations (limited permissions)

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (!clientInstance) {
        clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return clientInstance;
}

// ===========================================
// SERVER-SIDE SUPABASE CLIENT
// ===========================================
// Used in API routes with full admin access
// NEVER expose this on the client side

let serverInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseServiceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }

    if (!serverInstance) {
        serverInstance = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return serverInstance;
}

// ===========================================
// STORAGE HELPERS
// ===========================================

export const STORAGE_BUCKET = 'photos';

/**
 * Get a signed URL for accessing a private file
 * @param path - The path to the file in the bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedUrl(
    path: string,
    expiresIn: number = 3600
): Promise<string | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, expiresIn);

    if (error) {
        console.error('Error getting signed URL:', error);
        return null;
    }

    return data.signedUrl;
}

/**
 * Upload a file to Supabase Storage
 * @param path - The destination path in the bucket
 * @param file - The file buffer to upload
 * @param contentType - The MIME type of the file
 */
export async function uploadFile(
    path: string,
    file: Buffer,
    contentType: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
            contentType,
            upsert: false,
        });

    if (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete a file from Supabase Storage
 * @param paths - Array of file paths to delete
 */
export async function deleteFiles(
    paths: string[]
): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(paths);

    if (error) {
        console.error('Error deleting files:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ===========================================
// DATABASE HELPERS
// ===========================================

export { supabaseUrl };
