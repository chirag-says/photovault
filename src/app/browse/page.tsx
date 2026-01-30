/**
 * ===========================================
 * PHOTOVAULT - Browse All Albums Page
 * ===========================================
 * Browse all albums (public + private)
 * Requires authentication
 * Public albums: Direct access
 * Private albums: Require access code
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Image as ImageIcon,
    Key,
    Loader2,
    ArrowRight,
    Globe,
    Lock,
    User
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import type { BrowseAlbum } from '@/lib/types';

export default function BrowseAlbumsPage() {
    const router = useRouter();
    const [albums, setAlbums] = useState<BrowseAlbum[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectedPrivateAlbum, setSelectedPrivateAlbum] = useState<BrowseAlbum | null>(null);
    const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
    const [accessCode, setAccessCode] = useState('');
    const [accessError, setAccessError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

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

    const handleAccessSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessCode.trim()) {
            setAccessError('Please enter an access code');
            return;
        }

        setIsValidating(true);
        setAccessError('');

        try {
            // If we have a selected album, verify the code for that album
            if (selectedPrivateAlbum) {
                const response = await fetch(`/api/albums/${selectedPrivateAlbum.id}?code=${accessCode}`);
                const data = await response.json();

                if (data.success) {
                    router.push(`/public/albums/${selectedPrivateAlbum.id}?code=${accessCode}`);
                } else {
                    setAccessError(data.error || 'Invalid access code');
                }
            } else {
                // General access code - try to find matching album
                const response = await fetch('/api/albums/access', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: accessCode }),
                });
                const data = await response.json();

                if (data.success) {
                    router.push(`/public/albums/${data.data.albumId}?code=${accessCode}`);
                } else {
                    setAccessError(data.error || 'Invalid access code');
                }
            }
        } catch {
            setAccessError('Failed to validate access code');
        } finally {
            setIsValidating(false);
        }
    };

    const publicCount = albums.filter(a => a.visibility === 'public').length;
    const privateCount = albums.filter(a => a.visibility === 'private').length;

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" strokeWidth={2} />
            </div>
        );
    }

    return (
        <>
            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Browse Albums</h1>
                        <p className="text-text-muted mt-2">
                            Explore photo albums shared by our community
                        </p>
                    </div>
                    <Button variant="ghost" onClick={() => {
                        setSelectedPrivateAlbum(null);
                        setAccessCode('');
                        setAccessError('');
                        setShowAccessModal(true);
                    }}>
                        <Key className="w-4 h-4" strokeWidth={2} />
                        Enter Code
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${filter === 'all'
                                ? 'bg-surface border border-accent text-text-primary'
                                : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                            }
                        `}
                    >
                        All ({albums.length})
                    </button>
                    <button
                        onClick={() => setFilter('public')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${filter === 'public'
                                ? 'bg-surface border border-accent text-text-primary'
                                : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                            }
                        `}
                    >
                        <Globe className="w-4 h-4" strokeWidth={2} />
                        Public ({publicCount})
                    </button>
                    <button
                        onClick={() => setFilter('private')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${filter === 'private'
                                ? 'bg-surface border border-accent text-text-primary'
                                : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                            }
                        `}
                    >
                        <Lock className="w-4 h-4" strokeWidth={2} />
                        Private ({privateCount})
                    </button>
                </div>

                {/* Albums Grid */}
                {filteredAlbums.length === 0 ? (
                    <div className="text-center py-20 bg-surface border border-border rounded-xl">
                        <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-4" strokeWidth={1.5} />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                            No albums found
                        </h3>
                        <p className="text-text-muted">
                            {filter === 'all'
                                ? 'No albums have been shared yet'
                                : `No ${filter} albums available`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAlbums.map((album) => (
                            <div
                                key={album.id}
                                className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300"
                            >
                                {/* Album Cover */}
                                {album.visibility === 'public' ? (
                                    <Link href={`/public/albums/${album.id}`}>
                                        <div className="relative aspect-[4/3] bg-black/50">
                                            {album.cover_url ? (
                                                <img
                                                    src={album.cover_url}
                                                    alt={album.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-text-muted" strokeWidth={1.5} />
                                                </div>
                                            )}
                                            {/* Visibility Badge */}
                                            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                                <Globe className="w-3 h-3" strokeWidth={2} />
                                                Public
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => handleAlbumClick(album)}
                                        className="w-full text-left"
                                    >
                                        <div className="relative aspect-[4/3] bg-black/50">
                                            {album.cover_url ? (
                                                <img
                                                    src={album.cover_url}
                                                    alt={album.name}
                                                    className="w-full h-full object-cover blur-sm group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-text-muted" strokeWidth={1.5} />
                                                </div>
                                            )}
                                            {/* Lock overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Lock className="w-8 h-8 text-white/70" strokeWidth={1.5} />
                                            </div>
                                            {/* Visibility Badge */}
                                            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                                                <Lock className="w-3 h-3" strokeWidth={2} />
                                                Private
                                            </div>
                                        </div>
                                    </button>
                                )}

                                {/* Album Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-text-primary truncate">
                                        {album.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
                                        <span className="flex items-center gap-1">
                                            <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />
                                            {album.image_count} photos
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" strokeWidth={2} />
                                            {album.created_by}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Arrow for Public Albums */}
                                {album.visibility === 'public' && (
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-5 h-5 text-accent" strokeWidth={2} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Access Code Modal */}
            <Modal
                isOpen={showAccessModal}
                onClose={() => {
                    setShowAccessModal(false);
                    setSelectedPrivateAlbum(null);
                    setAccessCode('');
                    setAccessError('');
                }}
                title={selectedPrivateAlbum ? `Access: ${selectedPrivateAlbum.name}` : 'Enter Access Code'}
            >
                <form onSubmit={handleAccessSubmit} className="space-y-4">
                    <p className="text-text-muted">
                        {selectedPrivateAlbum
                            ? 'Enter the access code to view this private album.'
                            : 'Enter an access code to view a private album.'
                        }
                    </p>
                    <Input
                        type="text"
                        placeholder="Access code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        error={accessError}
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setShowAccessModal(false);
                                setSelectedPrivateAlbum(null);
                                setAccessCode('');
                                setAccessError('');
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isValidating}
                            className="flex-1"
                        >
                            Access Album
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
