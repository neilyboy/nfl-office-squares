import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { squareId: string } }
) {
  try {
    const body = await request.json();
    
    const square = await prisma.square.update({
      where: { id: params.squareId },
      data: body,
    });

    return NextResponse.json({ square });
  } catch (error) {
    console.error('Error updating square:', error);
    return NextResponse.json({ error: 'Failed to update square' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { squareId: string } }
) {
  try {
    await prisma.square.delete({
      where: { id: params.squareId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting square:', error);
    return NextResponse.json({ error: 'Failed to delete square' }, { status: 500 });
  }
}
