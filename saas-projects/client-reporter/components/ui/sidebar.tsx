'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    FileText,
    Layout,
    Link2,
    Settings,
    ChevronLeft,
    LogOut,
    Menu,
    X,
    BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from './avatar';

interface SidebarItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        label: 'Clients',
        href: '/dashboard/clients',
        icon: <Users className="h-5 w-5" />,
    },
    {
        label: 'Reports',
        href: '/dashboard/reports',
        icon: <FileText className="h-5 w-5" />,
    },
    {
        label: 'Templates',
        href: '/dashboard/templates',
        icon: <Layout className="h-5 w-5" />,
    },
    {
        label: 'Integrations',
        href: '/dashboard/integrations',
        icon: <Link2 className="h-5 w-5" />,
    },
    {
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: <BarChart3 className="h-5 w-5" />,
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: <Settings className="h-5 w-5" />,
    },
];

interface SidebarProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-lg font-bold gradient-text"
                        >
                            ClientReporter
                        </motion.span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            isActive(item.href)
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                    >
                        <span
                            className={cn(
                                'transition-colors',
                                isActive(item.href) && 'text-primary'
                            )}
                        >
                            {item.icon}
                        </span>
                        {!isCollapsed && <span>{item.label}</span>}
                        {isActive(item.href) && !isCollapsed && (
                            <motion.div
                                layoutId="activeIndicator"
                                className="ml-auto h-2 w-2 rounded-full bg-primary"
                            />
                        )}
                    </Link>
                ))}
            </nav>

            {/* User section */}
            <div className="border-t border-border p-3">
                <div
                    className={cn(
                        'flex items-center gap-3 rounded-xl p-2',
                        isCollapsed && 'justify-center'
                    )}
                >
                    <Avatar src={user?.image} name={user?.name} size="md" />
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-foreground">
                                {user?.name || 'User'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse button (desktop) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex items-center justify-center border-t border-border p-3 text-muted-foreground hover:text-foreground transition-colors"
            >
                <ChevronLeft
                    className={cn(
                        'h-5 w-5 transition-transform',
                        isCollapsed && 'rotate-180'
                    )}
                />
            </button>
        </div>
    );

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed left-4 top-4 z-40 rounded-xl bg-card border border-border p-2.5 shadow-lg lg:hidden"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 z-50 h-full w-[280px] border-r border-border bg-card lg:hidden"
                        >
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-accent"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-30 hidden h-full border-r border-border bg-card transition-all duration-300 lg:block',
                    isCollapsed ? 'w-[80px]' : 'w-[260px]'
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}

export default Sidebar;
