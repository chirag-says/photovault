/**
 * ===========================================
 * PHOTOVAULT - Browse All Albums Page
 * ===========================================
 * Browse all albums (public + private)
 * Public albums: Direct access
 * Private albums: Require access code
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Shield,
    Image as ImageIcon,
    Key,
    Loader2,
    ArrowRight,
    Globe,
    Lock,
    User,
    FolderOpen,
    Upload,
    Menu,
    X
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import type { BrowseAlbum } from '@/lib/types';

export default function BrowseAlbumsPage() {
    const [albums, setAlbums] = useState<BrowseAlbum[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedPrivateAlbum, setSelectedPrivateAlbum] = useState<BrowseAlbum | null>(null);
    const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchAllAlbums();
    }, []);

    const fetchAllAlbums = async () => {
        try {
            const response = await fetch('/api/albums/browse');
            const data = await response.json();
            if (data.success) {
                setAlbums(data.data);
            }
        } catch (error) {
            console.error('Error fetching albums:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAlbums = albums.filter(album => {
        if (filter === 'all') return true;
        return album.visibility === filter;
    });

    const handleAlbumClick = (album: BrowseAlbum) => {
        if (album.visibility === 'private') {
            setSelectedPrivateAlbum(album);
            setShowAccessModal(true);
        }
        // Public albums navigate directly via Link
    };

    const publicCount = albums.filter(a => a.visibility === 'public').length;
    const privateCount = albums.filter(a => a.visibility === 'private').length;

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border bg-black/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
                                <Shield className="w-4 h-4 text-black" strokeWidth={2.5} />
                            </div>
                            <span className="text-base font-semibold text-text-primary">PhotoVault</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            <Link
                                href="/gallery"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02] transition-colors duration-150"
                            >
                                <ImageIcon className="w-4 h-4" strokeWidth={2} />
                                Gallery
                            </Link>
                            <Link
                                href="/albums"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02] transition-colors duration-150"
                            >
                                <FolderOpen className="w-4 h-4" strokeWidth={2} />
                                My Albums
                            </Link>
                            <Link
                                href="/public/albums"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-accent bg-accent/[0.08] transition-colors duration-150"
                            >
                                <Globe className="w-4 h-4" strokeWidth={2} />
                                Browse
                            </Link>
                            <Link
                                href="/upload"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02] transition-colors duration-150"
                            >
                                <Upload className="w-4 h-4" strokeWidth={2} />
                                Upload
                            </Link>
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={() => {
                                setSelectedPrivateAlbum(null);
                                setShowAccessModal(true);
                            }} size="sm">
                                <Key className="w-4 h-4" strokeWidth={2} />
                                <span className="hidden sm:inline">Enter Code</span>
                            </Button>
                            <Link href="/login">
                                <Button variant="primary" size="sm">
                                    Login
                                </Button>
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-white/[0.02]"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5" strokeWidth={2} />
                                ) : (
                                    <Menu className="w-5 h-5" strokeWidth={2} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <nav className="md:hidden py-3 border-t border-border animate-fade-in">
                            <div className="space-y-1">
                                <Link
                                    href="/gallery"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02] transition-colors duration-150"
                                >
                                    <ImageIcon className="w-5 h-5" strokeWidth={2} />
                                    Gallery
                                </Link>
                                <Link
                                    href="/albums"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02] transition-colors duration-150"
                                >
                                    <FolderOpen className="w-5 h-5" strokeWidth={2} />
                                    My Albums
                                </Link>
                                <Link
                                    href="/public/albums"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent bg-accent/[0.08] transition-colors duration-150"
                                >
                                    <Globe className="w-5 h-5" strokeWidth={2} />
                                    Browse
                                </Link>
                                <Link
                                    href="/upload"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02] transition-colors duration-150"
                                >
                                    <Upload className="w-5 h-5" strokeWidth={2} />
                                    Upload
                                </Link>
                            </div>
                        </nav>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Browse Albums</h1>
                    <p className="text-text-muted mt-2">
                        Explore photo albums shared by our community
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-accent text-black'
                            : 'bg-surface text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                            }`}
                    >
                        All ({albums.length})
                    </button>
                    <button
                        onClick={() => setFilter('public')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'public'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-surface text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                            }`}
                    >
                        <Globe className="w-4 h-4" strokeWidth={2} />
                        Public ({publicCount})
                    </button>
                    <button
                        onClick={() => setFilter('private')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'private'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-surface text-text-muted hover:text-text-primary hover:bg-surface-elevated'
                            }`}
                    >
                        <Lock className="w-4 h-4" strokeWidth={2} />
                        Private ({privateCount})
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" strokeWidth={2} />
                    </div>
                ) : filteredAlbums.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-medium text-text-primary mb-2">
                            {filter === 'all' ? 'No albums yet' : `No ${filter} albums`}
                        </h3>
                        <p className="text-text-muted mb-6">
                            {filter === 'private'
                                ? 'Private albums will appear here when shared'
                                : 'Check back later for new albums'}
                        </p>
                        {filter !== 'all' && (
                            <Button variant="ghost" onClick={() => setFilter('all')}>
                                Show All Albums
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAlbums.map((album) => (
                            <AlbumCard
                                key={album.id}
                                album={album}
                                onPrivateClick={() => handleAlbumClick(album)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Access Code Modal */}
            <AccessCodeModal
                isOpen={showAccessModal}
                onClose={() => {
                    setShowAccessModal(false);
                    setSelectedPrivateAlbum(null);
                }}
                prefilledAlbum={selectedPrivateAlbum}
            />
        </div>
    );
}

// Album Card Component
function AlbumCard({
    album,
    onPrivateClick
}: {
    album: BrowseAlbum;
    onPrivateClick: () => void;
}) {
    const isPublic = album.visibility === 'public';

    const CardContent = (
        <>
            {/* Cover */}
            <div className="aspect-video bg-surface-elevated relative overflow-hidden">
                {album.cover_url ? (
                    <img
                        src={album.cover_url}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-text-muted" strokeWidth={1} />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Visibility Badge */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium ${isPublic
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                    {isPublic ? (
                        <>
                            <Globe className="w-3 h-3" strokeWidth={2} />
                            Public
                        </>
                    ) : (
                        <>
                            <Lock className="w-3 h-3" strokeWidth={2} />
                            Private
                        </>
                    )}
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-semibold text-white text-lg truncate">{album.name}</h3>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                {album.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">{album.description}</p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />
                            {album.image_count} photos
                        </span>
                        <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" strokeWidth={2} />
                            {album.created_by}
                        </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                </div>
            </div>
        </>
    );

    if (isPublic) {
        return (
            <Link
                href={`/public/albums/${album.id}`}
                className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-all"
            >
                {CardContent}
            </Link>
        );
    }

    // Private albums - show click handler
    return (
        <button
            onClick={onPrivateClick}
            className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-purple-500/30 transition-all text-left w-full"
        >
            {CardContent}
        </button>
    );
}

// Access Code Modal
function AccessCodeModal({
    isOpen,
    onClose,
    prefilledAlbum,
}: {
    isOpen: boolean;
    onClose: () => void;
    prefilledAlbum?: BrowseAlbum | null;
}) {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            // If we have a prefilled album, just try to access it directly
            if (prefilledAlbum) {
                router.push(`/public/albums/${prefilledAlbum.id}?code=${code.trim().toUpperCase()}`);
                onClose();
                return;
            }

            // Otherwise, verify the code via API
            const response = await fetch('/api/albums/access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });

            const data = await response.json();

            if (data.success) {
                router.push(`/public/albums/${data.data.albumId}?code=${code.trim().toUpperCase()}`);
                onClose();
            } else {
                setError(data.error || 'Invalid access code');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={prefilledAlbum ? `Access "${prefilledAlbum.name}"` : "Access Private Album"}>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {prefilledAlbum ? (
                    <p className="text-sm text-text-muted">
                        This album is private. Enter the access code shared with you to view its contents.
                    </p>
                ) : (
                    <p className="text-sm text-text-muted">
                        Enter the access code to view a private album
                    </p>
                )}

                <Input
                    label="Access Code"
                    placeholder="ABCD1234"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setError('');
                    }}
                    error={error}
                    className="text-center font-mono text-lg tracking-widest"
                    autoFocus
                />

                <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1">
                        <Lock className="w-4 h-4" strokeWidth={2} />
                        Access Album
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
