/**
 * ===========================================
 * PHOTOVAULT - Image Card Component
 * ===========================================
 * Grid image card with skeleton loading
 */

'use client';

import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { ImageWithUrls } from '@/lib/types';

interface ImageCardProps {
    image: ImageWithUrls;
    onClick: (image: ImageWithUrls) => void;
}

export function ImageCard({ image, onClick }: ImageCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div
            className="image-card group"
            onClick={() => onClick(image)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick(image)}
            aria-label={`View ${image.original_filename || 'image'}`}
        >
            {/* Skeleton loader */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 skeleton" />
            )}

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface">
                    <ImageOff className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
                </div>
            )}

            {/* Preview image */}
            <img
                src={image.preview_url}
                alt={image.original_filename || 'Photo'}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2.5">
                <span className="text-[11px] text-white/90 truncate font-medium">
                    {image.original_filename}
                </span>
            </div>
        </div>
    );
}

// Skeleton version for loading state
export function ImageCardSkeleton() {
    return <div className="skeleton-card" />;
}

export default ImageCard;
