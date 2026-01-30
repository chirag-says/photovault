/**
 * ===========================================
 * PHOTOVAULT - Gallery Page
 * ===========================================
 * Photo gallery with skeleton loading
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Image as ImageIcon, ChevronDown, Loader2 } from 'lucide-react';
import { ImageCard, ImageViewer } from '@/components/ui';
import type { ImageWithUrls } from '@/lib/types';

// Skeleton Components
function ImageCardSkeleton() {
    return <div className="skeleton-card" />;
}

function HeaderSkeleton() {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <div className="skeleton-heading w-48 mb-2" />
                <div className="skeleton-text w-32" />
            </div>
            <div className="skeleton-button w-28" />
        </div>
    );
}

export default function GalleryPage() {
    const [images, setImages] = useState<ImageWithUrls[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<ImageWithUrls | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const fetchImages = useCallback(async (pageNum: number, append: boolean = false) => {
        try {
            if (pageNum === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const response = await fetch(`/api/images?page=${pageNum}&limit=24`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch images');
            }

            if (append) {
                setImages((prev) => [...prev, ...data.data]);
            } else {
                setImages(data.data);
            }
            setHasMore(data.hasMore);
        } catch (_err) {
            setError(_err instanceof Error ? _err.message : 'Failed to load images');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchImages(1);
    }, [fetchImages]);

    const handleLoadMore = () => {
        if (!hasMore || isLoadingMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchImages(nextPage, true);
    };

    const handleImageClick = (image: ImageWithUrls) => {
        setSelectedImage(image);
    };

    const handleDelete = async (imageId: string) => {
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            setImages((prev) => prev.filter((img) => img.id !== imageId));
            setSelectedImage(null);
        } catch {
            alert('Failed to delete image. Please try again.');
        }
    };

    const currentIndex = selectedImage ? images.findIndex((img) => img.id === selectedImage.id) : -1;
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setSelectedImage(images[currentIndex - 1]);
        }
    };
    const handleNext = () => {
        if (currentIndex < images.length - 1) {
            setSelectedImage(images[currentIndex + 1]);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            {isLoading ? (
                <HeaderSkeleton />
            ) : (
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-text-primary">Your Photos</h1>
                        <p className="text-sm text-text-tertiary mt-1">
                            <span className="text-accent font-medium">{images.length}</span> photos in your vault
                        </p>
                    </div>

                    <Link href="/upload" className="btn-primary">
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Upload
                    </Link>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-center mb-6">
                    <p className="text-sm text-error">{error}</p>
                    <button
                        onClick={() => fetchImages(1)}
                        className="mt-3 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="image-grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <ImageCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && images.length === 0 && (
                <div className="card-elevated p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-surface-elevated flex items-center justify-center">
                        <ImageIcon className="w-7 h-7 text-text-muted" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary mb-2">No photos yet</h2>
                    <p className="text-sm text-text-tertiary mb-6 max-w-xs mx-auto">
                        Start building your vault by uploading your first photos
                    </p>
                    <Link href="/upload" className="btn-primary">
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Upload Photos
                    </Link>
                </div>
            )}

            {/* Image Grid */}
            {!isLoading && images.length > 0 && (
                <>
                    <div className="image-grid">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
                            >
                                <ImageCard
                                    image={image}
                                    onClick={handleImageClick}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="text-center mt-10">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="btn-ghost"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" strokeWidth={2} />
                                        Load More
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Image Viewer Modal */}
            <ImageViewer
                image={selectedImage}
                onClose={() => setSelectedImage(null)}
                onDelete={handleDelete}
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={currentIndex > 0}
                hasNext={currentIndex < images.length - 1}
            />
        </div>
    );
}
