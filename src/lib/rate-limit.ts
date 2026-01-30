/**
 * ===========================================
 * PHOTOVAULT - Rate Limiting Utility
 * ===========================================
 * Implements rate limiting for API routes to prevent abuse
 */

import { RateLimiterMemory } from 'rate-limiter-flexible';

// ===========================================
// CONFIGURATION
// ===========================================

const RATE_LIMIT_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS || '100', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

// ===========================================
// RATE LIMITERS
// ===========================================
// 
// ⚠️ IMPORTANT: These use in-memory storage which does NOT persist
// across serverless function invocations (e.g., Vercel).
// 
// For production on serverless platforms, consider:
// 1. RateLimiterRedis with Upstash Redis (recommended)
// 2. RateLimiterPostgres with your Supabase database
// 3. Vercel's built-in rate limiting (via middleware)
//
// Example with Upstash Redis:
// import { RateLimiterRedis } from 'rate-limiter-flexible';
// import { Redis } from '@upstash/redis';
// const redis = Redis.fromEnv();
// const limiter = new RateLimiterRedis({ storeClient: redis, ... });

// General API rate limiter (100 requests per 15 minutes)
const generalLimiter = new RateLimiterMemory({
    points: RATE_LIMIT_REQUESTS,
    duration: RATE_LIMIT_WINDOW_MS / 1000, // Convert to seconds
});

// Strict rate limiter for auth routes (10 requests per 15 minutes)
const authLimiter = new RateLimiterMemory({
    points: 10,
    duration: 900, // 15 minutes
});

// Upload rate limiter (20 uploads per hour)
const uploadLimiter = new RateLimiterMemory({
    points: 20,
    duration: 3600, // 1 hour
});

// ===========================================
// RATE LIMITING FUNCTIONS
// ===========================================

export interface RateLimitResult {
    success: boolean;
    remainingPoints: number;
    msBeforeNext: number;
}

/**
 * Check general rate limit
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
    try {
        const result = await generalLimiter.consume(key, 1);
        return {
            success: true,
            remainingPoints: result.remainingPoints,
            msBeforeNext: result.msBeforeNext,
        };
    } catch (rateLimiterRes) {
        const res = rateLimiterRes as { remainingPoints: number; msBeforeNext: number };
        return {
            success: false,
            remainingPoints: res.remainingPoints || 0,
            msBeforeNext: res.msBeforeNext || 0,
        };
    }
}

/**
 * Check auth-specific rate limit (stricter)
 */
export async function checkAuthRateLimit(key: string): Promise<RateLimitResult> {
    try {
        const result = await authLimiter.consume(key, 1);
        return {
            success: true,
            remainingPoints: result.remainingPoints,
            msBeforeNext: result.msBeforeNext,
        };
    } catch (rateLimiterRes) {
        const res = rateLimiterRes as { remainingPoints: number; msBeforeNext: number };
        return {
            success: false,
            remainingPoints: res.remainingPoints || 0,
            msBeforeNext: res.msBeforeNext || 0,
        };
    }
}

/**
 * Check upload rate limit
 */
export async function checkUploadRateLimit(key: string): Promise<RateLimitResult> {
    try {
        const result = await uploadLimiter.consume(key, 1);
        return {
            success: true,
            remainingPoints: result.remainingPoints,
            msBeforeNext: result.msBeforeNext,
        };
    } catch (rateLimiterRes) {
        const res = rateLimiterRes as { remainingPoints: number; msBeforeNext: number };
        return {
            success: false,
            remainingPoints: res.remainingPoints || 0,
            msBeforeNext: res.msBeforeNext || 0,
        };
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
    // Check various headers for the real IP
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIP = headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback to a generic key
    return 'unknown';
}

/**
 * Format rate limit error message
 */
export function formatRateLimitError(msBeforeNext: number): string {
    const seconds = Math.ceil(msBeforeNext / 1000);
    if (seconds < 60) {
        return `Too many requests. Please try again in ${seconds} seconds.`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `Too many requests. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
}
