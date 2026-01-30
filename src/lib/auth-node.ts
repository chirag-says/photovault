/**
 * ===========================================
 * PHOTOVAULT - Node.js Auth Utilities
 * ===========================================
 * Node.js specific auth functions (password hashing)
 * NOT compatible with Edge Runtime
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// ===========================================
// PASSWORD HASHING
// ===========================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
