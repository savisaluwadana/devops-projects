'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Users,
    Layout,
    FileText,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/dropdown';
import { Input } from '@/components/ui/input';

// Mock data
const clients = [
    { label: 'Acme Corporation', value: '1' },
    { label: 'TechStart Inc', value: '2' },
    { label: 'Growth Agency', value: '3' },
    { label: 'Digital First', value: '4' },
];

const templates = [
    { label: 'SEO Performance Report', value: 'seo' },
    { label: 'Paid Ads Report', value: 'ads' },
    { label: 'Social Media Report', value: 'social' },
    { label: 'Custom Report', value: 'custom' },
];

const steps = [
    { id: 1, title: 'Select Client', icon: <Users className="h-5 w-5" /> },
    { id: 2, title: 'Date Range', icon: <Calendar className="h-5 w-5" /> },
    { id: 3, title: 'Template', icon: <Layout className="h-5 w-5" /> },
    { id: 4, title: 'Review', icon: <FileText className="h-5 w-5" /> },
];

export default function NewReportPage() {
    const [currentStep, setCurrentStep] = React.useState(1);
    const [formData, setFormData] = React.useState({
        clientId: '',
        dateFrom: '',
        dateTo: '',
        templateId: '',
        name: '',
    });

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCreate = async () => {
        // TODO: Implement report creation
        console.log('Creating report:', formData);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <Link href="/dashboard/reports">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Create New Report</h1>
                    <p className="text-muted-foreground">Build a report for your client</p>
                </div>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${currentStep > step.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : currentStep === step.id
                                                        ? 'bg-primary/10 text-primary border-2 border-primary'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {currentStep > step.id ? (
                                                <CheckCircle2 className="h-6 w-6" />
                                            ) : (
                                                step.icon
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                                                }`}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-4 rounded-full ${currentStep > step.id ? 'bg-primary' : 'bg-muted'
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Step Content */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card>
                    {currentStep === 1 && (
                        <>
                            <CardHeader>
                                <CardTitle>Select Client</CardTitle>
                                <CardDescription>
                                    Choose the client for this report
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Select
                                    label="Client"
                                    options={clients}
                                    value={formData.clientId}
                                    onChange={(value) => setFormData({ ...formData, clientId: value })}
                                    placeholder="Select a client"
                                />
                            </CardContent>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <CardHeader>
                                <CardTitle>Select Date Range</CardTitle>
                                <CardDescription>
                                    Choose the reporting period
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="From"
                                        type="date"
                                        value={formData.dateFrom}
                                        onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                                    />
                                    <Input
                                        label="To"
                                        type="date"
                                        value={formData.dateTo}
                                        onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const now = new Date();
                                            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                                            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                                            setFormData({
                                                ...formData,
                                                dateFrom: lastMonth.toISOString().split('T')[0],
                                                dateTo: lastDay.toISOString().split('T')[0],
                                            });
                                        }}
                                    >
                                        Last Month
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const now = new Date();
                                            const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
                                            const endOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0);
                                            setFormData({
                                                ...formData,
                                                dateFrom: startOfQuarter.toISOString().split('T')[0],
                                                dateTo: endOfQuarter.toISOString().split('T')[0],
                                            });
                                        }}
                                    >
                                        Last Quarter
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
                            <CardHeader>
                                <CardTitle>Choose Template</CardTitle>
                                <CardDescription>
                                    Select a report template
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {templates.map((template) => (
                                        <button
                                            key={template.value}
                                            onClick={() => setFormData({ ...formData, templateId: template.value })}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.templateId === template.value
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                                <Layout className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="font-medium">{template.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </>
                    )}

                    {currentStep === 4 && (
                        <>
                            <CardHeader>
                                <CardTitle>Review & Create</CardTitle>
                                <CardDescription>
                                    Review your report settings before creating
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Input
                                    label="Report Name"
                                    placeholder="Enter a name for this report"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />

                                <div className="space-y-3 p-4 rounded-xl bg-muted/50">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Client</span>
                                        <span className="font-medium">
                                            {clients.find((c) => c.value === formData.clientId)?.label || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date Range</span>
                                        <span className="font-medium">
                                            {formData.dateFrom} to {formData.dateTo}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Template</span>
                                        <span className="font-medium">
                                            {templates.find((t) => t.value === formData.templateId)?.label || '-'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                </Button>
                {currentStep < 4 ? (
                    <Button variant="gradient" onClick={handleNext}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button variant="gradient" onClick={handleCreate}>
                        Create Report
                        <FileText className="h-4 w-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
}
