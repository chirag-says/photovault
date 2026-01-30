/**
 * ===========================================
 * PHOTOVAULT - Admin Layout
 * ===========================================
 * Layout wrapper for admin pages (admin role required)
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { findUserById } from '@/lib/db';
import { Header } from '@/components/layout';
import type { UserWithoutPassword } from '@/lib/types';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Get session
    const cookieStore = await cookies();
    const token = cookieStore.get('photovault_session')?.value;

    if (!token) {
        redirect('/login');
    }

    const session = await verifyToken(token);
    if (!session) {
        redirect('/login');
    }

    // Verify admin role
    if (session.role !== 'admin') {
        redirect('/gallery');
    }

    // Get user data
    const user = await findUserById(session.userId);
    if (!user || !user.is_active) {
        redirect('/login');
    }

    const userWithoutPassword: UserWithoutPassword = {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };

    return (
        <div className="min-h-screen bg-background">
            <Header user={userWithoutPassword} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Admin badge */}
                <div className="mb-8 flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-premium text-white rounded-full">
                        Admin Panel
                    </span>
                </div>
                {children}
            </main>
        </div>
    );
}
