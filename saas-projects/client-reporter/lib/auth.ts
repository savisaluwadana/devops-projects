import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const authConfig: NextAuthConfig = {
    adapter: PrismaAdapter(db),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    throw new Error('Invalid credentials');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async signIn({ user, account }) {
            // Allow OAuth without email verification
            if (account?.provider !== 'credentials') {
                return true;
            }

            // For credentials, check if user exists
            const existingUser = await db.user.findUnique({
                where: { id: user.id },
            });

            if (!existingUser) {
                return false;
            }

            return true;
        },
    },
    events: {
        async createUser({ user }) {
            // Create default team for new users
            if (user.id && user.email) {
                await db.team.create({
                    data: {
                        name: `${user.name || 'My'}'s Team`,
                        slug: `team-${user.id.slice(0, 8)}`,
                        ownerId: user.id,
                        members: {
                            create: {
                                userId: user.id,
                                role: 'OWNER',
                            },
                        },
                    },
                });
            }
        },
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
