'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { ...toast, id }]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const icons = {
    success: <Check className="h-5 w-5" />,
    error: <X className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
};

const iconColors = {
    success: 'text-emerald-500 bg-emerald-500/10',
    error: 'text-red-500 bg-red-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    info: 'text-blue-500 bg-blue-500/10',
};

function ToastContainer({
    toasts,
    removeToast,
}: {
    toasts: Toast[];
    removeToast: (id: string) => void;
}) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={cn(
                            'flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg',
                            'min-w-[320px] max-w-[420px]'
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                iconColors[toast.type]
                            )}
                        >
                            {icons[toast.type]}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">{toast.title}</p>
                            {toast.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {toast.description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default ToastProvider;
