'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
    title: string;
    href?: string;
    icon?: string;
    children?: NavItem[];
}

const navigation: NavItem[] = [
    {
        title: 'Getting Started',
        icon: '🚀',
        children: [
            { title: 'Overview', href: '/' },
            { title: 'Roadmap', href: '/roadmap' },
        ],
    },
    {
        title: 'Guides',
        icon: '📚',
        children: [
            { title: 'All Guides', href: '/guides' },
            { title: 'Linux', href: '/guides/linux' },
            { title: 'Docker', href: '/guides/docker' },
            { title: 'Git', href: '/guides/git' },
            { title: 'Kubernetes', href: '/guides/kubernetes' },
            { title: 'Terraform', href: '/guides/terraform' },
            { title: 'Ansible', href: '/guides/ansible' },
            { title: 'ArgoCD', href: '/guides/argocd' },
            { title: 'CircleCI', href: '/guides/circleci' },
            { title: 'Argo Workflows', href: '/guides/argo_workflows' },
        ],
    },
    {
        title: 'Projects',
        icon: '💻',
        children: [
            { title: 'All Projects', href: '/projects' },
            { title: 'Beginner', href: '/projects?level=beginner' },
            { title: 'Intermediate', href: '/projects?level=intermediate' },
            { title: 'Advanced', href: '/projects?level=advanced' },
            { title: 'Platform Engineering', href: '/projects?level=platform' },
        ],
    },
];

function NavSection({ item, isOpen, onToggle }: { item: NavItem; isOpen: boolean; onToggle: () => void }) {
    const pathname = usePathname();

    return (
        <div className="mb-4">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
                <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {isOpen && item.children && (
                <div className="mt-1 ml-4 pl-4 border-l border-border">
                    {item.children.map((child) => (
                        <Link
                            key={child.href}
                            href={child.href || '#'}
                            className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${pathname === child.href
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted hover:text-foreground hover:bg-secondary'
                                }`}
                        >
                            {child.title}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'Getting Started': true,
        Guides: true,
        Projects: true,
    });

    const toggleSection = (title: string) => {
        setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-72 bg-sidebar-bg border-r border-sidebar-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        <span className="font-bold text-lg gradient-text">DevOps Hub</span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden p-2 hover:bg-secondary rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
                    {navigation.map((item) => (
                        <NavSection
                            key={item.title}
                            item={item}
                            isOpen={openSections[item.title] || false}
                            onToggle={() => toggleSection(item.title)}
                        />
                    ))}

                    {/* Stats */}
                    <div className="mt-8 p-4 bg-secondary rounded-xl">
                        <h4 className="font-semibold text-sm mb-3">📊 Quick Stats</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted">Guides</span>
                                <span className="font-medium">9</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Projects</span>
                                <span className="font-medium">31+</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Lines of Docs</span>
                                <span className="font-medium">7,580+</span>
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}
