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

    // Create export data structure
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      board: {
        name: board.name,
        gameId: board.gameId,
        teamHome: board.teamHome,
        teamAway: board.teamAway,
        costPerSquare: board.costPerSquare,
        status: board.status,
        isFinalized: board.isFinalized,
        rowNumbers: board.rowNumbers,
        colNumbers: board.colNumbers,
        payoutType: board.payoutType,
        payoutQ1: board.payoutQ1,
        payoutQ2: board.payoutQ2,
        payoutQ3: board.payoutQ3,
        payoutQ4: board.payoutQ4,
      },
      squares: board.squares.map(s => ({
        row: s.row,
        col: s.col,
        playerName: s.playerName,
        paymentMethod: s.paymentMethod,
        isPaid: s.isPaid,
      })),
      winners: board.winners.map(w => ({
        quarter: w.quarter,
        playerName: w.playerName,
        scoreHome: w.scoreHome,
        scoreAway: w.scoreAway,
        payout: w.payout,
      })),
      paymentConfig: board.paymentConfig ? {
        venmoUsername: board.paymentConfig.venmoUsername,
        paypalUsername: board.paymentConfig.paypalUsername,
        allowCash: board.paymentConfig.allowCash,
        allowPaypal: board.paymentConfig.allowPaypal,
        allowVenmo: board.paymentConfig.allowVenmo,
      } : null,
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${board.name.replace(/[^a-z0-9]/gi, '_')}_backup_${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting board:', error);
    return NextResponse.json({ error: 'Failed to export board' }, { status: 500 });
  }
}
