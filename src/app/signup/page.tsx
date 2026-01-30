/**
 * ===========================================
 * PHOTOVAULT - Signup Page
 * ===========================================
 * Premium registration with gold accent
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Key, Mail, Lock, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!inviteCode.trim()) {
            setError('Invite code is required');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    inviteCode: inviteCode.toUpperCase().trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Registration failed. Please try again.');
                return;
            }

            router.push('/gallery');
            router.refresh();
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Password validation checks
    const checks = [
        { label: 'At least 8 characters', valid: password.length >= 8 },
        { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
        { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
        { label: 'One number', valid: /\d/.test(password) },
    ];

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

                {/* Signup Card */}
                <div className="card-elevated p-6 animate-fade-in-up">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-semibold text-text-primary mb-1">Create Account</h1>
                        <p className="text-sm text-text-tertiary">Enter your invite code to join</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Invite Code */}
                        <div className="p-3 bg-accent/5 border border-accent/10 rounded-xl">
                            <Input
                                id="inviteCode"
                                type="text"
                                label="Invite Code"
                                placeholder="XXXXXXXX"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                required
                                className="text-center font-mono tracking-widest uppercase"
                                icon={<Key className="w-4 h-4" strokeWidth={2} />}
                            />
                            <p className="text-[10px] text-text-muted mt-2 text-center">
                                Required from an administrator
                            </p>
                        </div>

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
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            icon={<Lock className="w-4 h-4" strokeWidth={2} />}
                        />

                        <Input
                            id="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            icon={<Lock className="w-4 h-4" strokeWidth={2} />}
                        />

                        {/* Password requirements */}
                        <div className="space-y-1">
                            {checks.map((check, i) => (
                                <p
                                    key={i}
                                    className={`text-xs flex items-center gap-1.5 ${check.valid ? 'text-success' : 'text-text-muted'}`}
                                >
                                    {check.valid ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                                    ) : (
                                        <Circle className="w-3.5 h-3.5" strokeWidth={2} />
                                    )}
                                    {check.label}
                                </p>
                            ))}
                        </div>

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
                            Create Account
                        </Button>
                    </form>

                    <div className="divider my-6" />

                    <p className="text-center text-sm text-text-tertiary">
                        Already have an account?{' '}
                        <Link href="/login" className="text-accent hover:text-accent-light transition-colors font-medium">
                            Sign in
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
