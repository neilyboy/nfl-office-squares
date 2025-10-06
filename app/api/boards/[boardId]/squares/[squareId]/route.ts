import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { boardId: string; squareId: string } }
) {
  try {
    const { playerName, paymentMethod, isPaid, row, col } = await request.json();

    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    let square;

    // Check if this is a temporary square (starts with "temp-")
    if (params.squareId.startsWith('temp-')) {
      // Check if square already exists at this position
      const existingSquare = await prisma.square.findUnique({
        where: {
          boardId_row_col: {
            boardId: params.boardId,
            row,
            col,
          },
        },
      });

      if (existingSquare) {
        // Update existing square instead of creating
        square = await prisma.square.update({
          where: {
            id: existingSquare.id,
          },
          data: {
            playerName: playerName.trim(),
            paymentMethod: paymentMethod || null,
            isPaid: isPaid || false,
          },
        });
      } else {
        // Create a new square
        square = await prisma.square.create({
          data: {
            boardId: params.boardId,
            row,
            col,
            playerName: playerName.trim(),
            paymentMethod: paymentMethod || null,
            isPaid: isPaid || false,
          },
        });
      }
    } else {
      // Update existing square
      square = await prisma.square.update({
        where: {
          id: params.squareId,
          boardId: params.boardId,
        },
        data: {
          playerName: playerName.trim(),
          paymentMethod: paymentMethod || null,
          isPaid: isPaid || false,
        },
      });
    }

    return NextResponse.json(square);
  } catch (error: any) {
    console.error('Error updating square:', error);
    
    // Check for duplicate key error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This square is already taken' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update square' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { boardId: string; squareId: string } }
) {
  try {
    // Clear the square (set playerName to null, isPaid to false)
    const square = await prisma.square.update({
      where: {
        id: params.squareId,
        boardId: params.boardId,
      },
      data: {
        playerName: null,
        isPaid: false,
      },
    });

    return NextResponse.json(square);
  } catch (error) {
    console.error('Error clearing square:', error);
    return NextResponse.json(
      { error: 'Failed to clear square' },
      { status: 500 }
    );
  }
}
