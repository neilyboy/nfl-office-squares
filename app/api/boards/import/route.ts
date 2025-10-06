import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const importData = await request.json();

    // Validate import data structure
    if (!importData.version || !importData.board || !importData.squares) {
      return NextResponse.json(
        { error: 'Invalid backup file format' },
        { status: 400 }
      );
    }

    // Create new board
    const board = await prisma.board.create({
      data: {
        name: `${importData.board.name} (Restored)`,
        gameId: importData.board.gameId,
        teamHome: importData.board.teamHome,
        teamAway: importData.board.teamAway,
        costPerSquare: importData.board.costPerSquare,
        status: importData.board.status,
        isFinalized: importData.board.isFinalized,
        rowNumbers: importData.board.rowNumbers,
        colNumbers: importData.board.colNumbers,
        payoutType: importData.board.payoutType,
        payoutQ1: importData.board.payoutQ1,
        payoutQ2: importData.board.payoutQ2,
        payoutQ3: importData.board.payoutQ3,
        payoutQ4: importData.board.payoutQ4,
      },
    });

    // Create payment config if exists
    if (importData.paymentConfig) {
      await prisma.paymentConfig.create({
        data: {
          boardId: board.id,
          venmoUsername: importData.paymentConfig.venmoUsername || null,
          paypalUsername: importData.paymentConfig.paypalUsername || null,
          allowCash: importData.paymentConfig.allowCash || false,
          allowPaypal: importData.paymentConfig.allowPaypal || false,
          allowVenmo: importData.paymentConfig.allowVenmo || false,
        },
      });
    }

    // Create squares
    if (importData.squares.length > 0) {
      await prisma.square.createMany({
        data: importData.squares.map((s: any) => ({
          boardId: board.id,
          row: s.row,
          col: s.col,
          playerName: s.playerName,
          paymentMethod: s.paymentMethod,
          isPaid: s.isPaid,
        })),
      });
    }

    // Create winners
    if (importData.winners && importData.winners.length > 0) {
      await prisma.winner.createMany({
        data: importData.winners.map((w: any) => ({
          boardId: board.id,
          quarter: w.quarter,
          playerName: w.playerName,
          scoreHome: w.scoreHome,
          scoreAway: w.scoreAway,
          payout: w.payout,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      boardId: board.id,
      message: 'Board restored successfully',
    });
  } catch (error) {
    console.error('Error importing board:', error);
    return NextResponse.json({ error: 'Failed to import board' }, { status: 500 });
  }
}
