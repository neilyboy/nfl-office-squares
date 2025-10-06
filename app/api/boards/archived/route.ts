import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  try {
    // Check admin session
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const boards = await prisma.board.findMany({
      where: {
        status: 'archived',
      },
      include: {
        squares: true,
        winners: true,
        paymentConfig: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const boardsWithParsedData = boards.map((board) => ({
      ...board,
      rowNumbers: board.rowNumbers ? JSON.parse(board.rowNumbers) : null,
      colNumbers: board.colNumbers ? JSON.parse(board.colNumbers) : null,
    }));

    return NextResponse.json({ boards: boardsWithParsedData });
  } catch (error) {
    console.error('Error fetching archived boards:', error);
    return NextResponse.json({ error: 'Failed to fetch archived boards' }, { status: 500 });
  }
}
