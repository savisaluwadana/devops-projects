'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
    Link2,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    RefreshCw,
    Trash2,
    Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Integration data
const integrations = [
    {
        id: 'google-analytics',
        name: 'Google Analytics 4',
        description: 'Connect to Google Analytics 4 to pull website traffic and user behavior data.',
        icon: '📊',
        connected: 15,
        total: 20,
        status: 'connected',
        lastSync: new Date('2025-01-29T10:30:00'),
    },
    {
        id: 'search-console',
        name: 'Google Search Console',
        description: 'Connect to Search Console for SEO performance and keyword rankings.',
        icon: '🔍',
        connected: 12,
        total: 20,
        status: 'connected',
        lastSync: new Date('2025-01-29T09:15:00'),
    },
    {
        id: 'google-ads',
        name: 'Google Ads',
        description: 'Connect to Google Ads for advertising performance metrics.',
        icon: '📢',
        connected: 8,
        total: 20,
        status: 'partial',
        lastSync: new Date('2025-01-28T14:45:00'),
    },
    {
        id: 'facebook-ads',
        name: 'Facebook Ads',
        description: 'Connect to Meta Ads Manager for social advertising data.',
        icon: '📱',
        connected: 0,
        total: 0,
        status: 'coming_soon',
        lastSync: null,
    },
    {
        id: 'linkedin-ads',
        name: 'LinkedIn Ads',
        description: 'Connect to LinkedIn Campaign Manager for B2B advertising.',
        icon: '💼',
        connected: 0,
        total: 0,
        status: 'coming_soon',
        lastSync: null,
    },
];

const statusConfig: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
    connected: { label: 'Connected', variant: 'success', icon: <CheckCircle2 className="h-4 w-4" /> },
    partial: { label: 'Partial', variant: 'warning', icon: <AlertCircle className="h-4 w-4" /> },
    disconnected: { label: 'Not Connected', variant: 'secondary', icon: null },
    coming_soon: { label: 'Coming Soon', variant: 'outline', icon: null },
};

export default function IntegrationsPage() {
    const handleConnect = (integrationId: string) => {
        // TODO: Implement OAuth flow
        console.log('Connecting:', integrationId);
    };

    const handleSync = (integrationId: string) => {
        // TODO: Implement sync
        console.log('Syncing:', integrationId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
                <p className="text-muted-foreground">Connect your data sources to pull analytics into reports.</p>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Link2 className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">35 Connected Accounts</h3>
                                    <p className="text-sm text-muted-foreground">Across 3 integrations</p>
                                </div>
                            </div>
                            <Button variant="gradient">
                                <Plus className="h-4 w-4 mr-2" />
                                Connect New
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Integrations Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {integrations.map((integration, index) => (
                    <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">{integration.icon}</div>
                                        <div>
                                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                                            <Badge
                                                variant={statusConfig[integration.status].variant as any}
                                                className="mt-1"
                                            >
                                                {statusConfig[integration.status].icon}
                                                <span className="ml-1">{statusConfig[integration.status].label}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <CardDescription className="mt-2">
                                    {integration.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {integration.status !== 'coming_soon' ? (
                                    <>
                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Connected Clients</span>
                                                <span className="font-medium">{integration.connected}/{integration.total}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all"
                                                    style={{ width: `${(integration.connected / Math.max(integration.total, 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Last Sync */}
                                        {integration.lastSync && (
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Last synced: {integration.lastSync.toLocaleString()}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {integration.status === 'connected' || integration.status === 'partial' ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSync(integration.id)}
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-1" />
                                                        Sync
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        Manage
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="gradient"
                                                    size="sm"
                                                    onClick={() => handleConnect(integration.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Connect
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-muted-foreground">
                                            This integration will be available soon.
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-3" disabled>
                                            Coming Soon
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Help Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">Need help connecting?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Check out our documentation for step-by-step guides on setting up integrations.
                                </p>
                            </div>
                            <Button variant="outline">
                                <ExternalLink className="h-4  w-4 mr-2" />
                                View Documentation
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
