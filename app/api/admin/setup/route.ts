import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, validatePIN, validatePassword } from '@/lib/auth';
import { setAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    console.log('📝 Setup: Starting setup process...');
    const { pin, password } = await request.json();
    console.log('📝 Setup: Received PIN and password');

    // Validate inputs
    if (!validatePIN(pin)) {
      console.log('❌ Setup: Invalid PIN format');
      return NextResponse.json(
        { error: 'PIN must be 4 or 6 digits' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      console.log('❌ Setup: Invalid password format');
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if setup already exists
    console.log('📝 Setup: Checking if setup already exists...');
    const existing = await prisma.adminSettings.findFirst();
    if (existing) {
      console.log('❌ Setup: Setup already complete');
      return NextResponse.json(
        { error: 'Setup already complete' },
        { status: 400 }
      );
    }
    console.log('✅ Setup: No existing setup found');

    // Hash PIN and password
    console.log('🔐 Setup: Hashing PIN and password...');
    const hashedPIN = await hashPassword(pin);
    const hashedPassword = await hashPassword(password);
    console.log('✅ Setup: Hashing complete');

    // Create admin settings
    console.log('💾 Setup: Creating admin settings in database...');
    await prisma.adminSettings.create({
      data: {
        pin: hashedPIN,
        password: hashedPassword,
        enableOnScreenKeyboard: false,
      },
    });
    console.log('✅ Setup: Admin settings created');

    // Set admin session
    console.log('🔑 Setup: Setting admin session...');
    await setAdminSession();
    console.log('✅ Setup: Session set');

    console.log('🎉 Setup: Setup complete!');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Setup error:', error);
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    return NextResponse.json(
      { error: 'Failed to complete setup: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
