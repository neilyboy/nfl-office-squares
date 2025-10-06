import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getGameById } from '@/lib/espn-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeGameData = searchParams.get('includeGameData') !== 'false';

    // Fetch all non-archived boards with related data
    const boards = await prisma.board.findMany({
      where: {
        status: {
          not: 'archived',
        },
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

    // Only fetch live game data if requested (for main page, not admin)
    const boardsWithGameData = includeGameData 
      ? await Promise.all(
          boards.map(async (board) => {
            let gameData = null;
            try {
              gameData = await getGameById(board.gameId);
            } catch (error) {
              console.error(`Failed to fetch game data for board ${board.id}:`, error);
            }

            return {
              ...board,
              rowNumbers: board.rowNumbers ? JSON.parse(board.rowNumbers) : null,
              colNumbers: board.colNumbers ? JSON.parse(board.colNumbers) : null,
              gameData,
            };
          })
        )
      : boards.map((board) => ({
          ...board,
          rowNumbers: board.rowNumbers ? JSON.parse(board.rowNumbers) : null,
          colNumbers: board.colNumbers ? JSON.parse(board.colNumbers) : null,
          gameData: null,
        }));

    return NextResponse.json({ boards: boardsWithGameData });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}
