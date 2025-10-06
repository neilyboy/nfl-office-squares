import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  try {
    const settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const session = await getAdminSession();

    return NextResponse.json({
      settings: {
        enableOnScreenKeyboard: settings.enableOnScreenKeyboard,
      },
      isAdmin: !!session,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Check admin session
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { enableOnScreenKeyboard } = await request.json();

    const settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    await prisma.adminSettings.update({
      where: { id: settings.id },
      data: { enableOnScreenKeyboard },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
