import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const settings = await prisma.adminSettings.findFirst();
    return NextResponse.json({ setupComplete: !!settings });
  } catch (error) {
    console.error('Error checking setup:', error);
    return NextResponse.json({ setupComplete: false });
  }
}
