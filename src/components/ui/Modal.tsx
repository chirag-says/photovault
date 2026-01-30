/**
 * ===========================================
 * PHOTOVAULT - Modal Component
 * ===========================================
 * Premium modal with Lucide icons
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    children,
    title,
    size = 'md',
    showCloseButton = true,
}: ModalProps) {
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
    };

    const modal = (
        <div
            className="modal-overlay animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div
                className={`modal-content ${sizeClasses[size]} animate-fade-in-up`}
                onClick={(e) => e.stopPropagation()}
            >
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-5 border-b border-border">
                        {title && (
                            <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1.5 -mr-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" strokeWidth={2} />
                            </button>
                        )}
                    </div>
                )}
                <div>{children}</div>
            </div>
        </div>
    );

    if (typeof window !== 'undefined') {
        return createPortal(modal, document.body);
    }

    return null;
}

export default Modal;
