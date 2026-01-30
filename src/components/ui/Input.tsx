/**
 * ===========================================
 * PHOTOVAULT - Input Component
 * ===========================================
 * Premium form input with gold accent
 */

'use client';

import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="input-label" htmlFor={props.id}>
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            input-field
                            ${icon ? 'pl-10' : ''}
                            ${error ? 'border-error focus:border-error focus:shadow-none' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-error">
                        <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
