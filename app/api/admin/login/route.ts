import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { setAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Get admin settings
    const settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      return NextResponse.json(
        { error: 'Setup not complete' },
        { status: 404 }
      );
    }

    // Verify PIN
    const isValid = await verifyPassword(pin, settings.pin);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Set admin session
    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
