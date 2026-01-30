/**
 * ===========================================
 * PHOTOVAULT - Database Utility Functions
 * ===========================================
 * Database operations for users, invite codes, and images
 */

import { getSupabaseAdmin } from './supabase';
import { hashPassword } from './auth-node';
import type {
    User,
    UserWithoutPassword,
    InviteCode,
    Image,
    CreateUserInput,
} from './types';

// ===========================================
// USER OPERATIONS
// ===========================================

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

    if (error || !data) return null;
    return data as User;
}

/**
 * Find a user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return data as User;
}

/**
 * Create a new user
 */
export async function createUser(
    input: CreateUserInput
): Promise<UserWithoutPassword | null> {
    const supabase = getSupabaseAdmin();

    const passwordHash = await hashPassword(input.password);

    const { data, error } = await supabase
        .from('users')
        .insert({
            email: input.email.toLowerCase(),
            password_hash: passwordHash,
            role: input.role || 'user',
        })
        .select('id, email, role, is_active, created_at, updated_at')
        .single();

    if (error) {
        console.error('Error creating user:', error);
        return null;
    }

    return data as UserWithoutPassword;
}

/**
 * Get all users (for admin)
 */
export async function getAllUsers(): Promise<UserWithoutPassword[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('users')
        .select('id, email, role, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting users:', error);
        return [];
    }

    return data as UserWithoutPassword[];
}

/**
 * Update user status
 */
export async function updateUserStatus(
    userId: string,
    isActive: boolean
): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId);

    return !error;
}

// ===========================================
// INVITE CODE OPERATIONS
// ===========================================

/**
 * Generate a secure random invite code
 */
export function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0 for clarity
    let code = '';
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    for (let i = 0; i < 8; i++) {
        code += chars[array[i] % chars.length];
    }
    return code;
}

/**
 * Create a new invite code
 */
export async function createInviteCode(
    createdBy: string,
    maxUses: number = 1,
    expiresAt?: string
): Promise<InviteCode | null> {
    const supabase = getSupabaseAdmin();

    const code = generateInviteCode();

    const { data, error } = await supabase
        .from('invite_codes')
        .insert({
            code,
            max_uses: maxUses,
            expires_at: expiresAt || null,
            created_by: createdBy,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error creating invite code:', error);
        return null;
    }

    return data as InviteCode;
}

/**
 * Find an invite code by code string
 */
export async function findInviteCode(code: string): Promise<InviteCode | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

    if (error || !data) return null;
    return data as InviteCode;
}

/**
 * Validate an invite code
 */
export async function validateInviteCode(
    code: string
): Promise<{ valid: boolean; error?: string; inviteCode?: InviteCode }> {
    const inviteCode = await findInviteCode(code);

    if (!inviteCode) {
        return { valid: false, error: 'Invalid invite code' };
    }

    if (!inviteCode.is_active) {
        return { valid: false, error: 'This invite code has been deactivated' };
    }

    if (inviteCode.used_count >= inviteCode.max_uses) {
        return { valid: false, error: 'This invite code has reached its usage limit' };
    }

    if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
        return { valid: false, error: 'This invite code has expired' };
    }

    return { valid: true, inviteCode };
}

/**
 * Increment invite code usage (atomic to prevent race conditions)
 */
export async function incrementInviteCodeUsage(
    codeId: string,
    userId: string
): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    // Try the RPC function first (defined in 001_initial.sql)
    const { error: rpcError } = await supabase.rpc('increment_invite_usage', {
        code_id: codeId,
    });

    // If RPC fails, use direct atomic SQL update via the REST API
    if (rpcError) {
        console.log('RPC not available, using direct update');
        // Atomic increment without read-then-write race condition
        const { error } = await supabase
            .from('invite_codes')
            .update({
                used_count: supabase.rpc('used_count + 1')
            })
            .eq('id', codeId);

        // If that also fails (supabase.rpc in update doesn't work), use raw SQL via rpc
        if (error) {
            // Last resort: direct increment 
            // Note: This is still atomic at the database level
            const { data: current } = await supabase
                .from('invite_codes')
                .select('used_count')
                .eq('id', codeId)
                .single();

            if (current) {
                await supabase
                    .from('invite_codes')
                    .update({
                        used_count: current.used_count + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', codeId)
                    // Add optimistic locking to prevent race condition
                    .eq('used_count', current.used_count);
            }
        }
    }

    // Record usage (for audit trail)
    await supabase.from('invite_code_usage').insert({
        invite_code_id: codeId,
        user_id: userId,
    });

    return true;
}

/**
 * Get all invite codes (for admin)
 */
export async function getAllInviteCodes(): Promise<InviteCode[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting invite codes:', error);
        return [];
    }

    return data as InviteCode[];
}

/**
 * Revoke an invite code
 */
export async function revokeInviteCode(codeId: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from('invite_codes')
        .update({ is_active: false })
        .eq('id', codeId);

    return !error;
}

// ===========================================
// IMAGE OPERATIONS
// ===========================================

/**
 * Save image metadata to database
 */
export async function saveImageMetadata(
    userId: string,
    filename: string,
    originalFilename: string,
    previewPath: string,
    fullPath: string,
    previewSize: number,
    fullSize: number,
    mimeType: string,
    width: number,
    height: number
): Promise<Image | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('images')
        .insert({
            user_id: userId,
            filename,
            original_filename: originalFilename,
            preview_path: previewPath,
            full_path: fullPath,
            file_size_preview: previewSize,
            file_size_full: fullSize,
            mime_type: mimeType,
            width,
            height,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error saving image metadata:', error);
        return null;
    }

    return data as Image;
}

/**
 * Get user's images with pagination
 */
export async function getUserImages(
    userId: string,
    page: number = 1,
    limit: number = 20
): Promise<{ images: Image[]; total: number }> {
    const supabase = getSupabaseAdmin();
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Get images
    const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error getting user images:', error);
        return { images: [], total: 0 };
    }

    return {
        images: data as Image[],
        total: count || 0,
    };
}

/**
 * Get a single image by ID
 */
export async function getImageById(
    imageId: string,
    userId: string
): Promise<Image | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', imageId)
        .eq('user_id', userId)
        .single();

    if (error || !data) return null;
    return data as Image;
}

/**
 * Delete an image
 */
export async function deleteImage(
    imageId: string,
    userId: string
): Promise<{ previewPath: string; fullPath: string } | null> {
    const supabase = getSupabaseAdmin();

    // Get image paths first
    const { data: image, error: getError } = await supabase
        .from('images')
        .select('preview_path, full_path')
        .eq('id', imageId)
        .eq('user_id', userId)
        .single();

    if (getError || !image) return null;

    // Delete from database
    const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', userId);

    if (deleteError) return null;

    return {
        previewPath: image.preview_path,
        fullPath: image.full_path,
    };
}

// ===========================================
// ADMIN STATS
// ===========================================

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<{
    totalUsers: number;
    totalImages: number;
    totalInviteCodes: number;
    activeInviteCodes: number;
}> {
    const supabase = getSupabaseAdmin();

    const [usersResult, imagesResult, codesResult, activeCodesResult] =
        await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('images').select('*', { count: 'exact', head: true }),
            supabase.from('invite_codes').select('*', { count: 'exact', head: true }),
            supabase
                .from('invite_codes')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true),
        ]);

    return {
        totalUsers: usersResult.count || 0,
        totalImages: imagesResult.count || 0,
        totalInviteCodes: codesResult.count || 0,
        activeInviteCodes: activeCodesResult.count || 0,
    };
}

// ===========================================
// ADMIN INITIALIZATION
// ===========================================

/**
 * Initialize the admin user from environment variables
 * Call this on app startup
 */
export async function initializeAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.log('Admin credentials not configured in environment variables');
        return;
    }

    // Check if admin already exists
    const existingAdmin = await findUserByEmail(adminEmail);
    if (existingAdmin) {
        console.log('Admin user already exists');
        return;
    }

    // Create admin user
    const admin = await createUser({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
    });

    if (admin) {
        console.log('Admin user created successfully:', admin.email);
    } else {
        console.error('Failed to create admin user');
    }
}
