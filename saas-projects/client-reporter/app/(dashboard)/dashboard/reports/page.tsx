'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    Clock,
    Download,
    Mail,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dropdown } from '@/components/ui/dropdown';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

// Mock data
const reports = [
    {
        id: '1',
        name: 'January 2025 Report',
        clientName: 'Acme Corporation',
        dateFrom: new Date('2025-01-01'),
        dateTo: new Date('2025-01-31'),
        status: 'sent',
        createdAt: new Date('2025-01-28'),
        pdfUrl: '/reports/1.pdf',
    },
    {
        id: '2',
        name: 'Q4 2024 Performance',
        clientName: 'TechStart Inc',
        dateFrom: new Date('2024-10-01'),
        dateTo: new Date('2024-12-31'),
        status: 'completed',
        createdAt: new Date('2025-01-27'),
        pdfUrl: '/reports/2.pdf',
    },
    {
        id: '3',
        name: 'Weekly Update',
        clientName: 'Growth Agency',
        dateFrom: new Date('2025-01-20'),
        dateTo: new Date('2025-01-26'),
        status: 'draft',
        createdAt: new Date('2025-01-25'),
        pdfUrl: null,
    },
    {
        id: '4',
        name: 'December Report',
        clientName: 'Digital First',
        dateFrom: new Date('2024-12-01'),
        dateTo: new Date('2024-12-31'),
        status: 'generating',
        createdAt: new Date('2025-01-24'),
        pdfUrl: null,
    },
];

const statusConfig: Record<string, { label: string; variant: string }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    generating: { label: 'Generating', variant: 'warning' },
    completed: { label: 'Completed', variant: 'default' },
    sent: { label: 'Sent', variant: 'success' },
    failed: { label: 'Failed', variant: 'destructive' },
};

export default function ReportsPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<'all' | 'scheduled'>('all');

    const filteredReports = reports.filter((report) =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.clientName.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-2xl font-bold text-foreground">Reports</h1>
                    <p className="text-muted-foreground">Create and manage client reports.</p>
                </div>
                <Link href="/dashboard/reports/new">
                    <Button variant="gradient">
                        <Plus className="h-4 w-4 mr-2" />
                        New Report
                    </Button>
                </Link>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2"
            >
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                >
                    All Reports
                </button>
                <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'scheduled'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                >
                    <Clock className="h-4 w-4 inline-block mr-1" />
                    Scheduled
                </button>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    icon={<Search className="h-4 w-4" />}
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Reports Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Report</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date Range</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="font-medium">{report.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {report.clientName}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(report.dateFrom)} - {formatDate(report.dateTo)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusConfig[report.status].variant as any}>
                                            {statusConfig[report.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(report.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {report.pdfUrl && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {report.status === 'completed' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Dropdown
                                                trigger={
                                                    <button className="p-1 rounded-lg hover:bg-accent transition-colors">
                                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                    </button>
                                                }
                                                items={[
                                                    { label: 'View', value: 'view', icon: <Eye className="h-4 w-4" /> },
                                                    { label: 'Edit', value: 'edit', icon: <Edit className="h-4 w-4" /> },
                                                    { label: 'Delete', value: 'delete', icon: <Trash2 className="h-4 w-4" />, danger: true },
                                                ]}
                                                onSelect={(value) => console.log(value, report.id)}
                                                align="right"
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </motion.div>

            {/* Empty State */}
            {filteredReports.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery ? 'Try a different search term' : 'Create your first report'}
                            </p>
                            <Link href="/dashboard/reports/new">
                                <Button variant="gradient">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Report
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
