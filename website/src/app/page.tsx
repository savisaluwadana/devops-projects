import Link from 'next/link';
import Card from '@/components/ui/Card';

const technologies = [
  { name: 'Linux', icon: '🐧', color: 'from-orange-500 to-yellow-500' },
  { name: 'Docker', icon: '🐳', color: 'from-blue-500 to-cyan-500' },
  { name: 'Git', icon: '📦', color: 'from-red-500 to-orange-500' },
  { name: 'Kubernetes', icon: '☸️', color: 'from-blue-600 to-indigo-600' },
  { name: 'Terraform', icon: '🏗️', color: 'from-purple-500 to-violet-500' },
  { name: 'Ansible', icon: '⚙️', color: 'from-red-600 to-red-500' },
  { name: 'ArgoCD', icon: '🚀', color: 'from-orange-500 to-red-500' },
  { name: 'CircleCI', icon: '🔄', color: 'from-green-500 to-emerald-500' },
];

const stats = [
  { label: 'Guides', value: '9', icon: '📚' },
  { label: 'Projects', value: '31+', icon: '💻' },
  { label: 'Lines of Docs', value: '7,580+', icon: '📝' },
  { label: 'Learning Levels', value: '10', icon: '📈' },
];

const levels = [
  {
    level: 'Beginner',
    number: '1-3',
    description: 'Linux, Git, Docker, CI Basics',
    duration: '4-6 weeks',
    color: 'bg-green-500',
    projects: 9,
  },
  {
    level: 'Intermediate',
    number: '4-6',
    description: 'Kubernetes, Terraform, Ansible',
    duration: '6-8 weeks',
    color: 'bg-blue-500',
    projects: 10,
  },
  {
    level: 'Advanced',
    number: '7-9',
    description: 'GitOps, Service Mesh, Observability',
    duration: '8-10 weeks',
    color: 'bg-purple-500',
    projects: 7,
  },
  {
    level: 'Platform Engineering',
    number: '10',
    description: 'Backstage, Operators, Golden Paths',
    duration: '8-12 weeks',
    color: 'bg-amber-500',
    projects: 5,
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 lg:py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
          <span>🎯</span>
          <span>From Zero to Platform Engineer</span>
        </div>

        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          <span className="gradient-text">DevOps & Platform</span>
          <br />
          <span className="text-foreground">Engineering Hub</span>
        </h1>

        <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
          Master cloud-native technologies with <strong className="text-foreground">9 comprehensive guides</strong> and{' '}
          <strong className="text-foreground">31+ hands-on projects</strong>. Build real-world skills from Linux basics to platform engineering expertise.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/roadmap"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity glow-primary"
          >
            View Roadmap
          </Link>
          <Link
            href="/guides"
            className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
          >
            Browse Guides
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 bg-card border border-border rounded-xl text-center card-hover"
          >
            <span className="text-3xl mb-2 block">{stat.icon}</span>
            <div className="text-3xl font-bold gradient-text">{stat.value}</div>
            <div className="text-sm text-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Technologies */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Technologies Covered</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {technologies.map((tech) => (
            <Link
              key={tech.name}
              href={`/guides/${tech.name.toLowerCase()}`}
              className="group p-4 bg-card border border-border rounded-xl text-center card-hover"
            >
              <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
                {tech.icon}
              </span>
              <span className="text-sm font-medium">{tech.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Learning Path */}
      <section>
        <h2 className="text-2xl font-bold mb-2 text-center">Learning Path</h2>
        <p className="text-muted text-center mb-8">
          Progress through 10 levels from fundamentals to platform engineering mastery
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((level, index) => (
            <div
              key={level.level}
              className="relative p-6 bg-card border border-border rounded-xl card-hover"
            >
              {/* Level indicator */}
              <div className={`absolute -top-3 left-6 px-3 py-1 ${level.color} text-white text-xs font-bold rounded-full`}>
                Level {level.number}
              </div>

              <h3 className="font-semibold text-lg mt-2 mb-2">{level.level}</h3>
              <p className="text-sm text-muted mb-4">{level.description}</p>

              <div className="flex justify-between text-sm">
                <span className="text-muted">
                  <span className="font-medium text-foreground">{level.projects}</span> projects
                </span>
                <span className="text-muted">{level.duration}</span>
              </div>

              {/* Connector line */}
              {index < levels.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card
          title="Complete Guides"
          description="In-depth documentation covering Linux, Docker, Kubernetes, Terraform, and more. Over 7,580 lines of expert content."
          icon="📚"
          href="/guides"
          badge="9 Guides"
          badgeColor="primary"
          tags={['Linux', 'Docker', 'Kubernetes', 'Terraform', 'Ansible']}
        />
        <Card
          title="Hands-On Projects"
          description="Practice with real-world scenarios. Build Docker containers, deploy to Kubernetes, implement GitOps, and more."
          icon="💻"
          href="/projects"
          badge="31+ Projects"
          badgeColor="accent"
          tags={['Beginner', 'Intermediate', 'Advanced', 'Platform Engineering']}
        />
      </section>

      {/* CTA */}
      <section className="text-center py-12 px-6 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-2xl border border-border">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-muted mb-6 max-w-lg mx-auto">
          Begin with Level 1 fundamentals and work your way up to becoming a Platform Engineer.
        </p>
        <Link
          href="/projects?level=beginner"
          className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity glow-accent"
        >
          <span>Start with Beginner Projects</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
