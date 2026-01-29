'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const features = [
    'Unlimited client reports',
    'Google Analytics integration',
    'Custom branding',
    'PDF export',
    'Team collaboration',
];

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Something went wrong');
                return;
            }

            // Redirect to login with success message
            router.push('/login?registered=true');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl grid lg:grid-cols-2 gap-8"
            >
                {/* Left side - Benefits */}
                <div className="hidden lg:flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-4">
                        Start creating{' '}
                        <span className="gradient-text">beautiful reports</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Join thousands of agencies who save time and impress clients with professional, automated reports.
                    </p>
                    <ul className="space-y-4">
                        {features.map((feature, index) => (
                            <motion.li
                                key={feature}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                className="flex items-center gap-3"
                            >
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-foreground">{feature}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Right side - Form */}
                <div>
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <svg
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold gradient-text">ClientReporter</span>
                        </Link>
                        <p className="mt-2 text-muted-foreground">Create your free account</p>
                    </div>

                    <Card variant="glass" className="backdrop-blur-xl">
                        <CardContent className="p-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <Input
                                    label="Full Name"
                                    type="text"
                                    placeholder="John Doe"
                                    icon={<User className="h-4 w-4" />}
                                    error={errors.name?.message}
                                    {...register('name')}
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    icon={<Mail className="h-4 w-4" />}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />

                                <div className="relative">
                                    <Input
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a strong password"
                                        icon={<Lock className="h-4 w-4" />}
                                        error={errors.password?.message}
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                <Input
                                    label="Confirm Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    icon={<Lock className="h-4 w-4" />}
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword')}
                                />

                                <Button
                                    type="submit"
                                    variant="gradient"
                                    className="w-full"
                                    size="lg"
                                    isLoading={isLoading}
                                >
                                    {!isLoading && (
                                        <>
                                            Create Account <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>

                            <p className="mt-4 text-center text-xs text-muted-foreground">
                                By creating an account, you agree to our{' '}
                                <Link href="/terms" className="underline hover:text-foreground">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="underline hover:text-foreground">
                                    Privacy Policy
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
