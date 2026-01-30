/**
 * ===========================================
 * PHOTOVAULT - Public Album View Page
 * ===========================================
 * View a public or private album (with code)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Globe, Image as ImageIcon, Loader2, User } from 'lucide-react';
import { ImageCard, ImageViewer } from '@/components/ui';
import type { AlbumWithImages, ImageWithUrls } from '@/lib/types';

export default function PublicAlbumViewPage() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const accessCode = searchParams.get('code');

    const [album, setAlbum] = useState<AlbumWithImages | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<ImageWithUrls | null>(null);

    useEffect(() => {
        if (id) {
            fetchAlbum();
        }
    }, [id, accessCode]);

    const fetchAlbum = async () => {
        try {
            const url = accessCode
                ? `/api/albums/${id}?code=${accessCode}`
                : `/api/albums/${id}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setAlbum(data.data);
            } else {
                setError(data.error || 'Album not found');
            }
        } catch {
            setError('Failed to load album');
        } finally {
            setIsLoading(false);
        }
    };

    const currentImageIndex = album?.images.findIndex(img => img.id === selectedImage?.id) ?? -1;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" strokeWidth={2} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                        <Lock className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">{error}</h3>
                    <Link href="/public/albums" className="text-accent hover:underline">
                        ← Back to public albums
                    </Link>
                </div>
            </div>
        );
    }

    if (!album) return null;

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link
                        href="/public/albums"
                        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                        Back to Albums
                    </Link>
                </div>
            </header>

            {/* Album Header */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center gap-4 mb-6">
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
                        <h1 className="text-2xl font-bold text-text-primary">{album.name}</h1>
                        <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                            <span>{album.image_count} photo{album.image_count !== 1 ? 's' : ''}</span>
                            {(album as any).created_by && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5" strokeWidth={2} />
                                        {(album as any).created_by}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {album.description && (
                    <p className="text-text-secondary mb-8">{album.description}</p>
                )}

                {/* Images Grid */}
                {album.images.length === 0 ? (
                    <div className="text-center py-20 bg-surface border border-border rounded-xl">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-medium text-text-primary mb-2">No photos yet</h3>
                        <p className="text-text-muted">This album is empty</p>
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
            </div>

            {/* Image Viewer */}
            {selectedImage && (
                <ImageViewer
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onPrevious={currentImageIndex > 0
                        ? () => setSelectedImage(album.images[currentImageIndex - 1])
                        : undefined
                    }
                    onNext={currentImageIndex < album.images.length - 1
                        ? () => setSelectedImage(album.images[currentImageIndex + 1])
                        : undefined
                    }
                    hasPrevious={currentImageIndex > 0}
                    hasNext={currentImageIndex < album.images.length - 1}
                />
            )}
        </div>
    );
}
