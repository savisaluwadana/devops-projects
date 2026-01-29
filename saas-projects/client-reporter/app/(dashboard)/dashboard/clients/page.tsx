'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    MoreHorizontal,
    Building2,
    Mail,
    Globe,
    Edit,
    Trash2,
    Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown } from '@/components/ui/dropdown';

// Mock data
const clients = [
    {
        id: '1',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        website: 'https://acme.com',
        industry: 'Technology',
        integrations: 3,
        reportsCount: 12,
        isActive: true,
        logo: null,
    },
    {
        id: '2',
        name: 'TechStart Inc',
        email: 'hello@techstart.io',
        website: 'https://techstart.io',
        industry: 'SaaS',
        integrations: 2,
        reportsCount: 8,
        isActive: true,
        logo: null,
    },
    {
        id: '3',
        name: 'Growth Agency',
        email: 'info@growthagency.com',
        website: 'https://growthagency.com',
        industry: 'Marketing',
        integrations: 3,
        reportsCount: 24,
        isActive: true,
        logo: null,
    },
    {
        id: '4',
        name: 'Digital First',
        email: 'team@digitalfirst.co',
        website: 'https://digitalfirst.co',
        industry: 'E-commerce',
        integrations: 1,
        reportsCount: 6,
        isActive: false,
        logo: null,
    },
];

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Clients</h1>
                    <p className="text-muted-foreground">Manage your client accounts and integrations.</p>
                </div>
                <Link href="/dashboard/clients/new">
                    <Button variant="gradient">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                    </Button>
                </Link>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search clients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    icon={<Search className="h-4 w-4" />}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Clients Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map((client, index) => (
                    <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <Card hover className="h-full">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={client.name} size="lg" />
                                        <div>
                                            <h3 className="font-semibold text-foreground">{client.name}</h3>
                                            <p className="text-sm text-muted-foreground">{client.industry}</p>
                                        </div>
                                    </div>
                                    <Dropdown
                                        trigger={
                                            <button className="p-1 rounded-lg hover:bg-accent transition-colors">
                                                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                            </button>
                                        }
                                        items={[
                                            { label: 'View Details', value: 'view', icon: <Eye className="h-4 w-4" /> },
                                            { label: 'Edit', value: 'edit', icon: <Edit className="h-4 w-4" /> },
                                            { label: 'Delete', value: 'delete', icon: <Trash2 className="h-4 w-4" />, danger: true },
                                        ]}
                                        onSelect={(value) => console.log(value, client.id)}
                                        align="right"
                                    />
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Globe className="h-4 w-4" />
                                        <a
                                            href={client.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="truncate hover:text-primary transition-colors"
                                        >
                                            {client.website.replace('https://', '')}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-muted-foreground">
                                            <span className="text-foreground font-medium">{client.integrations}</span> integrations
                                        </span>
                                        <span className="text-muted-foreground">
                                            <span className="text-foreground font-medium">{client.reportsCount}</span> reports
                                        </span>
                                    </div>
                                    <Badge variant={client.isActive ? 'success' : 'secondary'}>
                                        {client.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredClients.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery ? 'Try a different search term' : 'Add your first client to get started'}
                            </p>
                            <Link href="/dashboard/clients/new">
                                <Button variant="gradient">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Client
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
