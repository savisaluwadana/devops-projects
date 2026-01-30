import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

const GUIDES_DIR = path.join(process.cwd(), '..', 'docs', 'guides');

const GUIDE_METADATA: Record<string, { title: string; icon: string; filename: string; description: string }> = {
    linux: {
        title: 'Linux',
        icon: '🐧',
        filename: 'LINUX_COMPLETE_GUIDE.md',
        description: 'Master Linux administration, commands, scripting, and system management.'
    },
    docker: {
        title: 'Docker',
        icon: '🐳',
        filename: 'DOCKER_COMPLETE_GUIDE.md',
        description: 'Learn containerization from basics to production-ready deployments.'
    },
    git: {
        title: 'Git',
        icon: '📦',
        filename: 'GIT_COMPLETE_GUIDE.md',
        description: 'Version control mastery for team collaboration and code management.'
    },
    kubernetes: {
        title: 'Kubernetes',
        icon: '☸️',
        filename: 'KUBERNETES_COMPLETE_GUIDE.md',
        description: 'Container orchestration at scale with Kubernetes.'
    },
    terraform: {
        title: 'Terraform',
        icon: '🏗️',
        filename: 'TERRAFORM_COMPLETE_GUIDE.md',
        description: 'Infrastructure as Code for cloud-native environments.'
    },
    ansible: {
        title: 'Ansible',
        icon: '⚙️',
        filename: 'ANSIBLE_COMPLETE_GUIDE.md',
        description: 'Configuration management and automation at scale.'
    },
    argocd: {
        title: 'ArgoCD',
        icon: '🚀',
        filename: 'ARGOCD_COMPLETE_GUIDE.md',
        description: 'GitOps continuous delivery for Kubernetes.'
    },
    circleci: {
        title: 'CircleCI',
        icon: '🔄',
        filename: 'CIRCLECI_COMPLETE_GUIDE.md',
        description: 'Build powerful CI/CD pipelines with CircleCI.'
    },
    argo_workflows: {
        title: 'Argo Workflows',
        icon: '🔀',
        filename: 'ARGO_WORKFLOWS_COMPLETE_GUIDE.md',
        description: 'Kubernetes-native workflow engine for complex pipelines.'
    },
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return Object.keys(GUIDE_METADATA).map((slug) => ({ slug }));
}

export default async function GuidePage({ params }: PageProps) {
    const { slug } = await params;
    const metadata = GUIDE_METADATA[slug];

    if (!metadata) {
        notFound();
    }

    let content = '';
    try {
        const filePath = path.join(GUIDES_DIR, metadata.filename);
        content = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error('Error reading guide:', error);
        notFound();
    }

    // Remove the main title to avoid duplication
    const contentWithoutTitle = content.replace(/^#\s+.+\n+/, '');

    // Extract table of contents from h2 and h3 headers
    const headers = content.match(/^#{2,3}\s+.+$/gm) || [];
    const toc = headers.slice(0, 25).map((header) => {
        const level = header.match(/^#+/)?.[0].length || 2;
        const text = header.replace(/^#+\s+/, '').replace(/[🐧🐳📦☸️🏗️⚙️🚀🔄🔀📚🎯📋🔬📝🔧✅💡🗂️🔐🌐📊⚡🛡️📈🔍💾🔒]/g, '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return { level, text, id };
    });

    const lineCount = content.split('\n').length;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted mb-6">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Home
                </Link>
                <span>/</span>
                <Link href="/guides" className="hover:text-foreground transition-colors">
                    Guides
                </Link>
                <span>/</span>
                <span className="text-foreground">{metadata.title}</span>
            </nav>

            <div className="flex gap-8">
                {/* Main content */}
                <article className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="mb-8 pb-6 border-b border-border">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-5xl">{metadata.icon}</span>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold">{metadata.title} Complete Guide</h1>
                                <p className="text-muted mt-2">{metadata.description}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 mt-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm">
                                <span>📝</span>
                                <span>{lineCount.toLocaleString()} lines</span>
                            </span>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm">
                                <span>📚</span>
                                <span>{toc.length} sections</span>
                            </span>
                        </div>
                    </div>

                    {/* Rendered Markdown Content */}
                    <div className="prose-container">
                        <MarkdownRenderer content={contentWithoutTitle} />
                    </div>

                    {/* Navigation footer */}
                    <div className="mt-12 pt-6 border-t border-border flex gap-4">
                        <Link
                            href="/guides"
                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                        >
                            ← All Guides
                        </Link>
                        <Link
                            href="/projects"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            View Projects →
                        </Link>
                    </div>
                </article>

                {/* Table of Contents - Desktop only */}
                <aside className="hidden xl:block w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <h4 className="font-semibold mb-4 text-sm text-foreground">On this page</h4>
                        <nav className="space-y-1 text-sm max-h-[calc(100vh-8rem)] overflow-auto pr-2">
                            {toc.map((item, i) => (
                                <a
                                    key={i}
                                    href={`#${item.id}`}
                                    className={`block py-1.5 text-muted hover:text-primary transition-colors truncate ${item.level === 2 ? 'font-medium' : 'pl-3 text-xs'
                                        }`}
                                    title={item.text}
                                >
                                    {item.text}
                                </a>
                            ))}
                            {headers.length > 25 && (
                                <span className="block py-1.5 text-muted text-xs italic">
                                    +{headers.length - 25} more sections
                                </span>
                            )}
                        </nav>
                    </div>
                </aside>
            </div>
        </div>
    );
}
