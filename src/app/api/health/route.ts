/**
 * ===========================================
 * PHOTOVAULT - Health Check API
 * ===========================================
 * Simple health check endpoint for monitoring
 */

import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
}
