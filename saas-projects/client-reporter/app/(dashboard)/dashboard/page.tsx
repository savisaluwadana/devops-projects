'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Users,
    FileText,
    Link2,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Plus,
    Calendar,
    Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

// Mock data - replace with real API calls
const stats = [
    {
        title: 'Total Clients',
        value: '24',
        change: '+12%',
        trend: 'up',
        icon: <Users className="h-5 w-5" />,
    },
    {
        title: 'Reports Generated',
        value: '156',
        change: '+23%',
        trend: 'up',
        icon: <FileText className="h-5 w-5" />,
    },
    {
        title: 'Active Integrations',
        value: '18',
        change: '+5%',
        trend: 'up',
        icon: <Link2 className="h-5 w-5" />,
    },
    {
        title: 'Reports This Month',
        value: '42',
        change: '-8%',
        trend: 'down',
        icon: <Calendar className="h-5 w-5" />,
    },
];

const recentReports = [
    {
        id: '1',
        clientName: 'Acme Corp',
        dateRange: 'Jan 1 - Jan 31, 2025',
        status: 'sent',
        createdAt: new Date('2025-01-28'),
    },
    {
        id: '2',
        clientName: 'TechStart Inc',
        dateRange: 'Jan 1 - Jan 31, 2025',
        status: 'completed',
        createdAt: new Date('2025-01-27'),
    },
    {
        id: '3',
        clientName: 'Growth Agency',
        dateRange: 'Dec 1 - Dec 31, 2024',
        status: 'draft',
        createdAt: new Date('2025-01-25'),
    },
    {
        id: '4',
        clientName: 'Digital First',
        dateRange: 'Jan 1 - Jan 15, 2025',
        status: 'generating',
        createdAt: new Date('2025-01-24'),
    },
];

const integrationStatus = [
    { name: 'Google Analytics 4', connected: 15, total: 20, icon: '📊' },
    { name: 'Search Console', connected: 12, total: 20, icon: '🔍' },
    { name: 'Google Ads', connected: 8, total: 20, icon: '📢' },
];

const quickActions = [
    { label: 'New Report', href: '/dashboard/reports/new', icon: <FileText className="h-4 w-4" /> },
    { label: 'Add Client', href: '/dashboard/clients/new', icon: <Users className="h-4 w-4" /> },
    { label: 'Connect Integration', href: '/dashboard/integrations', icon: <Link2 className="h-4 w-4" /> },
];

const statusColors: Record<string, string> = {
    sent: 'success',
    completed: 'default',
    draft: 'secondary',
    generating: 'warning',
    failed: 'destructive',
};

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Welcome back! 👋</h1>
                    <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    {quickActions.map((action) => (
                        <Link key={action.href} href={action.href}>
                            <Button variant="outline" size="sm">
                                {action.icon}
                                <span className="hidden sm:inline ml-2">{action.label}</span>
                            </Button>
                        </Link>
                    ))}
                    <Link href="/dashboard/reports/new">
                        <Button variant="gradient">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Report
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="metric-card">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        {stat.icon}
                                    </div>
                                    <Badge
                                        variant={stat.trend === 'up' ? 'success' : 'destructive'}
                                        className="flex items-center gap-1"
                                    >
                                        {stat.trend === 'up' ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        {stat.change}
                                    </Badge>
                                </div>
                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Reports */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Reports</CardTitle>
                            <Link href="/dashboard/reports">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Date Range</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">{report.clientName}</TableCell>
                                            <TableCell className="text-muted-foreground">{report.dateRange}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusColors[report.status] as any}>
                                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(report.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Integration Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Integration Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {integrationStatus.map((integration) => (
                                <div key={integration.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{integration.icon}</span>
                                            <span className="text-sm font-medium">{integration.name}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {integration.connected}/{integration.total}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full transition-all"
                                            style={{ width: `${(integration.connected / integration.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Link href="/dashboard/integrations">
                                <Button variant="outline" className="w-full mt-4">
                                    <Link2 className="h-4 w-4 mr-2" />
                                    Manage Integrations
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Scheduled Reports */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            Upcoming Scheduled Reports
                        </CardTitle>
                        <Link href="/dashboard/reports?tab=scheduled">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No scheduled reports yet</p>
                            <p className="text-sm">Set up automated reports to save time</p>
                            <Link href="/dashboard/reports/new?schedule=true">
                                <Button variant="outline" className="mt-4">
                                    Schedule Your First Report
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
