/**
 * ===========================================
 * PHOTOVAULT - Upload Dropzone Component
 * ===========================================
 * Premium drag and drop with Lucide icons
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface UploadDropzoneProps {
    onFilesSelected: (files: File[]) => void;
    isUploading?: boolean;
    multiple?: boolean;
    maxFiles?: number;
    acceptedTypes?: string[];
}

export function UploadDropzone({
    onFilesSelected,
    isUploading = false,
    multiple = true,
    maxFiles = 10,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
}: UploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFiles = useCallback(
        (files: FileList | File[]): File[] => {
            const fileArray = Array.from(files);
            const validFiles: File[] = [];
            const maxSize = 10 * 1024 * 1024;

            for (const file of fileArray) {
                if (!acceptedTypes.includes(file.type)) {
                    setError(`${file.name} is not a supported image type`);
                    continue;
                }

                if (file.size > maxSize) {
                    setError(`${file.name} exceeds the 10MB size limit`);
                    continue;
                }

                validFiles.push(file);

                if (validFiles.length >= maxFiles) break;
            }

            return validFiles;
        },
        [acceptedTypes, maxFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setError(null);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (isUploading) return;

            const files = validateFiles(e.dataTransfer.files);
            if (files.length > 0) {
                onFilesSelected(files);
            }
        },
        [isUploading, validateFiles, onFilesSelected]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files || isUploading) return;

            const files = validateFiles(e.target.files);
            if (files.length > 0) {
                onFilesSelected(files);
            }

            e.target.value = '';
        },
        [isUploading, validateFiles, onFilesSelected]
    );

    const handleClick = () => {
        if (!isUploading && inputRef.current) {
            inputRef.current.click();
        }
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                upload-zone
                ${isDragging ? 'active' : ''}
                ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}
            `}
        >
            <input
                ref={inputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                multiple={multiple}
                onChange={handleFileInput}
                className="hidden"
                disabled={isUploading}
            />

            {/* Icon */}
            <div className={`
                mb-4 p-3 rounded-xl transition-colors duration-200
                ${isDragging ? 'bg-accent/10' : 'bg-surface-elevated'}
            `}>
                {isUploading ? (
                    <Loader2 className="w-8 h-8 text-accent animate-spin" strokeWidth={1.5} />
                ) : (
                    <Upload
                        className={`w-8 h-8 transition-colors duration-200 ${isDragging ? 'text-accent' : 'text-text-muted'}`}
                        strokeWidth={1.5}
                    />
                )}
            </div>

            {/* Text */}
            <h3 className={`text-base font-semibold mb-1 transition-colors ${isDragging ? 'text-accent' : 'text-text-primary'}`}>
                {isUploading ? 'Uploading...' : isDragging ? 'Drop files here' : 'Upload Images'}
            </h3>
            <p className="text-sm text-text-tertiary mb-4">
                {isUploading ? 'Please wait...' : 'Drag and drop, or click to browse'}
            </p>

            {/* File types */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                {['JPG', 'PNG', 'WebP', 'GIF', 'HEIC'].map((type) => (
                    <span
                        key={type}
                        className="px-2 py-1 bg-surface-elevated border border-border rounded font-medium text-text-muted"
                    >
                        {type}
                    </span>
                ))}
                <span className="text-text-muted ml-1">• Max 10MB</span>
            </div>

            {/* Error */}
            {error && (
                <div className="mt-4 px-3 py-2 bg-error/10 border border-error/20 rounded-lg">
                    <p className="text-xs text-error">{error}</p>
                </div>
            )}
        </div>
    );
}

export default UploadDropzone;
