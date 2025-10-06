import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    // Check admin session
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      gameId,
      name,
      teamHome,
      teamAway,
      costPerSquare,
      payoutType,
      payoutQ1,
      payoutQ2,
      payoutQ3,
      payoutQ4,
      allowPaypal,
      paypalUsername,
      allowVenmo,
      venmoUsername,
      allowCash,
    } = body;

    // Validate required fields
    if (!gameId || !name || !teamHome || !teamAway || !costPerSquare) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate payouts
    if (payoutType === 'percentage') {
      const total = payoutQ1 + payoutQ2 + payoutQ3 + payoutQ4;
      if (Math.abs(total - 100) > 0.01) {
        return NextResponse.json(
          { error: 'Percentage payouts must total 100%' },
          { status: 400 }
        );
      }
    }

    // Validate payment methods
    if (!allowPaypal && !allowVenmo && !allowCash) {
      return NextResponse.json(
        { error: 'At least one payment method must be enabled' },
        { status: 400 }
      );
    }

    if (allowPaypal && !paypalUsername) {
      return NextResponse.json(
        { error: 'PayPal username is required when PayPal is enabled' },
        { status: 400 }
      );
    }

    if (allowVenmo && !venmoUsername) {
      return NextResponse.json(
        { error: 'Venmo username is required when Venmo is enabled' },
        { status: 400 }
      );
    }

    // Create board with payment config in a transaction
    const board = await prisma.$transaction(async (tx) => {
      const newBoard = await tx.board.create({
        data: {
          gameId,
          name,
          teamHome,
          teamAway,
          costPerSquare,
          payoutType,
          payoutQ1,
          payoutQ2,
          payoutQ3,
          payoutQ4,
          status: 'open',
          isFinalized: false,
        },
      });

      await tx.paymentConfig.create({
        data: {
          boardId: newBoard.id,
          allowPaypal,
          paypalUsername: allowPaypal ? paypalUsername : null,
          allowVenmo,
          venmoUsername: allowVenmo ? venmoUsername : null,
          allowCash,
        },
      });

      return newBoard;
    });

    return NextResponse.json({ success: true, board });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
