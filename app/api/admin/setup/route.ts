import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, validatePIN, validatePassword } from '@/lib/auth';
import { setAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { pin, password } = await request.json();

    // Validate inputs
    if (!validatePIN(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4 or 6 digits' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if setup already exists
    const existing = await prisma.adminSettings.findFirst();
    if (existing) {
      return NextResponse.json(
        { error: 'Setup already complete' },
        { status: 400 }
      );
    }

    // Hash PIN and password
    const hashedPIN = await hashPassword(pin);
    const hashedPassword = await hashPassword(password);

    // Create admin settings
    await prisma.adminSettings.create({
      data: {
        pin: hashedPIN,
        password: hashedPassword,
        enableOnScreenKeyboard: false,
      },
    });

    // Set admin session
    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to complete setup' },
      { status: 500 }
    );
  }
}
