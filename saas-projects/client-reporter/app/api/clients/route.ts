import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const clientSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional().nullable(),
    website: z.string().url().optional().nullable(),
    industry: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
});

// GET all clients for the team
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's team
        const teamMember = await db.teamMember.findFirst({
            where: { userId: session.user.id },
            include: { team: true },
        });

        if (!teamMember) {
            return NextResponse.json({ error: 'No team found' }, { status: 404 });
        }

        const clients = await db.client.findMany({
            where: { teamId: teamMember.teamId },
            include: {
                integrations: true,
                _count: {
                    select: { reports: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST create a new client
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const data = clientSchema.parse(body);

        // Get user's team
        const teamMember = await db.teamMember.findFirst({
            where: { userId: session.user.id },
            include: { team: true },
        });

        if (!teamMember) {
            return NextResponse.json({ error: 'No team found' }, { status: 404 });
        }

        const client = await db.client.create({
            data: {
                teamId: teamMember.teamId,
                name: data.name,
                email: data.email || null,
                website: data.website || null,
                industry: data.industry || null,
                description: data.description || null,
            },
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }

        console.error('Error creating client:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
