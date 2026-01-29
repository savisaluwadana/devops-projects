import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            'flex h-11 w-full rounded-lg border border-input bg-background/50 px-4 py-2 text-sm transition-all duration-200',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            'backdrop-blur-sm',
                            icon && 'pl-10',
                            error && 'border-destructive focus:ring-destructive/50',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-destructive">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
