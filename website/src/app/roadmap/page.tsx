import Link from 'next/link';

const levels = [
    {
        number: 1,
        name: 'Linux Foundations',
        skills: ['File system', 'CLI', 'Scripting'],
        duration: '1-2 weeks',
        color: 'bg-green-500',
    },
    {
        number: 2,
        name: 'Containerization',
        skills: ['Docker', 'Images', 'Volumes'],
        duration: '2 weeks',
        color: 'bg-green-500',
    },
    {
        number: 3,
        name: 'CI/CD Introduction',
        skills: ['GitHub Actions', 'Testing', 'Automation'],
        duration: '2 weeks',
        color: 'bg-green-500',
    },
    {
        number: 4,
        name: 'Kubernetes Basics',
        skills: ['Pods', 'Services', 'Deployments'],
        duration: '3 weeks',
        color: 'bg-blue-500',
    },
    {
        number: 5,
        name: 'Infrastructure as Code',
        skills: ['Terraform', 'Ansible', 'State'],
        duration: '3 weeks',
        color: 'bg-blue-500',
    },
    {
        number: 6,
        name: 'Monitoring & Observability',
        skills: ['Prometheus', 'Grafana', 'Logging'],
        duration: '2 weeks',
        color: 'bg-blue-500',
    },
    {
        number: 7,
        name: 'GitOps & CD',
        skills: ['ArgoCD', 'Flux', 'Progressive Delivery'],
        duration: '3 weeks',
        color: 'bg-purple-500',
    },
    {
        number: 8,
        name: 'Service Mesh & Security',
        skills: ['Istio', 'Vault', 'OPA'],
        duration: '3 weeks',
        color: 'bg-purple-500',
    },
    {
        number: 9,
        name: 'Advanced Infrastructure',
        skills: ['Multi-cluster', 'Crossplane', 'DR'],
        duration: '4 weeks',
        color: 'bg-purple-500',
    },
    {
        number: 10,
        name: 'Platform Engineering',
        skills: ['Backstage', 'Operators', 'Golden Paths'],
        duration: '8-12 weeks',
        color: 'bg-amber-500',
    },
];

const milestones = [
    { level: 3, title: '🎉 DevOps Fundamentals Complete', description: 'Ready for infrastructure work' },
    { level: 6, title: '🎉 Infrastructure Mastery', description: 'Ready for advanced operations' },
    { level: 9, title: '🎉 Advanced Operations Complete', description: 'Ready for platform engineering' },
    { level: 10, title: '🏆 Platform Engineer!', description: 'Full stack mastery achieved' },
];

export default function RoadmapPage() {
    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
                <nav className="flex items-center justify-center gap-2 text-sm text-muted mb-4">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">Roadmap</span>
                </nav>

                <h1 className="text-3xl lg:text-4xl font-bold mb-4">🗺️ Learning Roadmap</h1>
                <p className="text-lg text-muted max-w-2xl mx-auto">
                    Your journey from <strong className="text-foreground">DevOps Fundamentals</strong> to{' '}
                    <strong className="text-foreground">Platform Engineering Mastery</strong>. 10 levels, 31+ projects.
                </p>
            </div>

            {/* Timeline overview */}
            <div className="flex justify-center gap-2 mb-12 flex-wrap">
                {[
                    { range: '1-3', label: 'Beginner', color: 'bg-green-500', weeks: '4-6 weeks' },
                    { range: '4-6', label: 'Intermediate', color: 'bg-blue-500', weeks: '6-8 weeks' },
                    { range: '7-9', label: 'Advanced', color: 'bg-purple-500', weeks: '8-10 weeks' },
                    { range: '10', label: 'Platform', color: 'bg-amber-500', weeks: '8-12 weeks' },
                ].map((phase) => (
                    <div key={phase.range} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                        <span className={`w-3 h-3 ${phase.color} rounded-full`} />
                        <span className="text-sm font-medium">L{phase.range}</span>
                        <span className="text-xs text-muted">{phase.weeks}</span>
                    </div>
                ))}
            </div>

            {/* Roadmap */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 via-purple-500 to-amber-500 hidden md:block" />

                <div className="space-y-6">
                    {levels.map((level, index) => {
                        const milestone = milestones.find((m) => m.level === level.number);

                        return (
                            <div key={level.number}>
                                {/* Level card */}
                                <div className="relative flex gap-6">
                                    {/* Timeline dot */}
                                    <div className="hidden md:flex items-center justify-center w-12 flex-shrink-0">
                                        <div className={`w-4 h-4 ${level.color} rounded-full ring-4 ring-background`} />
                                    </div>

                                    {/* Card */}
                                    <div className="flex-1 p-6 bg-card border border-border rounded-xl card-hover">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 ${level.color} text-white text-sm font-bold rounded-full`}>
                                                    Level {level.number}
                                                </span>
                                                <h3 className="text-lg font-semibold">{level.name}</h3>
                                            </div>
                                            <span className="text-sm text-muted">{level.duration}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {level.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-2 py-1 text-xs bg-secondary text-muted rounded"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Milestone */}
                                {milestone && (
                                    <div className="relative flex gap-6 mt-4">
                                        <div className="hidden md:block w-12 flex-shrink-0" />
                                        <div className="flex-1 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{milestone.title.split(' ')[0]}</span>
                                                <div>
                                                    <div className="font-semibold">{milestone.title.slice(3)}</div>
                                                    <div className="text-sm text-muted">{milestone.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Resources */}
            <div className="mt-16 grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-card border border-border rounded-xl">
                    <h3 className="font-semibold mb-3">📚 Recommended Books</h3>
                    <ul className="space-y-2 text-sm text-muted">
                        <li>• "The Phoenix Project" - Gene Kim</li>
                        <li>• "The DevOps Handbook" - Gene Kim et al.</li>
                        <li>• "Site Reliability Engineering" - Google</li>
                        <li>• "Team Topologies" - Matthew Skelton</li>
                    </ul>
                </div>
                <div className="p-6 bg-card border border-border rounded-xl">
                    <h3 className="font-semibold mb-3">🎓 Certification Path</h3>
                    <ul className="space-y-2 text-sm text-muted">
                        <li>• CKA - Certified Kubernetes Administrator</li>
                        <li>• CKS - Certified Kubernetes Security</li>
                        <li>• AWS/GCP/Azure Cloud certifications</li>
                        <li>• HashiCorp Terraform Associate</li>
                    </ul>
                </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
                <Link
                    href="/projects?level=beginner"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    <span>Start Level 1</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
