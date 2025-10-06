import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const board = await prisma.board.findUnique({
      where: { id: params.boardId },
      include: {
        squares: true,
        winners: true,
        paymentConfig: true,
      },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const body = await request.json();
    
    const board = await prisma.board.update({
      where: { id: params.boardId },
      data: body,
      include: {
        squares: true,
        winners: true,
        paymentConfig: true,
      },
    });

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    // Delete in order to handle foreign key constraints
    // First delete winners
    await prisma.winner.deleteMany({
      where: { boardId: params.boardId },
    });

    // Delete squares
    await prisma.square.deleteMany({
      where: { boardId: params.boardId },
    });

    // Delete payment config
    await prisma.paymentConfig.deleteMany({
      where: { boardId: params.boardId },
    });

    // Finally delete the board
    await prisma.board.delete({
      where: { id: params.boardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}
