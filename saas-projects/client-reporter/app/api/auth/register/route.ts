import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Create default team
        await db.team.create({
            data: {
                name: `${name}'s Team`,
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

        return NextResponse.json(
            { message: 'User created successfully', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
