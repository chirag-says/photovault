/**
 * ===========================================
 * PHOTOVAULT - Admin Dashboard Page
 * ===========================================
 * Premium admin with gold accent
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Image as ImageIcon,
    Key,
    CheckCircle,
    Plus,
    Copy,
    Check
} from 'lucide-react';
import { Button, Modal, Input } from '@/components/ui';
import type { UserWithoutPassword, InviteCode, AdminStats } from '@/lib/types';

// Skeleton Components
function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
        </div>
    );
}

function TableSkeleton() {
    return <div className="skeleton h-64 rounded-xl" />;
}

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserWithoutPassword[]>([]);
    const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showCreateCode, setShowCreateCode] = useState(false);
    const [newCodeMaxUses, setNewCodeMaxUses] = useState(1);
    const [newCodeExpiry, setNewCodeExpiry] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createdCode, setCreatedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [dashboardRes, usersRes, codesRes] = await Promise.all([
                fetch('/api/admin/dashboard'),
                fetch('/api/admin/users'),
                fetch('/api/admin/invite-codes'),
            ]);

            const [dashboardData, usersData, codesData] = await Promise.all([
                dashboardRes.json(),
                usersRes.json(),
                codesRes.json(),
            ]);

            if (dashboardData.success) {
                setStats(dashboardData.data.stats);
            }
            if (usersData.success) {
                setUsers(usersData.data);
            }
            if (codesData.success) {
                setInviteCodes(codesData.data);
            }
        } catch {
            setError('Failed to load admin data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCode = async () => {
        try {
            setIsCreating(true);
            const response = await fetch('/api/admin/invite-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    max_uses: newCodeMaxUses,
                    expires_at: newCodeExpiry || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setCreatedCode(data.data.code);
            setInviteCodes((prev) => [data.data, ...prev]);
            setNewCodeMaxUses(1);
            setNewCodeExpiry('');
        } catch {
            alert('Failed to create invite code');
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevokeCode = async (codeId: string) => {
        if (!confirm('Are you sure you want to revoke this invite code?')) return;

        try {
            const response = await fetch(`/api/admin/invite-codes?id=${codeId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setInviteCodes((prev) =>
                    prev.map((code) =>
                        code.id === codeId ? { ...code, is_active: false } : code
                    )
                );
            }
        } catch {
            alert('Failed to revoke invite code');
        }
    };

    const handleToggleUser = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isActive: !currentStatus }),
            });

            if (response.ok) {
                setUsers((prev) =>
                    prev.map((user) =>
                        user.id === userId ? { ...user, is_active: !currentStatus } : user
                    )
                );
            }
        } catch {
            alert('Failed to update user status');
        }
    };

    const handleCopyCode = () => {
        if (createdCode) {
            navigator.clipboard.writeText(createdCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="skeleton-heading w-32" />
                <StatsSkeleton />
                <TableSkeleton />
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>

            {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl">
                    <p className="text-sm text-error">{error}</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    label="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={<Users className="w-5 h-5" strokeWidth={1.5} />}
                />
                <StatsCard
                    label="Total Photos"
                    value={stats?.totalImages || 0}
                    icon={<ImageIcon className="w-5 h-5" strokeWidth={1.5} />}
                />
                <StatsCard
                    label="Total Codes"
                    value={stats?.totalInviteCodes || 0}
                    icon={<Key className="w-5 h-5" strokeWidth={1.5} />}
                />
                <StatsCard
                    label="Active Codes"
                    value={stats?.activeInviteCodes || 0}
                    icon={<CheckCircle className="w-5 h-5" strokeWidth={1.5} />}
                    highlight
                />
            </div>

            {/* Invite Codes Section */}
            <section className="card-elevated overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <h2 className="text-base font-semibold text-text-primary">Invite Codes</h2>
                    <Button onClick={() => setShowCreateCode(true)} size="sm">
                        <Plus className="w-4 h-4" strokeWidth={2} />
                        Generate Code
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Usage</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {inviteCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-text-muted">
                                        No invite codes yet
                                    </td>
                                </tr>
                            ) : (
                                inviteCodes.map((code) => (
                                    <tr key={code.id}>
                                        <td>
                                            <code className="px-2 py-1 bg-surface-elevated rounded text-xs font-mono text-accent">
                                                {code.code}
                                            </code>
                                        </td>
                                        <td>
                                            <span className={code.used_count >= code.max_uses ? 'text-error' : 'text-text-secondary'}>
                                                {code.used_count} / {code.max_uses}
                                            </span>
                                        </td>
                                        <td>
                                            {code.expires_at ? (
                                                <span className={new Date(code.expires_at) < new Date() ? 'text-error' : 'text-text-tertiary'}>
                                                    {formatDate(code.expires_at)}
                                                </span>
                                            ) : (
                                                <span className="text-text-muted">Never</span>
                                            )}
                                        </td>
                                        <td>
                                            {code.is_active ? (
                                                <span className="badge-success">Active</span>
                                            ) : (
                                                <span className="badge-error">Revoked</span>
                                            )}
                                        </td>
                                        <td className="text-text-tertiary">{formatDate(code.created_at)}</td>
                                        <td>
                                            {code.is_active && (
                                                <button
                                                    onClick={() => handleRevokeCode(code.id)}
                                                    className="text-xs text-text-muted hover:text-error transition-colors"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Users Section */}
            <section className="card-elevated overflow-hidden">
                <div className="p-5 border-b border-border">
                    <h2 className="text-base font-semibold text-text-primary">Users</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-text-muted">
                                        No users yet
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="text-text-primary font-medium">{user.email}</td>
                                        <td>
                                            {user.role === 'admin' ? (
                                                <span className="badge-accent">Admin</span>
                                            ) : (
                                                <span className="badge-neutral">User</span>
                                            )}
                                        </td>
                                        <td>
                                            {user.is_active ? (
                                                <span className="badge-success">Active</span>
                                            ) : (
                                                <span className="badge-error">Inactive</span>
                                            )}
                                        </td>
                                        <td className="text-text-tertiary">{formatDate(user.created_at)}</td>
                                        <td>
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleToggleUser(user.id, user.is_active)}
                                                    className={`text-xs transition-colors ${user.is_active
                                                        ? 'text-text-muted hover:text-error'
                                                        : 'text-text-muted hover:text-success'
                                                        }`}
                                                >
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Create Code Modal */}
            <Modal
                isOpen={showCreateCode}
                onClose={() => {
                    setShowCreateCode(false);
                    setCreatedCode(null);
                    setCopied(false);
                }}
                title={createdCode ? 'Invite Code Created' : 'Generate Invite Code'}
            >
                <div className="p-5">
                    {createdCode ? (
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-success/10 flex items-center justify-center">
                                <Check className="w-7 h-7 text-success" strokeWidth={2} />
                            </div>
                            <p className="text-sm text-text-tertiary mb-4">
                                Share this code with someone you want to invite:
                            </p>
                            <div className="p-4 bg-surface-elevated border border-border rounded-xl mb-5">
                                <code className="text-xl font-mono font-bold text-accent tracking-widest">
                                    {createdCode}
                                </code>
                            </div>
                            <Button onClick={handleCopyCode} variant="ghost">
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" strokeWidth={2} />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" strokeWidth={2} />
                                        Copy to Clipboard
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <Input
                                type="number"
                                label="Maximum Uses"
                                value={newCodeMaxUses}
                                onChange={(e) => setNewCodeMaxUses(parseInt(e.target.value) || 1)}
                                min={1}
                                max={1000}
                            />
                            <Input
                                type="datetime-local"
                                label="Expiry Date (optional)"
                                value={newCodeExpiry}
                                onChange={(e) => setNewCodeExpiry(e.target.value)}
                            />
                            <Button
                                onClick={handleCreateCode}
                                isLoading={isCreating}
                                className="w-full"
                                leftIcon={<Plus className="w-4 h-4" strokeWidth={2} />}
                            >
                                Generate Code
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

// Stats Card Component
function StatsCard({
    label,
    value,
    icon,
    highlight = false,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    highlight?: boolean;
}) {
    return (
        <div className={`p-5 rounded-xl border ${highlight ? 'bg-accent/5 border-accent/20' : 'bg-surface border-border'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${highlight ? 'bg-accent/10 text-accent' : 'bg-surface-elevated text-text-tertiary'
                }`}>
                {icon}
            </div>
            <div className={`text-2xl font-bold mb-1 ${highlight ? 'text-accent' : 'text-text-primary'}`}>
                {value.toLocaleString()}
            </div>
            <div className="text-xs text-text-muted uppercase tracking-wide font-medium">
                {label}
            </div>
        </div>
    );
}
