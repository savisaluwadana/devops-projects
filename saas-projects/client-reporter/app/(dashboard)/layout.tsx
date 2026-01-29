'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar user={session?.user} />

            <main
                className={cn(
                    'min-h-screen transition-all duration-300',
                    'lg:pl-[260px]',
                    sidebarCollapsed && 'lg:pl-[80px]'
                )}
            >
                {/* Top Header */}
                <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
                    <div className="flex h-full items-center justify-between px-4 lg:px-8">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-semibold text-foreground">
                                {getPageTitle(pathname)}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Add notifications, search, etc. here */}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function getPageTitle(pathname: string): string {
    const titles: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/dashboard/clients': 'Clients',
        '/dashboard/reports': 'Reports',
        '/dashboard/templates': 'Templates',
        '/dashboard/integrations': 'Integrations',
        '/dashboard/analytics': 'Analytics',
        '/dashboard/settings': 'Settings',
    };
    return titles[pathname] || 'Dashboard';
}
