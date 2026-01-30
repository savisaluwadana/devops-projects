import Link from 'next/link';

interface CardProps {
    title: string;
    description?: string;
    icon?: string;
    href?: string;
    badge?: string;
    badgeColor?: 'primary' | 'accent' | 'secondary';
    stats?: { label: string; value: string | number }[];
    tags?: string[];
    className?: string;
}

export default function Card({
    title,
    description,
    icon,
    href,
    badge,
    badgeColor = 'primary',
    stats,
    tags,
    className = '',
}: CardProps) {
    const badgeColors = {
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        secondary: 'bg-secondary text-secondary-foreground',
    };

    const content = (
        <div
            className={`group p-6 bg-card border border-border rounded-xl card-hover ${className}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {icon && <span className="text-2xl">{icon}</span>}
                    <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </div>
                {badge && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColors[badgeColor]}`}>
                        {badge}
                    </span>
                )}
            </div>

            {/* Description */}
            {description && (
                <p className="text-muted text-sm mb-4 line-clamp-2">{description}</p>
            )}

            {/* Stats */}
            {stats && stats.length > 0 && (
                <div className="flex gap-4 mb-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-sm">
                            <span className="text-muted">{stat.label}: </span>
                            <span className="font-medium text-foreground">{stat.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-secondary text-muted rounded-md"
                        >
                            {tag}
                        </span>
                    ))}
                    {tags.length > 4 && (
                        <span className="px-2 py-1 text-xs text-muted">+{tags.length - 4} more</span>
                    )}
                </div>
            )}

            {/* Arrow indicator for links */}
            {href && (
                <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}
