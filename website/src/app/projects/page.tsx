import fs from 'fs';
import path from 'path';
import Link from 'next/link';

const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

interface Project {
    slug: string;
    title: string;
    level: string;
    levelKey: string;
    description: string;
    skills: string[];
}

const LEVEL_INFO: Record<string, { name: string; icon: string; color: string; description: string }> = {
    '01-beginner': {
        name: 'Beginner',
        icon: '🌱',
        color: 'bg-green-500',
        description: 'Linux, Git, Docker, CI basics',
    },
    '02-intermediate': {
        name: 'Intermediate',
        icon: '📈',
        color: 'bg-blue-500',
        description: 'Kubernetes, Terraform, Ansible, Monitoring',
    },
    '03-advanced': {
        name: 'Advanced',
        icon: '🚀',
        color: 'bg-purple-500',
        description: 'GitOps, Service Mesh, Security, Observability',
    },
    '04-platform-engineering': {
        name: 'Platform Engineering',
        icon: '⭐',
        color: 'bg-amber-500',
        description: 'Backstage, Operators, Chaos Engineering',
    },
};

function getProjects(): Record<string, Project[]> {
    const grouped: Record<string, Project[]> = {};

    try {
        const levels = fs.readdirSync(PROJECTS_DIR);

        for (const level of levels) {
            if (!LEVEL_INFO[level]) continue;

            const levelPath = path.join(PROJECTS_DIR, level);
            const stat = fs.statSync(levelPath);

            if (stat.isDirectory()) {
                grouped[level] = [];
                const projectDirs = fs.readdirSync(levelPath);

                for (const projectDir of projectDirs) {
                    const readmePath = path.join(levelPath, projectDir, 'README.md');

                    if (fs.existsSync(readmePath)) {
                        const content = fs.readFileSync(readmePath, 'utf-8');
                        const titleMatch = content.match(/^#\s+(.+)$/m);
                        const skillsMatch = content.match(/Skills\s*\|\s*(.+)\s*\|/);
                        const descMatch = content.match(/Objective\s*\|\s*(.+)\s*\|/);

                        grouped[level].push({
                            slug: projectDir,
                            title: titleMatch
                                ? titleMatch[1].replace(/[🐳📦🔧⚙️🚀💻🔒📊🌐🐧]/g, '').trim()
                                : projectDir.replace(/-/g, ' '),
                            level: LEVEL_INFO[level].name,
                            levelKey: level,
                            description: descMatch ? descMatch[1].trim() : '',
                            skills: skillsMatch ? skillsMatch[1].split(',').map((s) => s.trim()) : [],
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error reading projects:', error);
    }

    return grouped;
}

export default function ProjectsPage() {
    const projectsByLevel = getProjects();
    const totalProjects = Object.values(projectsByLevel).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <nav className="flex items-center gap-2 text-sm text-muted mb-4">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">Projects</span>
                </nav>

                <h1 className="text-3xl lg:text-4xl font-bold mb-4">💻 Hands-On Projects</h1>
                <p className="text-lg text-muted max-w-2xl">
                    Build real-world skills with <strong className="text-foreground">{totalProjects} practical projects</strong> covering the full DevOps and Platform Engineering stack.
                </p>
            </div>

            {/* Level overview cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {Object.entries(LEVEL_INFO).map(([key, info]) => (
                    <a
                        key={key}
                        href={`#${key}`}
                        className="p-4 bg-card border border-border rounded-xl card-hover"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{info.icon}</span>
                            <div>
                                <div className="font-semibold">{info.name}</div>
                                <div className="text-sm text-muted">{projectsByLevel[key]?.length || 0} projects</div>
                            </div>
                        </div>
                        <div className={`h-1 ${info.color} rounded-full mt-2`} />
                    </a>
                ))}
            </div>

            {/* Projects by level */}
            {Object.entries(LEVEL_INFO).map(([levelKey, info]) => (
                <section key={levelKey} id={levelKey} className="mb-12 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                        <span className={`w-3 h-3 ${info.color} rounded-full`} />
                        <h2 className="text-2xl font-bold">{info.icon} {info.name}</h2>
                        <span className="text-muted">({projectsByLevel[levelKey]?.length || 0} projects)</span>
                    </div>
                    <p className="text-muted mb-6">{info.description}</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(projectsByLevel[levelKey] || []).map((project) => (
                            <Link
                                key={project.slug}
                                href={`/projects/${project.levelKey}/${project.slug}`}
                                className="group p-5 bg-card border border-border rounded-xl card-hover"
                            >
                                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                    {project.title}
                                </h3>
                                {project.description && (
                                    <p className="text-sm text-muted mb-3 line-clamp-2">{project.description}</p>
                                )}
                                {project.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {project.skills.slice(0, 3).map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2 py-0.5 text-xs bg-secondary text-muted rounded"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            ))}

            {/* CTA */}
            <div className="mt-12 p-6 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border border-border rounded-xl text-center">
                <h3 className="text-lg font-semibold mb-2">📚 Need Help Getting Started?</h3>
                <p className="text-muted mb-4">
                    Check out the comprehensive guides to build your foundation.
                </p>
                <Link
                    href="/guides"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <span>Browse Guides</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
