import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { boardId, squares, playerName, paymentMethod } = await request.json();

    // Validate inputs
    if (!boardId || !squares || !Array.isArray(squares) || squares.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    if (!playerName || !playerName.trim()) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Check board exists and is open
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { squares: true },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    if (board.status !== 'open') {
      return NextResponse.json(
        { error: 'Board is not accepting new squares' },
        { status: 400 }
      );
    }

    // Check if any requested squares are already taken
    const existingSquares = board.squares.map((s) => `${s.row},${s.col}`);
    const requestedSquares = squares.map((s: any) => `${s.row},${s.col}`);
    const conflicts = requestedSquares.filter((s: string) => existingSquares.includes(s));

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Some squares are already taken' },
        { status: 409 }
      );
    }

    // Create all squares in a transaction
    const createdSquares = await prisma.$transaction(
      squares.map((square: any) =>
        prisma.square.create({
          data: {
            boardId,
            row: square.row,
            col: square.col,
            playerName: playerName.trim(),
            paymentMethod,
            isPaid: false,
          },
        })
      )
    );

    return NextResponse.json({ 
      success: true,
      squares: createdSquares,
    });
  } catch (error) {
    console.error('Error creating squares:', error);
    return NextResponse.json(
      { error: 'Failed to reserve squares' },
      { status: 500 }
    );
  }
}
