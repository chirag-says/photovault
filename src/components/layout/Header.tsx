/**
 * ===========================================
 * PHOTOVAULT - Header Component
 * ===========================================
 * Premium navigation with gold accent
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    Image,
    Upload,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    FolderOpen,
    Globe
} from 'lucide-react';
import type { UserWithoutPassword } from '@/lib/types';

interface HeaderProps {
    user: UserWithoutPassword | null;
}

export function Header({ user }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                router.push('/login');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const navItems = [
        { href: '/gallery', label: 'Gallery', icon: Image },
        { href: '/albums', label: 'My Albums', icon: FolderOpen },
        { href: '/public/albums', label: 'Browse', icon: Globe },
        { href: '/upload', label: 'Upload', icon: Upload },
    ];

    if (user?.role === 'admin') {
        navItems.push({ href: '/admin', label: 'Admin', icon: Settings });
    }

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-black/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/gallery" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
                            <Shield className="w-4 h-4 text-black" strokeWidth={2.5} />
                        </div>
                        <span className="text-base font-semibold text-text-primary">
                            PhotoVault
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                                        transition-colors duration-150
                                        ${isActive
                                            ? 'text-accent bg-accent/[0.08]'
                                            : 'text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02]'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" strokeWidth={2} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        {/* User info */}
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-medium text-text-primary">{user?.email}</p>
                            <p className="text-[10px] text-accent font-medium uppercase tracking-wide">{user?.role}</p>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                                text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02]
                                border border-border transition-colors duration-150
                                disabled:opacity-50
                            "
                        >
                            <LogOut className="w-4 h-4" strokeWidth={2} />
                            <span className="hidden sm:inline">{isLoggingOut ? 'Leaving...' : 'Logout'}</span>
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-white/[0.02]"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5" strokeWidth={2} />
                            ) : (
                                <Menu className="w-5 h-5" strokeWidth={2} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden py-3 border-t border-border animate-fade-in">
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                                            transition-colors duration-150
                                            ${isActive
                                                ? 'text-accent bg-accent/[0.08]'
                                                : 'text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02]'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" strokeWidth={2} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}

export default Header;
