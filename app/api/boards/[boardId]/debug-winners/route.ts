import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getGameById } from '@/lib/espn-api';

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
      },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const gameData = await getGameById(board.gameId);

    const rowNumbers = board.rowNumbers ? JSON.parse(board.rowNumbers) : null;
    const colNumbers = board.colNumbers ? JSON.parse(board.colNumbers) : null;

    return NextResponse.json({
      board: {
        id: board.id,
        name: board.name,
        isFinalized: board.isFinalized,
        hasRowNumbers: !!board.rowNumbers,
        hasColNumbers: !!board.colNumbers,
        rowNumbers,
        colNumbers,
      },
      gameData: gameData ? {
        status: gameData.status,
        homeTeam: {
          name: gameData.homeTeam.name,
          score: gameData.homeTeam.score,
        },
        awayTeam: {
          name: gameData.awayTeam.name,
          score: gameData.awayTeam.score,
        },
      } : null,
      existingWinners: board.winners,
      filledSquaresCount: board.squares.filter(s => s.playerName).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
