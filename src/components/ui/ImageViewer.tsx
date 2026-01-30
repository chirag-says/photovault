/**
 * ===========================================
 * PHOTOVAULT - Image Viewer Component
 * ===========================================
 * Premium viewer with device mockups
 * Portrait → iPhone | Landscape → iPad
 */

'use client';

// Force recompile
import React, { useState, useEffect } from 'react';
import { X, Trash2, Download, ChevronLeft, ChevronRight, Loader2, Tablet, Smartphone } from 'lucide-react';
import type { ImageWithUrls } from '@/lib/types';

interface ImageViewerProps {
    image: ImageWithUrls | null;
    onClose: () => void;
    onDelete?: (imageId: string) => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
}

export function ImageViewer({
    image,
    onClose,
    onDelete,
    onPrevious,
    onNext,
    hasPrevious = false,
    hasNext = false,
}: ImageViewerProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [showActions, setShowActions] = useState(true);

    useEffect(() => {
        setIsLoaded(false);
    }, [image?.id]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!image) return;

            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    if (hasPrevious && onPrevious) onPrevious();
                    break;
                case 'ArrowRight':
                    if (hasNext && onNext) onNext();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [image, onClose, onPrevious, onNext, hasPrevious, hasNext]);

    if (!image) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Determine if portrait or landscape
    const isPortrait = image.height && image.width ? image.height > image.width : false;

    return (
        <div
            className="fixed inset-0 bg-black z-50 flex flex-col"
            onClick={() => setShowActions((prev) => !prev)}
        >
            {/* Header */}
            <div
                className={`
                    absolute top-0 left-0 right-0 p-4 z-20 
                    bg-black/90 backdrop-blur-sm border-b border-white/10
                    transition-opacity duration-300 
                    ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
            >
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    {/* Close button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
                        aria-label="Close viewer"
                    >
                        <X className="w-5 h-5" strokeWidth={2} />
                    </button>

                    {/* Image info */}
                    <div className="text-center flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isPortrait ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                            {isPortrait ? (
                                <Smartphone className="w-4 h-4 text-blue-400" strokeWidth={2} />
                            ) : (
                                <Tablet className="w-4 h-4 text-purple-400" strokeWidth={2} />
                            )}
                        </div>
                        <div>
                            <p className="text-text-primary font-medium text-sm truncate max-w-xs sm:max-w-md">
                                {image.original_filename}
                            </p>
                            <p className="text-text-muted text-xs">{formatDate(image.created_at)}</p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                        {/* Download button */}
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    const response = await fetch(image.full_url);
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = image.original_filename || 'photo.webp';
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                } catch (err) {
                                    console.error('Download failed:', err);
                                }
                            }}
                            className="p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-white/5"
                            aria-label="Download image"
                        >
                            <Download className="w-5 h-5" strokeWidth={2} />
                        </button>

                        {/* Delete button */}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this image?')) {
                                        onDelete(image.id);
                                    }
                                }}
                                className="p-2 text-text-secondary hover:text-error transition-colors rounded-lg hover:bg-white/5"
                                aria-label="Delete image"
                            >
                                <Trash2 className="w-5 h-5" strokeWidth={2} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation arrows */}
            {hasPrevious && onPrevious && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrevious();
                    }}
                    className={`
                        absolute left-4 top-1/2 -translate-y-1/2 z-20 
                        p-3 bg-surface/80 hover:bg-surface text-text-secondary hover:text-text-primary
                        rounded-full transition-all border border-border
                        ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                    aria-label="Previous image"
                >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                </button>
            )}

            {hasNext && onNext && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    className={`
                        absolute right-4 top-1/2 -translate-y-1/2 z-20 
                        p-3 bg-surface/80 hover:bg-surface text-text-secondary hover:text-text-primary
                        rounded-full transition-all border border-border
                        ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                    aria-label="Next image"
                >
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </button>
            )}

            {/* Image container with device mockup */}
            <div className="flex-1 flex items-center justify-center p-8">
                {/* Loading spinner */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" strokeWidth={2} />
                    </div>
                )}

                {/* Device Mockup */}
                <div
                    className={`relative transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isPortrait ? (
                        <IPhoneMockup>
                            <img
                                src={image.full_url}
                                alt={image.original_filename || 'Full size image'}
                                onLoad={() => setIsLoaded(true)}
                                className="w-full h-full object-cover"
                            />
                        </IPhoneMockup>
                    ) : (
                        <IPadMockup>
                            <img
                                src={image.full_url}
                                alt={image.original_filename || 'Full size image'}
                                onLoad={() => setIsLoaded(true)}
                                className="w-full h-full object-cover"
                            />
                        </IPadMockup>
                    )}
                </div>
            </div>

            {/* Footer info */}
            <div
                className={`
                    absolute bottom-0 left-0 right-0 p-4 z-20 
                    bg-gradient-to-t from-black to-transparent 
                    transition-opacity duration-300 
                    ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
            >
                <div className="flex items-center justify-center gap-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${isPortrait ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {isPortrait ? 'Portrait' : 'Landscape'}
                    </span>
                    {image.width && image.height && (
                        <span className="text-text-muted text-xs">{image.width} × {image.height}</span>
                    )}
                    {image.file_size_full && (
                        <span className="text-text-muted text-xs">{(image.file_size_full / 1024).toFixed(0)} KB</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// iPhone Mockup Component
function IPhoneMockup({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {/* iPhone Frame */}
            <div className="relative w-[280px] sm:w-[320px] md:w-[360px]">
                {/* Outer frame */}
                <div className="relative bg-[#1a1a1a] rounded-[3rem] p-[3px] shadow-2xl shadow-black/50">
                    {/* Inner bezel */}
                    <div className="relative bg-[#0a0a0a] rounded-[2.8rem] p-2">
                        {/* Side buttons */}
                        <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-[#2a2a2a] rounded-l-sm" />
                        <div className="absolute -left-[3px] top-36 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
                        <div className="absolute -left-[3px] top-52 w-[3px] h-12 bg-[#2a2a2a] rounded-l-sm" />
                        <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-[#2a2a2a] rounded-r-sm" />

                        {/* Screen container */}
                        <div className="relative bg-black rounded-[2.4rem] overflow-hidden">
                            {/* Dynamic Island */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                                <div className="w-[90px] h-[28px] bg-black rounded-full flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                                </div>
                            </div>

                            {/* Screen content */}
                            <div className="aspect-[9/19.5] overflow-hidden">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// iPad Mockup Component
function IPadMockup({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {/* iPad Frame */}
            <div className="relative w-[90vw] max-w-[900px]">
                {/* Outer frame */}
                <div className="relative bg-[#1c1c1c] rounded-[2rem] p-[3px] shadow-2xl shadow-black/60">
                    {/* Inner bezel */}
                    <div className="relative bg-[#0a0a0a] rounded-[1.8rem] p-4">
                        {/* Power button */}
                        <div className="absolute -right-[2px] top-12 w-[2px] h-10 bg-[#2a2a2a] rounded-r-sm" />

                        {/* Volume buttons */}
                        <div className="absolute top-12 -left-[2px] w-[2px] h-10 bg-[#2a2a2a] rounded-l-sm" />
                        <div className="absolute top-24 -left-[2px] w-[2px] h-10 bg-[#2a2a2a] rounded-l-sm" />

                        {/* Camera */}
                        <div className="absolute bg-[#1c1c1c] w-1.5 h-1.5 rounded-full top-1/2 left-2 -translate-y-1/2 z-10" />

                        {/* Screen container */}
                        <div className="relative bg-black rounded-[1.4rem] overflow-hidden shadow-inner">
                            {/* Screen content - 4:3 Aspect Ratio */}
                            <div className="aspect-[4/3] overflow-hidden w-full h-full relative">
                                {children}

                                {/* Home Indicator */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-40 h-1.5 bg-white/40 rounded-full backdrop-blur-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImageViewer;
