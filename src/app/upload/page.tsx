/**
 * ===========================================
 * PHOTOVAULT - Upload Page
 * ===========================================
 * Premium upload with skeleton loading
 */

'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Upload,
    Shield,
    Zap,
    Image as ImageIcon,
    Clock,
    Check,
    X,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { UploadDropzone } from '@/components/ui';

interface UploadProgress {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
}

export default function UploadPage() {
    const [uploads, setUploads] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        const initialProgress: UploadProgress[] = files.map((file) => ({
            file,
            status: 'pending',
            progress: 0,
        }));

        setUploads((prev) => [...prev, ...initialProgress]);
        setIsUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const uploadIndex = uploads.length + i;

            setUploads((prev) => {
                const updated = [...prev];
                if (updated[uploadIndex]) {
                    updated[uploadIndex] = { ...updated[uploadIndex], status: 'uploading', progress: 50 };
                }
                return updated;
            });

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/images', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Upload failed');
                }

                setUploads((prev) => {
                    const updated = [...prev];
                    const idx = updated.findIndex((u) => u.file === file);
                    if (idx !== -1) {
                        updated[idx] = { ...updated[idx], status: 'success', progress: 100 };
                    }
                    return updated;
                });
            } catch (err) {
                setUploads((prev) => {
                    const updated = [...prev];
                    const idx = updated.findIndex((u) => u.file === file);
                    if (idx !== -1) {
                        updated[idx] = {
                            ...updated[idx],
                            status: 'error',
                            progress: 0,
                            error: err instanceof Error ? err.message : 'Upload failed',
                        };
                    }
                    return updated;
                });
            }
        }

        setIsUploading(false);
    }, [uploads.length]);

    const clearCompleted = () => {
        setUploads((prev) => prev.filter((u) => u.status !== 'success'));
    };

    const clearAll = () => {
        setUploads([]);
    };

    const successCount = uploads.filter((u) => u.status === 'success').length;
    const errorCount = uploads.filter((u) => u.status === 'error').length;
    const pendingCount = uploads.filter((u) => u.status === 'pending' || u.status === 'uploading').length;

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-text-primary">Upload Photos</h1>
                <p className="text-sm text-text-tertiary mt-1">
                    Add new photos to your vault. They&apos;ll be encrypted and compressed automatically.
                </p>
            </div>

            {/* Upload Dropzone */}
            <UploadDropzone
                onFilesSelected={handleFilesSelected}
                isUploading={isUploading}
                multiple={true}
                maxFiles={10}
            />

            {/* Upload Queue */}
            {uploads.length > 0 && (
                <div className="mt-6 card-elevated overflow-hidden">
                    {/* Queue Header */}
                    <div className="p-4 flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-text-primary font-medium">
                                {uploads.length} file{uploads.length !== 1 ? 's' : ''}
                            </span>
                            {successCount > 0 && (
                                <span className="badge-success">{successCount} uploaded</span>
                            )}
                            {errorCount > 0 && (
                                <span className="badge-error">{errorCount} failed</span>
                            )}
                            {pendingCount > 0 && (
                                <span className="badge-neutral">{pendingCount} pending</span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {successCount > 0 && (
                                <button
                                    onClick={clearCompleted}
                                    className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                                >
                                    Clear completed
                                </button>
                            )}
                            {errorCount > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-error hover:text-error/80 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Upload Items */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                        {uploads.map((upload, index) => (
                            <UploadItem key={`${upload.file.name}-${index}`} upload={upload} />
                        ))}
                    </div>
                </div>
            )}

            {/* Success Message */}
            {successCount > 0 && !isUploading && (
                <div className="mt-6 p-6 bg-success/5 border border-success/20 rounded-xl text-center animate-fade-in">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-success/10 flex items-center justify-center">
                        <Check className="w-6 h-6 text-success" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-1">
                        {successCount} photo{successCount !== 1 ? 's' : ''} uploaded
                    </h3>
                    <p className="text-xs text-text-tertiary mb-4">
                        Your photos are now securely stored.
                    </p>
                    <Link href="/gallery" className="btn-primary">
                        View Gallery
                        <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </Link>
                </div>
            )}

            {/* Info Cards */}
            <div className="mt-8 grid sm:grid-cols-3 gap-3">
                <InfoCard
                    icon={<Shield className="w-4 h-4" strokeWidth={2} />}
                    title="Privacy First"
                    description="EXIF data is automatically stripped"
                />
                <InfoCard
                    icon={<Zap className="w-4 h-4" strokeWidth={2} />}
                    title="Auto Compression"
                    description="Smart compression saves space"
                />
                <InfoCard
                    icon={<ImageIcon className="w-4 h-4" strokeWidth={2} />}
                    title="Quick Previews"
                    description="Optimized thumbnails for speed"
                />
            </div>
        </div>
    );
}

function UploadItem({ upload }: { upload: UploadProgress }) {
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="p-3 flex items-center gap-3">
            {/* Status Icon */}
            <div className="shrink-0">
                {upload.status === 'pending' && (
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                        <Clock className="w-4 h-4 text-text-muted" strokeWidth={2} />
                    </div>
                )}
                {upload.status === 'uploading' && (
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-accent animate-spin" strokeWidth={2} />
                    </div>
                )}
                {upload.status === 'success' && (
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-success" strokeWidth={2} />
                    </div>
                )}
                {upload.status === 'error' && (
                    <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
                        <X className="w-4 h-4 text-error" strokeWidth={2} />
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{upload.file.name}</p>
                <p className="text-xs text-text-muted">
                    {formatFileSize(upload.file.size)}
                    {upload.error && <span className="text-error ml-2">• {upload.error}</span>}
                </p>
            </div>

            {/* Progress Bar */}
            {upload.status === 'uploading' && (
                <div className="w-20">
                    <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-4 bg-surface border border-border rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-3 text-accent">
                {icon}
            </div>
            <h4 className="text-sm font-medium text-text-primary mb-0.5">{title}</h4>
            <p className="text-xs text-text-muted">{description}</p>
        </div>
    );
}
