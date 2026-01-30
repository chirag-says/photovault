/**
 * ===========================================
 * PHOTOVAULT - Button Component
 * ===========================================
 * Premium button with gold accent
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'icon' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = `
        inline-flex items-center justify-center gap-2
        font-semibold tracking-tight
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none
        whitespace-nowrap flex-nowrap
    `;

    const variants = {
        primary: `
            text-black
            bg-gradient-to-br from-accent to-accent-muted
            hover:from-accent-light hover:to-accent
            hover:shadow-glow
            active:scale-[0.98]
            rounded-[10px]
        `,
        ghost: `
            text-text-secondary
            border border-border
            hover:text-text-primary hover:border-border/80 hover:bg-white/[0.02]
            active:scale-[0.98]
            rounded-[10px]
        `,
        icon: `
            text-text-tertiary
            border border-border
            hover:text-text-primary hover:border-border/80 hover:bg-white/[0.02]
            rounded-[10px]
        `,
        danger: `
            text-white
            bg-error hover:bg-error/90
            active:scale-[0.98]
            rounded-[10px]
        `,
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
}

export default Button;
