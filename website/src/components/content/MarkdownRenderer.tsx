'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeSlug]}
                components={{
                    // Headings
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-border text-foreground">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-lg font-semibold mt-4 mb-2 text-foreground">
                            {children}
                        </h4>
                    ),
                    // Paragraphs
                    p: ({ children }) => (
                        <p className="mb-4 text-muted leading-relaxed">{children}</p>
                    ),
                    // Lists
                    ul: ({ children }) => (
                        <ul className="mb-4 ml-6 list-disc space-y-1 text-muted">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mb-4 ml-6 list-decimal space-y-1 text-muted">{children}</ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    // Code blocks
                    pre: ({ children }) => (
                        <pre className="mb-4 p-4 bg-code-bg rounded-lg overflow-x-auto text-sm">
                            {children}
                        </pre>
                    ),
                    code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="px-1.5 py-0.5 bg-secondary text-accent rounded text-sm font-mono" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={`${className} text-gray-100`} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Tables
                    table: ({ children }) => (
                        <div className="mb-4 overflow-x-auto">
                            <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-secondary">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border">
                            {children}
                        </th>
                    ),
                    tr: ({ children }) => (
                        <tr className="border-b border-border hover:bg-secondary/50 transition-colors">
                            {children}
                        </tr>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-muted">{children}</td>
                    ),
                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="mb-4 pl-4 border-l-4 border-primary bg-primary/5 py-2 italic text-muted">
                            {children}
                        </blockquote>
                    ),
                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-primary hover:underline font-medium"
                            target={href?.startsWith('http') ? '_blank' : undefined}
                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                            {children}
                        </a>
                    ),
                    // Horizontal rules
                    hr: () => <hr className="my-8 border-border" />,
                    // Strong and emphasis
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic">{children}</em>,
                    // Images
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt || ''}
                            className="max-w-full h-auto rounded-lg my-4"
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
