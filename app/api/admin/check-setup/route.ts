import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Checking if setup is complete...');
    const settings = await prisma.adminSettings.findFirst();
    const isComplete = !!settings;
    console.log(`✅ Setup check result: ${isComplete ? 'COMPLETE' : 'NOT COMPLETE'}`);
    if (settings) {
      console.log(`📋 Found admin settings with ID: ${settings.id}`);
    }
    return NextResponse.json({ setupComplete: isComplete });
  } catch (error) {
    console.error('❌ Error checking setup:', error);
    return NextResponse.json({ setupComplete: false });
  }
}
