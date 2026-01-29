'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Users,
    CreditCard,
    Palette,
    Bell,
    Shield,
    Mail,
    Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'branding', label: 'Branding', icon: <Palette className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
];

// Mock team data
const teamMembers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'OWNER', avatar: null },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN', avatar: null },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'MEMBER', avatar: null },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = React.useState('profile');
    const [profileData, setProfileData] = React.useState({
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Growth Agency',
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account and team settings.</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:w-64 shrink-0"
                >
                    <Card>
                        <CardContent className="p-2">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                            }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1"
                >
                    {activeTab === 'profile' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>
                                    Manage your personal information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar */}
                                <div className="flex items-center gap-4">
                                    <Avatar name={profileData.name} size="xl" />
                                    <div>
                                        <Button variant="outline" size="sm">
                                            Change Avatar
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            JPG, PNG or GIF. Max 2MB.
                                        </p>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Input
                                        label="Full Name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                    <Input
                                        label="Company"
                                        value={profileData.company}
                                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                        className="md:col-span-2"
                                    />
                                </div>

                                <div className="flex justify-end pt-4 border-t border-border">
                                    <Button variant="gradient">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'team' && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Team Members</CardTitle>
                                    <CardDescription>
                                        Manage your team and permissions
                                    </CardDescription>
                                </div>
                                <Button variant="gradient">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Invite Member
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {teamMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar name={member.name} size="md" />
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant={member.role === 'OWNER' ? 'gradient' : 'secondary'}>
                                                {member.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Plan</CardTitle>
                                    <CardDescription>
                                        Manage your subscription
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-primary/20">
                                        <div>
                                            <Badge variant="gradient" className="mb-2">Professional</Badge>
                                            <h3 className="text-2xl font-bold">$79/month</h3>
                                            <p className="text-sm text-muted-foreground">25 clients, unlimited reports</p>
                                        </div>
                                        <Button variant="outline">Change Plan</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-16 bg-card rounded flex items-center justify-center border">
                                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">•••• •••• •••• 4242</p>
                                                <p className="text-sm text-muted-foreground">Expires 12/26</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Update</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'branding' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>White-Label Branding</CardTitle>
                                <CardDescription>
                                    Customize reports with your brand
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Logo */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Logo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center">
                                            <Palette className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <Button variant="outline">Upload Logo</Button>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Primary Color</label>
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-lg bg-primary" />
                                            <Input defaultValue="#7c3aed" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Secondary Color</label>
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-lg bg-purple-600" />
                                            <Input defaultValue="#9333ea" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-border">
                                    <Button variant="gradient">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Branding
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Choose how you want to be notified
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { label: 'Report generated', description: 'Get notified when a report is ready' },
                                    { label: 'Report sent', description: 'Get notified when a report is emailed' },
                                    { label: 'New team member', description: 'Get notified when someone joins your team' },
                                    { label: 'Integration issues', description: 'Get notified about integration problems' },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                                    >
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-5 w-5 rounded border-input accent-primary"
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
