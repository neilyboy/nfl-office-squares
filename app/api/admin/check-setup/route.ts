import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Checking if setup is complete...');
    
    // Get count first
    const count = await prisma.adminSettings.count();
    console.log(`📊 Total AdminSettings records: ${count}`);
    
    const settings = await prisma.adminSettings.findFirst();
    const isComplete = !!settings;
    console.log(`✅ Setup check result: ${isComplete ? 'COMPLETE' : 'NOT COMPLETE'}`);
    if (settings) {
      console.log(`📋 Found admin settings with ID: ${settings.id}, PIN length: ${settings.pin?.length || 0}`);
    } else {
      console.log('⚠️  No admin settings found in database!');
    }
    return NextResponse.json({ setupComplete: isComplete });
  } catch (error) {
    console.error('❌ Error checking setup:', error);
    console.error('Error details:', error);
    return NextResponse.json({ setupComplete: false });
  }
}
