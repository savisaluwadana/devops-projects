import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

const LEVEL_INFO: Record<string, { name: string; icon: string; color: string; bgColor: string }> = {
    '01-beginner': {
        name: 'Beginner',
        icon: '🌱',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10'
    },
    '02-intermediate': {
        name: 'Intermediate',
        icon: '📈',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10'
    },
    '03-advanced': {
        name: 'Advanced',
        icon: '🚀',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10'
    },
    '04-platform-engineering': {
        name: 'Platform Engineering',
        icon: '⭐',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10'
    },
};

interface PageProps {
    params: Promise<{ level: string; slug: string }>;
}

export async function generateStaticParams() {
    const params: { level: string; slug: string }[] = [];

    try {
        const levels = fs.readdirSync(PROJECTS_DIR);

        for (const level of levels) {
            if (!LEVEL_INFO[level]) continue;

            const levelPath = path.join(PROJECTS_DIR, level);
            const stat = fs.statSync(levelPath);

            if (stat.isDirectory()) {
                const projectDirs = fs.readdirSync(levelPath);

                for (const projectDir of projectDirs) {
                    const readmePath = path.join(levelPath, projectDir, 'README.md');
                    if (fs.existsSync(readmePath)) {
                        params.push({ level, slug: projectDir });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error generating static params:', error);
    }

    return params;
}

export default async function ProjectPage({ params }: PageProps) {
    const { level, slug } = await params;

    if (!LEVEL_INFO[level]) {
        notFound();
    }

    const readmePath = path.join(PROJECTS_DIR, level, slug, 'README.md');

    if (!fs.existsSync(readmePath)) {
        notFound();
    }

    let content = '';
    try {
        content = fs.readFileSync(readmePath, 'utf-8');
    } catch (error) {
        console.error('Error reading project:', error);
        notFound();
    }

    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch
        ? titleMatch[1].replace(/[🐳📦🔧⚙️🚀💻🔒📊🌐🐧🌱📈⭐]/g, '').trim()
        : slug.replace(/-/g, ' ');

    // Extract metadata
    const objectiveMatch = content.match(/Objective\s*\|\s*(.+)\s*\|/);
    const skillsMatch = content.match(/Skills\s*\|\s*(.+)\s*\|/);
    const deliverableMatch = content.match(/Deliverable\s*\|\s*(.+)\s*\|/);

    // Remove the main title to avoid duplication
    const contentWithoutTitle = content.replace(/^#\s+.+\n+/, '');

    // Extract table of contents from h2 and h3 headers
    const headers = content.match(/^#{2,3}\s+.+$/gm) || [];
    const toc = headers.slice(0, 20).map((header) => {
        const headerLevel = header.match(/^#+/)?.[0].length || 2;
        const text = header.replace(/^#+\s+/, '').replace(/[🐧🐳📦☸️🏗️⚙️🚀🔄🔀📚🎯📋🔬📝🔧✅💡🗂️🔐🌐📊⚡🛡️📈🔍💾🔒]/g, '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return { level: headerLevel, text, id };
    });

    const levelInfo = LEVEL_INFO[level];
    const lineCount = content.split('\n').length;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted mb-6">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Home
                </Link>
                <span>/</span>
                <Link href="/projects" className="hover:text-foreground transition-colors">
                    Projects
                </Link>
                <span>/</span>
                <Link href={`/projects#${level}`} className="hover:text-foreground transition-colors">
                    {levelInfo.name}
                </Link>
                <span>/</span>
                <span className="text-foreground">{title}</span>
            </nav>

            <div className="flex gap-8">
                {/* Main content */}
                <article className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="mb-8 pb-6 border-b border-border">
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-3 py-1.5 rounded-full font-medium text-sm ${levelInfo.bgColor} ${levelInfo.color}`}>
                                {levelInfo.icon} {levelInfo.name}
                            </span>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-bold mb-3">{title}</h1>

                        {objectiveMatch && (
                            <p className="text-lg text-muted mb-4">{objectiveMatch[1]}</p>
                        )}

                        {/* Stats */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm">
                                <span>📝</span>
                                <span>{lineCount.toLocaleString()} lines</span>
                            </span>
                            {toc.length > 0 && (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm">
                                    <span>📚</span>
                                    <span>{toc.length} sections</span>
                                </span>
                            )}
                        </div>

                        {/* Meta cards */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {skillsMatch && (
                                <div className="p-4 bg-card border border-border rounded-xl">
                                    <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                        <span>🎯</span>
                                        <span>Skills You&apos;ll Learn</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {skillsMatch[1].split(',').map((skill) => (
                                            <span
                                                key={skill.trim()}
                                                className="px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-md font-medium"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {deliverableMatch && (
                                <div className="p-4 bg-card border border-border rounded-xl">
                                    <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                        <span>📦</span>
                                        <span>Deliverable</span>
                                    </h4>
                                    <p className="text-muted text-sm">{deliverableMatch[1]}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rendered Markdown Content */}
                    <div className="prose-container">
                        <MarkdownRenderer content={contentWithoutTitle} />
                    </div>

                    {/* Navigation footer */}
                    <div className="mt-12 pt-6 border-t border-border">
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/projects"
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                            >
                                ← All Projects
                            </Link>
                            <Link
                                href="/guides"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Browse Guides →
                            </Link>
                        </div>

                        {/* Related resources */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-border rounded-xl">
                            <h4 className="font-semibold mb-2 text-sm">💡 Need more context?</h4>
                            <p className="text-sm text-muted">
                                Check out the comprehensive guides for in-depth theory and explanations on these technologies.
                            </p>
                        </div>
                    </div>
                </article>

                {/* Table of Contents - Desktop only */}
                {toc.length > 0 && (
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
                                {headers.length > 20 && (
                                    <span className="block py-1.5 text-muted text-xs italic">
                                        +{headers.length - 20} more sections
                                    </span>
                                )}
                            </nav>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
