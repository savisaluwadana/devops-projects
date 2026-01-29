'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownItem {
    label: string;
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
}

interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    onSelect: (value: string) => void;
    align?: 'left' | 'right';
    className?: string;
}

export function Dropdown({
    trigger,
    items,
    onSelect,
    align = 'left',
    className,
}: DropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close on outside click
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={cn('relative', className)}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={cn(
                            'absolute z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl',
                            align === 'right' ? 'right-0' : 'left-0'
                        )}
                    >
                        {items.map((item, index) => (
                            <button
                                key={item.value}
                                onClick={() => {
                                    if (!item.disabled) {
                                        onSelect(item.value);
                                        setIsOpen(false);
                                    }
                                }}
                                disabled={item.disabled}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                    item.disabled
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'hover:bg-accent',
                                    item.danger && 'text-destructive hover:bg-destructive/10'
                                )}
                            >
                                {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                                {item.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Select variant for forms
interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    className?: string;
}

export function Select({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    label,
    error,
    className,
}: SelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);
    const selectedOption = options.find((opt) => opt.value === value);

    // Close on outside click
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-foreground mb-2">
                    {label}
                </label>
            )}
            <div ref={selectRef} className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background/50 px-4 py-2 text-sm transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                        'backdrop-blur-sm',
                        error && 'border-destructive',
                        !selectedOption && 'text-muted-foreground'
                    )}
                >
                    <span>{selectedOption?.label || placeholder}</span>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
                                        option.value === value && 'bg-accent text-accent-foreground'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
        </div>
    );
}

export default Dropdown;
