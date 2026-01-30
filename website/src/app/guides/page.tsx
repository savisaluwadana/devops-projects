import Link from 'next/link';
import Card from '@/components/ui/Card';

const guides = [
    {
        slug: 'linux',
        title: 'Linux',
        icon: '🐧',
        lines: 1291,
        topics: ['File system', 'Commands', 'Scripting', 'Networking', 'Security'],
        level: 'Beginner',
        description: 'Master the command line and Linux administration fundamentals.',
    },
    {
        slug: 'docker',
        title: 'Docker',
        icon: '🐳',
        lines: 1258,
        topics: ['Containers', 'Images', 'Networking', 'Compose', 'Production'],
        level: 'Beginner',
        description: 'Learn containerization from basics to production-ready deployments.',
    },
    {
        slug: 'git',
        title: 'Git',
        icon: '📦',
        lines: 1078,
        topics: ['Workflows', 'Branching', 'Merging', 'Rebasing', 'Advanced Ops'],
        level: 'Beginner',
        description: 'Version control mastery for team collaboration and code management.',
    },
    {
        slug: 'kubernetes',
        title: 'Kubernetes',
        icon: '☸️',
        lines: 1292,
        topics: ['Architecture', 'Workloads', 'Networking', 'Storage', 'Security'],
        level: 'Intermediate',
        description: 'Container orchestration at scale with Kubernetes.',
    },
    {
        slug: 'terraform',
        title: 'Terraform',
        icon: '🏗️',
        lines: 1314,
        topics: ['HCL', 'State', 'Modules', 'Workspaces', 'Best Practices'],
        level: 'Intermediate',
        description: 'Infrastructure as Code for cloud-native environments.',
    },
    {
        slug: 'ansible',
        title: 'Ansible',
        icon: '⚙️',
        lines: 361,
        topics: ['Playbooks', 'Modules', 'Roles', 'Vault', 'Inventory'],
        level: 'Intermediate',
        description: 'Configuration management and automation at scale.',
    },
    {
        slug: 'argocd',
        title: 'ArgoCD',
        icon: '🚀',
        lines: 336,
        topics: ['GitOps', 'Applications', 'Sync Strategies', 'ApplicationSets'],
        level: 'Advanced',
        description: 'GitOps continuous delivery for Kubernetes.',
    },
    {
        slug: 'circleci',
        title: 'CircleCI',
        icon: '🔄',
        lines: 326,
        topics: ['Pipelines', 'Jobs', 'Orbs', 'Workflows', 'Caching'],
        level: 'Advanced',
        description: 'Build powerful CI/CD pipelines with CircleCI.',
    },
    {
        slug: 'argo_workflows',
        title: 'Argo Workflows',
        icon: '🔀',
        lines: 324,
        topics: ['Workflows', 'DAGs', 'Templates', 'Artifacts'],
        level: 'Advanced',
        description: 'Kubernetes-native workflow engine for complex pipelines.',
    },
];

const levelColors: Record<string, string> = {
    Beginner: 'bg-green-500/10 text-green-600 dark:text-green-400',
    Intermediate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Advanced: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

export default function GuidesPage() {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <nav className="flex items-center gap-2 text-sm text-muted mb-4">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">Guides</span>
                </nav>

                <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                    📚 Technology Guides
                </h1>
                <p className="text-lg text-muted max-w-2xl">
                    Comprehensive documentation covering the entire DevOps and Platform Engineering stack.
                    <strong className="text-foreground"> 9 guides, 7,580+ lines</strong> of expert content.
                </p>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-6 p-4 bg-card border border-border rounded-xl mb-8">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <div>
                        <div className="text-sm text-muted">Total Lines</div>
                        <div className="font-bold">7,580+</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <div>
                        <div className="text-sm text-muted">Guides</div>
                        <div className="font-bold">9</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <div>
                        <div className="text-sm text-muted">Skill Levels</div>
                        <div className="font-bold">Beginner → Advanced</div>
                    </div>
                </div>
            </div>

            {/* Guides grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                    <Link
                        key={guide.slug}
                        href={`/guides/${guide.slug}`}
                        className="group p-6 bg-card border border-border rounded-xl card-hover"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-4xl">{guide.icon}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors[guide.level]}`}>
                                {guide.level}
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {guide.title}
                        </h2>

                        <p className="text-sm text-muted mb-4">{guide.description}</p>

                        <div className="flex items-center gap-4 text-sm text-muted mb-4">
                            <span>📝 {guide.lines.toLocaleString()} lines</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {guide.topics.slice(0, 3).map((topic) => (
                                <span
                                    key={topic}
                                    className="px-2 py-0.5 text-xs bg-secondary text-muted rounded"
                                >
                                    {topic}
                                </span>
                            ))}
                            {guide.topics.length > 3 && (
                                <span className="px-2 py-0.5 text-xs text-muted">
                                    +{guide.topics.length - 3}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Learning path suggestion */}
            <div className="mt-12 p-6 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border border-border rounded-xl">
                <h3 className="text-lg font-semibold mb-2">💡 Recommended Learning Path</h3>
                <p className="text-muted mb-4">
                    Start with the fundamentals and progress through each technology:
                </p>
                <div className="flex flex-wrap gap-2">
                    {['Linux', 'Git', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'CircleCI', 'ArgoCD', 'Argo Workflows'].map(
                        (tech, i) => (
                            <span key={tech} className="flex items-center gap-1">
                                <span className="font-medium">{tech}</span>
                                {i < 8 && <span className="text-muted">→</span>}
                            </span>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
