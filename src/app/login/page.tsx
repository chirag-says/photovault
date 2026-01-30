/**
 * ===========================================
 * PHOTOVAULT - Login Page
 * ===========================================
 * Premium authentication with gold accent
 */

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';

// ===========================================
// LOGIN FORM COMPONENT
// ===========================================

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/gallery';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Login failed. Please try again.');
                return;
            }

            router.push(redirect);
            router.refresh();
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                id="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                icon={<Mail className="w-4 h-4" strokeWidth={2} />}
            />

            <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                icon={<Lock className="w-4 h-4" strokeWidth={2} />}
            />

            {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                    <p className="text-sm text-error text-center">{error}</p>
                </div>
            )}

            <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
            >
                Sign In
            </Button>
        </form>
    );
}

// ===========================================
// LOADING SKELETON
// ===========================================

function LoginFormSkeleton() {
    return (
        <div className="space-y-5">
            <div>
                <div className="skeleton-text w-12 mb-1.5" />
                <div className="skeleton h-12 rounded-[10px]" />
            </div>
            <div>
                <div className="skeleton-text w-16 mb-1.5" />
                <div className="skeleton h-12 rounded-[10px]" />
            </div>
            <div className="skeleton-button rounded-[10px]" />
        </div>
    );
}

// ===========================================
// MAIN PAGE
// ===========================================

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
            {/* Subtle gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
                            <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-semibold text-text-primary">PhotoVault</span>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="card-elevated p-6 animate-fade-in-up">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-semibold text-text-primary mb-1">Welcome Back</h1>
                        <p className="text-sm text-text-tertiary">Sign in to access your vault</p>
                    </div>

                    <Suspense fallback={<LoginFormSkeleton />}>
                        <LoginForm />
                    </Suspense>

                    <div className="divider my-6" />

                    <p className="text-center text-sm text-text-tertiary">
                        Have an invite code?{' '}
                        <Link href="/signup" className="text-accent hover:text-accent-light transition-colors font-medium">
                            Create account
                        </Link>
                    </p>
                </div>

                {/* Back link */}
                <p className="text-center mt-6">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-tertiary transition-colors">
                        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                        Back to home
                    </Link>
                </p>
            </div>
        </div>
    );
}
