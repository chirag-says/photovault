/**
 * ===========================================
 * PHOTOVAULT - Albums Page
 * ===========================================
 * User's album management
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Lock, Globe, Image as ImageIcon, Loader2, FolderOpen, Copy, Check, Key } from 'lucide-react';
import { Button, Modal, Input } from '@/components/ui';
import type { AlbumWithCover, AlbumVisibility } from '@/lib/types';

interface CreatedAlbum {
    id: string;
    name: string;
    visibility: AlbumVisibility;
    access_code: string | null;
}

export default function AlbumsPage() {
    const [albums, setAlbums] = useState<AlbumWithCover[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createdAlbum, setCreatedAlbum] = useState<CreatedAlbum | null>(null);

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            const response = await fetch('/api/albums');
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

    const handleCreateAlbum = async (name: string, description: string, visibility: AlbumVisibility) => {
        try {
            const response = await fetch('/api/albums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, visibility }),
            });
            const data = await response.json();
            if (data.success) {
                setAlbums(prev => [{ ...data.data, cover_url: null }, ...prev]);
                setShowCreateModal(false);
                // Show the created album with access code
                if (visibility === 'private') {
                    setCreatedAlbum({
                        id: data.data.id,
                        name: data.data.name,
                        visibility: data.data.visibility,
                        access_code: data.data.access_code,
                    });
                }
            }
        } catch (error) {
            console.error('Error creating album:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="skeleton-heading w-32" />
                    <div className="skeleton-button w-32" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton aspect-[4/3] rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Your Albums</h1>
                    <p className="text-sm text-text-muted mt-1">{albums.length} album{albums.length !== 1 ? 's' : ''}</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    New Album
                </Button>
            </div>

            {/* Albums Grid */}
            {albums.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                        <FolderOpen className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">No albums yet</h3>
                    <p className="text-text-muted mb-6">Create your first album to organize your photos</p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4" strokeWidth={2} />
                        Create Album
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {albums.map((album) => (
                        <AlbumCard key={album.id} album={album} />
                    ))}
                </div>
            )}

            {/* Create Album Modal */}
            <CreateAlbumModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateAlbum}
            />

            {/* Access Code Success Modal */}
            <AccessCodeModal
                album={createdAlbum}
                onClose={() => setCreatedAlbum(null)}
            />
        </div>
    );
}

// Album Card Component
function AlbumCard({ album }: { album: AlbumWithCover }) {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (album.access_code) {
            navigator.clipboard.writeText(album.access_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Link
            href={`/albums/${album.id}`}
            className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-all"
        >
            {/* Cover */}
            <div className="aspect-[4/3] bg-surface-elevated relative overflow-hidden">
                {album.cover_url ? (
                    <img
                        src={album.cover_url}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-text-muted" strokeWidth={1} />
                    </div>
                )}

                {/* Visibility badge */}
                <div className={`absolute top-2 right-2 p-1.5 rounded-lg ${album.visibility === 'public'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-purple-500/20 text-purple-400'
                    }`}>
                    {album.visibility === 'public' ? (
                        <Globe className="w-3.5 h-3.5" strokeWidth={2} />
                    ) : (
                        <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="font-medium text-text-primary truncate">{album.name}</h3>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-text-muted">
                        {album.image_count} photo{album.image_count !== 1 ? 's' : ''}
                    </p>

                    {album.visibility === 'private' && album.access_code && (
                        <button
                            onClick={handleCopyCode}
                            className="text-xs text-accent hover:text-accent-light flex items-center gap-1"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3" strokeWidth={2} />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" strokeWidth={2} />
                                    Code
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
}

// Access Code Success Modal
function AccessCodeModal({
    album,
    onClose,
}: {
    album: CreatedAlbum | null;
    onClose: () => void;
}) {
    const [copied, setCopied] = useState(false);

    if (!album) return null;

    const handleCopy = () => {
        if (album.access_code) {
            navigator.clipboard.writeText(album.access_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Modal isOpen={!!album} onClose={onClose} title="Album Created!">
            <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Key className="w-8 h-8 text-purple-400" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-semibold text-text-primary mb-2">
                    "{album.name}" Created
                </h3>

                <p className="text-sm text-text-muted mb-6">
                    Share this access code with people you want to give access to this private album:
                </p>

                <div className="bg-surface-elevated border border-border rounded-xl p-4 mb-6">
                    <p className="text-xs text-text-muted mb-2">Access Code</p>
                    <p className="text-2xl font-mono font-bold text-accent tracking-widest">
                        {album.access_code}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1">
                        Close
                    </Button>
                    <Button onClick={handleCopy} className="flex-1">
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" strokeWidth={2} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" strokeWidth={2} />
                                Copy Code
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// Create Album Modal Component
function CreateAlbumModal({
    isOpen,
    onClose,
    onCreate,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string, visibility: AlbumVisibility) => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<AlbumVisibility>('private');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsCreating(true);
        await onCreate(name, description, visibility);
        setIsCreating(false);
        setName('');
        setDescription('');
        setVisibility('private');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Album">
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <Input
                    label="Album Name"
                    placeholder="My Vacation Photos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                        Description (optional)
                    </label>
                    <textarea
                        placeholder="Add a description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                        Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setVisibility('private')}
                            className={`p-4 rounded-xl border text-left transition-all ${visibility === 'private'
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-border hover:border-border-light'
                                }`}
                        >
                            <Lock className={`w-5 h-5 mb-2 ${visibility === 'private' ? 'text-purple-400' : 'text-text-muted'}`} strokeWidth={2} />
                            <p className={`font-medium ${visibility === 'private' ? 'text-purple-400' : 'text-text-primary'}`}>Private</p>
                            <p className="text-xs text-text-muted mt-1">Access code auto-generated</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setVisibility('public')}
                            className={`p-4 rounded-xl border text-left transition-all ${visibility === 'public'
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-border hover:border-border-light'
                                }`}
                        >
                            <Globe className={`w-5 h-5 mb-2 ${visibility === 'public' ? 'text-green-400' : 'text-text-muted'}`} strokeWidth={2} />
                            <p className={`font-medium ${visibility === 'public' ? 'text-green-400' : 'text-text-primary'}`}>Public</p>
                            <p className="text-xs text-text-muted mt-1">Visible to everyone</p>
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isCreating} className="flex-1">
                        {isCreating ? (
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                        ) : (
                            <>
                                <Plus className="w-4 h-4" strokeWidth={2} />
                                Create Album
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
