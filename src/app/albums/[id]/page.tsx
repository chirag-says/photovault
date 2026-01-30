/**
 * ===========================================
 * PHOTOVAULT - Single Album View Page
 * ===========================================
 * View and manage album contents
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Lock,
    Globe,
    Plus,
    Trash2,
    Settings,
    Copy,
    Check,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { Button, Modal, ImageCard, ImageViewer } from '@/components/ui';
import type { AlbumWithImages, ImageWithUrls } from '@/lib/types';

export default function AlbumViewPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [album, setAlbum] = useState<AlbumWithImages | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<ImageWithUrls | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchAlbum();
        }
    }, [id]);

    const fetchAlbum = async () => {
        try {
            const response = await fetch(`/api/albums/${id}`);
            const data = await response.json();

            if (data.success) {
                setAlbum(data.data);
                setIsOwner(data.data.isOwner);
            } else {
                setError(data.error || 'Album not found');
            }
        } catch (err) {
            console.error('Error fetching album:', err);
            setError('Failed to load album');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = async (imageId: string) => {
        if (!confirm('Remove this image from the album?')) return;

        try {
            const response = await fetch(`/api/albums/${id}/images?imageId=${imageId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAlbum(prev => prev ? {
                    ...prev,
                    images: prev.images.filter(img => img.id !== imageId),
                    image_count: prev.image_count - 1,
                } : null);
                setSelectedImage(null);
            }
        } catch (error) {
            console.error('Error removing image:', error);
        }
    };

    const handleCopyCode = () => {
        if (album?.access_code) {
            navigator.clipboard.writeText(album.access_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const currentImageIndex = album?.images.findIndex(img => img.id === selectedImage?.id) ?? -1;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="skeleton-heading w-48" />
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton aspect-square rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !album) {
        return (
            <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
                </div>
                <p className="text-text-muted mb-4">{error || 'Album not found'}</p>
                <Link href="/albums">
                    <Button variant="ghost">
                        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                        Back to Albums
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <Link
                    href="/albums"
                    className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                    Back to Albums
                </Link>
            </div>

            {/* Album Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface border border-border rounded-xl">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${album.visibility === 'public'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-purple-500/10 text-purple-400'
                        }`}>
                        {album.visibility === 'public' ? (
                            <Globe className="w-6 h-6" strokeWidth={1.5} />
                        ) : (
                            <Lock className="w-6 h-6" strokeWidth={1.5} />
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">{album.name}</h1>
                        <p className="text-sm text-text-muted">
                            {album.image_count} photo{album.image_count !== 1 ? 's' : ''} · {album.visibility}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Access Code for Private Albums */}
                    {album.visibility === 'private' && album.access_code && isOwner && (
                        <button
                            onClick={handleCopyCode}
                            className="flex items-center gap-2 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-sm hover:border-accent/30 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-success" strokeWidth={2} />
                                    <span className="text-success">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 text-text-muted" strokeWidth={2} />
                                    <code className="text-accent font-mono">{album.access_code}</code>
                                </>
                            )}
                        </button>
                    )}

                    {isOwner && (
                        <>
                            <Button onClick={() => setShowAddModal(true)} size="sm">
                                <Plus className="w-4 h-4" strokeWidth={2} />
                                Add Photos
                            </Button>
                            <Link href={`/albums/${id}/edit`}>
                                <Button variant="ghost" size="sm">
                                    <Settings className="w-4 h-4" strokeWidth={2} />
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Description */}
            {album.description && (
                <p className="text-text-secondary">{album.description}</p>
            )}

            {/* Images Grid */}
            {album.images.length === 0 ? (
                <div className="text-center py-20 bg-surface border border-border rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">No photos yet</h3>
                    <p className="text-text-muted mb-6">Add some photos to this album</p>
                    {isOwner && (
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus className="w-4 h-4" strokeWidth={2} />
                            Add Photos
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {album.images.map((image) => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            onClick={setSelectedImage}
                        />
                    ))}
                </div>
            )}

            {/* Image Viewer */}
            {selectedImage && (
                <ImageViewer
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onDelete={isOwner ? (imageId) => handleRemoveImage(imageId) : undefined}
                    onPrevious={currentImageIndex > 0 ? () => setSelectedImage(album.images[currentImageIndex - 1]) : undefined}
                    onNext={currentImageIndex < album.images.length - 1 ? () => setSelectedImage(album.images[currentImageIndex + 1]) : undefined}
                    hasPrevious={currentImageIndex > 0}
                    hasNext={currentImageIndex < album.images.length - 1}
                />
            )}

            {/* Add Photos Modal */}
            <AddPhotosModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                albumId={id}
                currentImageIds={album.images.map(img => img.id)}
                onAdd={fetchAlbum}
            />
        </div>
    );
}

// Add Photos Modal
function AddPhotosModal({
    isOpen,
    onClose,
    albumId,
    currentImageIds,
    onAdd,
}: {
    isOpen: boolean;
    onClose: () => void;
    albumId: string;
    currentImageIds: string[];
    onAdd: () => void;
}) {
    const [userImages, setUserImages] = useState<ImageWithUrls[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUserImages();
        }
    }, [isOpen]);

    const fetchUserImages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/images?page=1&limit=100');
            const data = await response.json();
            if (data.success) {
                // Filter out images already in album
                const available = data.data.filter(
                    (img: ImageWithUrls) => !currentImageIds.includes(img.id)
                );
                setUserImages(available);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleImage = (imageId: string) => {
        setSelectedIds(prev =>
            prev.includes(imageId)
                ? prev.filter(id => id !== imageId)
                : [...prev, imageId]
        );
    };

    const handleAdd = async () => {
        if (selectedIds.length === 0) return;

        setIsAdding(true);
        try {
            const response = await fetch(`/api/albums/${albumId}/images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageIds: selectedIds }),
            });

            if (response.ok) {
                onAdd();
                onClose();
                setSelectedIds([]);
            }
        } catch (error) {
            console.error('Error adding images:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Photos to Album" size="lg">
            <div className="p-5">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" strokeWidth={2} />
                    </div>
                ) : userImages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-text-muted">No more photos to add</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-text-muted mb-4">
                            Select photos to add ({selectedIds.length} selected)
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
                            {userImages.map((image) => (
                                <button
                                    key={image.id}
                                    onClick={() => toggleImage(image.id)}
                                    className={`relative aspect-square rounded-lg overflow-hidden ${selectedIds.includes(image.id)
                                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-black'
                                        : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={image.preview_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedIds.includes(image.id) && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-5">
                            <Button variant="ghost" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdd}
                                isLoading={isAdding}
                                disabled={selectedIds.length === 0}
                                className="flex-1"
                            >
                                Add {selectedIds.length} Photo{selectedIds.length !== 1 ? 's' : ''}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
