'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Plus,
    Layout,
    FileText,
    Star,
    MoreHorizontal,
    Eye,
    Edit,
    Copy,
    Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dropdown } from '@/components/ui/dropdown';

// Mock data
const templates = [
    {
        id: '1',
        name: 'SEO Performance Report',
        description: 'Track organic traffic, rankings, and SEO metrics',
        category: 'SEO',
        isDefault: true,
        usageCount: 45,
        thumbnail: null,
    },
    {
        id: '2',
        name: 'Paid Ads Report',
        description: 'Google Ads performance with conversion tracking',
        category: 'ADS',
        isDefault: true,
        usageCount: 32,
        thumbnail: null,
    },
    {
        id: '3',
        name: 'Social Media Report',
        description: 'Social engagement and audience growth metrics',
        category: 'SOCIAL',
        isDefault: true,
        usageCount: 28,
        thumbnail: null,
    },
    {
        id: '4',
        name: 'Monthly Overview',
        description: 'Custom template for monthly client updates',
        category: 'CUSTOM',
        isDefault: false,
        usageCount: 15,
        thumbnail: null,
    },
];

const categoryColors: Record<string, string> = {
    SEO: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    ADS: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    SOCIAL: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    CUSTOM: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
};

export default function TemplatesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Templates</h1>
                    <p className="text-muted-foreground">Pre-built and custom report templates.</p>
                </div>
                <Link href="/dashboard/templates/new">
                    <Button variant="gradient">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                    </Button>
                </Link>
            </motion.div>

            {/* Default Templates */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Pre-built Templates
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.filter(t => t.isDefault).map((template, index) => (
                        <Card key={template.id} hover className="h-full">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Layout className="h-6 w-6 text-primary" />
                                    </div>
                                    <Dropdown
                                        trigger={
                                            <button className="p-1 rounded-lg hover:bg-accent transition-colors">
                                                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                            </button>
                                        }
                                        items={[
                                            { label: 'Preview', value: 'preview', icon: <Eye className="h-4 w-4" /> },
                                            { label: 'Duplicate', value: 'duplicate', icon: <Copy className="h-4 w-4" /> },
                                        ]}
                                        onSelect={(value) => console.log(value, template.id)}
                                        align="right"
                                    />
                                </div>
                                <div className="mb-3">
                                    <Badge className={categoryColors[template.category]}>
                                        {template.category}
                                    </Badge>
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <span className="text-sm text-muted-foreground">
                                        Used {template.usageCount} times
                                    </span>
                                    <Button variant="outline" size="sm">
                                        <FileText className="h-4 w-4 mr-1" />
                                        Use
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>

            {/* Custom Templates */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Layout className="h-5 w-5 text-primary" />
                    Custom Templates
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.filter(t => !t.isDefault).map((template, index) => (
                        <Card key={template.id} hover className="h-full">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Layout className="h-6 w-6 text-primary" />
                                    </div>
                                    <Dropdown
                                        trigger={
                                            <button className="p-1 rounded-lg hover:bg-accent transition-colors">
                                                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                            </button>
                                        }
                                        items={[
                                            { label: 'Preview', value: 'preview', icon: <Eye className="h-4 w-4" /> },
                                            { label: 'Edit', value: 'edit', icon: <Edit className="h-4 w-4" /> },
                                            { label: 'Duplicate', value: 'duplicate', icon: <Copy className="h-4 w-4" /> },
                                            { label: 'Delete', value: 'delete', icon: <Trash2 className="h-4 w-4" />, danger: true },
                                        ]}
                                        onSelect={(value) => console.log(value, template.id)}
                                        align="right"
                                    />
                                </div>
                                <div className="mb-3">
                                    <Badge className={categoryColors[template.category]}>
                                        {template.category}
                                    </Badge>
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <span className="text-sm text-muted-foreground">
                                        Used {template.usageCount} times
                                    </span>
                                    <Button variant="outline" size="sm">
                                        <FileText className="h-4 w-4 mr-1" />
                                        Use
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add New Template Card */}
                    <Card className="h-full border-dashed">
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">Create Custom Template</h3>
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                Build your own template with custom widgets
                            </p>
                            <Link href="/dashboard/templates/new">
                                <Button variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Template
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
