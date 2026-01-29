'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    FileText,
    Mail,
    Calendar,
    CheckCircle2,
    Star,
    Menu,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
    {
        icon: <BarChart3 className="h-6 w-6" />,
        title: 'Google Analytics Integration',
        description: 'Connect GA4, Search Console, and Ads to pull real-time data into beautiful reports.',
    },
    {
        icon: <FileText className="h-6 w-6" />,
        title: 'PDF Report Generation',
        description: 'Generate professional, white-labeled PDF reports in seconds with your branding.',
    },
    {
        icon: <Mail className="h-6 w-6" />,
        title: 'Automated Email Delivery',
        description: 'Schedule reports to be automatically sent to clients weekly or monthly.',
    },
    {
        icon: <Calendar className="h-6 w-6" />,
        title: 'Scheduled Reports',
        description: 'Set it and forget it. Reports generate and deliver automatically on schedule.',
    },
];

const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'Digital Marketing Director',
        company: 'Growth Agency',
        content: 'ClientReporter has saved us 20+ hours per month on report creation. Our clients love the professional look!',
        avatar: '/avatars/sarah.jpg',
    },
    {
        name: 'Michael Chen',
        role: 'SEO Manager',
        company: 'Rank Higher LLC',
        content: 'The automated scheduling feature is a game-changer. Reports go out on time, every time.',
        avatar: '/avatars/michael.jpg',
    },
    {
        name: 'Emily Rodriguez',
        role: 'Agency Owner',
        company: 'Digital First Agency',
        content: 'Finally, a reporting tool that looks as good as our work. White-labeling is perfect.',
        avatar: '/avatars/emily.jpg',
    },
];

const pricingPlans = [
    {
        name: 'Starter',
        price: 29,
        description: 'Perfect for freelancers and small teams',
        features: [
            '5 Clients',
            '10 Reports/month',
            'Google Analytics',
            'PDF Export',
            'Email Support',
        ],
    },
    {
        name: 'Professional',
        price: 79,
        description: 'For growing agencies',
        features: [
            '25 Clients',
            'Unlimited Reports',
            'All Integrations',
            'White-label Branding',
            'Scheduled Reports',
            'Priority Support',
        ],
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 199,
        description: 'For large agencies',
        features: [
            'Unlimited Clients',
            'Unlimited Reports',
            'All Integrations',
            'Custom Branding',
            'API Access',
            'Dedicated Support',
            'Custom Templates',
        ],
    },
];

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">ClientReporter</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                Features
                            </Link>
                            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                Pricing
                            </Link>
                            <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                                Testimonials
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="gradient">Get Started</Button>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden border-t border-border bg-background p-4 space-y-4"
                    >
                        <Link href="#features" className="block text-muted-foreground">Features</Link>
                        <Link href="#pricing" className="block text-muted-foreground">Pricing</Link>
                        <Link href="#testimonials" className="block text-muted-foreground">Testimonials</Link>
                        <hr className="border-border" />
                        <Link href="/login" className="block"><Button variant="ghost" className="w-full">Sign In</Button></Link>
                        <Link href="/register" className="block"><Button variant="gradient" className="w-full">Get Started</Button></Link>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/20 via-purple-500/10 to-transparent blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-sm text-primary font-medium">New: Google Ads Integration Now Available</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                            Beautiful Client Reports{' '}
                            <span className="gradient-text">In Minutes, Not Hours</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                            Stop wasting time on manual reporting. Automatically pull data from Google Analytics,
                            create stunning PDF reports, and deliver them to clients on schedule.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/register">
                                <Button variant="gradient" size="xl" className="shadow-xl shadow-primary/25">
                                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="xl">
                                Watch Demo
                            </Button>
                        </div>

                        <p className="mt-4 text-sm text-muted-foreground">
                            ✓ 14-day free trial &nbsp; ✓ No credit card required &nbsp; ✓ Cancel anytime
                        </p>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-16 relative"
                    >
                        <div className="relative rounded-2xl border border-border bg-card/50 p-2 shadow-2xl shadow-black/20 backdrop-blur-sm">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background via-transparent to-transparent" />
                            <div className="rounded-xl bg-background/80 overflow-hidden">
                                {/* Mock Dashboard */}
                                <div className="h-[400px] sm:h-[500px] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                                    <div className="text-center">
                                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Dashboard Preview</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating elements */}
                        <div className="absolute -left-4 top-1/4 animate-float">
                            <Card variant="glass" className="p-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Report Sent!</p>
                                        <p className="text-xs text-muted-foreground">To client@example.com</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="absolute -right-4 top-1/3 animate-float delay-500">
                            <Card variant="glass" className="p-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                        <BarChart3 className="h-5 w-5 text-violet-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">+23.5%</p>
                                        <p className="text-xs text-muted-foreground">Traffic Growth</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Everything You Need to <span className="gradient-text">Impress Clients</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Powerful features designed specifically for digital marketing agencies and consultants.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card hover className="p-6 h-full">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary">{feature.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                            <p className="text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Simple, Transparent <span className="gradient-text">Pricing</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Start free and scale as you grow. No hidden fees.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <Card
                                    className={`p-6 h-full ${plan.popular ? 'border-primary shadow-xl shadow-primary/10' : ''}`}
                                >
                                    <CardContent className="p-0">
                                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                        <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                                        <div className="mb-6">
                                            <span className="text-4xl font-bold">${plan.price}</span>
                                            <span className="text-muted-foreground">/month</span>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            variant={plan.popular ? 'gradient' : 'outline'}
                                            className="w-full"
                                        >
                                            Get Started
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Loved by <span className="gradient-text">Agencies Worldwide</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            See what our customers have to say about ClientReporter.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="p-6 h-full">
                                    <CardContent className="p-0">
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <p className="text-foreground mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-medium">
                                                {testimonial.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{testimonial.name}</p>
                                                <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Card variant="gradient" className="p-8 sm:p-12 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-90" />
                            <div className="relative z-10">
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                    Ready to Impress Your Clients?
                                </h2>
                                <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                                    Join thousands of agencies creating beautiful reports. Start your free trial today.
                                </p>
                                <Link href="/register">
                                    <Button variant="secondary" size="xl" className="shadow-xl">
                                        Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">ClientReporter</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
                            <Link href="/terms" className="hover:text-foreground">Terms</Link>
                            <Link href="/contact" className="hover:text-foreground">Contact</Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 ClientReporter. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
