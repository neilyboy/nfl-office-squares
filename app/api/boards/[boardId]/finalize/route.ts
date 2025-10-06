import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Generate random numbers 0-9 for rows and columns
function generateRandomNumbers(): number[] {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

export async function POST(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    // Check if board exists
    const board = await prisma.board.findUnique({
      where: { id: params.boardId },
    });

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (board.isFinalized) {
      return NextResponse.json({ error: 'Board is already finalized' }, { status: 400 });
    }

    // Generate random numbers for rows and columns
    const rowNumbers = generateRandomNumbers();
    const colNumbers = generateRandomNumbers();

    // Update board to finalized with numbers
    const updatedBoard = await prisma.board.update({
      where: { id: params.boardId },
      data: {
        isFinalized: true,
        rowNumbers: JSON.stringify(rowNumbers),
        colNumbers: JSON.stringify(colNumbers),
        status: 'closed', // Also close the board when finalizing
      },
    });

    return NextResponse.json({ 
      board: updatedBoard,
      rowNumbers,
      colNumbers,
    });
  } catch (error) {
    console.error('Error finalizing board:', error);
    return NextResponse.json({ error: 'Failed to finalize board' }, { status: 500 });
  }
}
