'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/dropdown';
import Link from 'next/link';

const clientSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    industry: z.string().optional(),
    description: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const industries = [
    { label: 'Technology', value: 'technology' },
    { label: 'E-commerce', value: 'ecommerce' },
    { label: 'SaaS', value: 'saas' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Finance', value: 'finance' },
    { label: 'Education', value: 'education' },
    { label: 'Other', value: 'other' },
];

export default function NewClientPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [industry, setIndustry] = React.useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
    });

    const onSubmit = async (data: ClientFormData) => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, industry }),
            });

            if (response.ok) {
                router.push('/dashboard/clients');
            }
        } catch (error) {
            console.error('Error creating client:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <Link href="/dashboard/clients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Add New Client</h1>
                    <p className="text-muted-foreground">Create a new client account</p>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Client Information
                        </CardTitle>
                        <CardDescription>
                            Enter the details for your new client
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Logo
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center">
                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <Button type="button" variant="outline">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Logo
                                    </Button>
                                </div>
                            </div>

                            {/* Name */}
                            <Input
                                label="Client Name *"
                                placeholder="Enter client name"
                                error={errors.name?.message}
                                {...register('name')}
                            />

                            {/* Email */}
                            <Input
                                label="Email"
                                type="email"
                                placeholder="client@example.com"
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            {/* Website */}
                            <Input
                                label="Website"
                                type="url"
                                placeholder="https://example.com"
                                error={errors.website?.message}
                                {...register('website')}
                            />

                            {/* Industry */}
                            <Select
                                label="Industry"
                                options={industries}
                                value={industry}
                                onChange={setIndustry}
                                placeholder="Select industry"
                            />

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-sm transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary backdrop-blur-sm resize-none"
                                    placeholder="Add notes about this client..."
                                    {...register('description')}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                <Link href="/dashboard/clients">
                                    <Button type="button" variant="ghost">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" variant="gradient" isLoading={isLoading}>
                                    Create Client
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
