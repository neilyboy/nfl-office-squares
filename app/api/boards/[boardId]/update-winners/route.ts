import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getGameById } from '@/lib/espn-api';

export async function POST(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    // Check if we should force refresh (delete existing winners first)
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('force') === 'true';

    const board = await prisma.board.findUnique({
      where: { id: params.boardId },
      include: {
        squares: true,
        winners: true,
      },
    });

    if (!board || !board.isFinalized || !board.rowNumbers || !board.colNumbers) {
      console.log('Board validation failed:', { 
        exists: !!board, 
        finalized: board?.isFinalized, 
        hasRowNumbers: !!board?.rowNumbers, 
        hasColNumbers: !!board?.colNumbers 
      });
      return NextResponse.json({ error: 'Board not found or not finalized' }, { status: 400 });
    }

    // If force refresh, delete all existing winners
    if (forceRefresh) {
      console.log('Force refresh - deleting existing winners');
      await prisma.winner.deleteMany({
        where: { boardId: board.id },
      });
    }

    // Get live game data
    const gameData = await getGameById(board.gameId);
    if (!gameData) {
      console.log('Game data not found for gameId:', board.gameId);
      return NextResponse.json({ error: 'Game data not found' }, { status: 404 });
    }

    console.log('Game status:', gameData.status);
    console.log('Current scores:', { home: gameData.homeTeam.score, away: gameData.awayTeam.score });

    const rowNumbers = JSON.parse(board.rowNumbers);
    const colNumbers = JSON.parse(board.colNumbers);
    const currentPeriod = gameData.status.period;
    
    console.log('Row numbers:', rowNumbers);
    console.log('Col numbers:', colNumbers);
    console.log('Current period:', currentPeriod);

    const payouts = [board.payoutQ1, board.payoutQ2, board.payoutQ3, board.payoutQ4];

    // Calculate total pot for percentage payouts
    const filledSquares = board.squares.filter((s) => s.playerName).length;
    const totalPot = board.costPerSquare * filledSquares;

    const newWinners = [];

    // Determine which quarters are actually complete
    const completedQuarters = [];
    if (gameData.period1?.complete) completedQuarters.push(1);
    if (gameData.period2?.complete) completedQuarters.push(2);
    if (gameData.period3?.complete) completedQuarters.push(3);
    if (gameData.period4?.complete) completedQuarters.push(4);

    console.log(`Completed quarters to check: ${completedQuarters.join(', ')}`);

    // Check each completed quarter
    for (const quarter of completedQuarters) {
      // Skip if winner already exists for this quarter
      const existingWinner = board.winners.find((w) => w.quarter === quarter);
      if (existingWinner) {
        continue;
      }

      // Get scores for this specific quarter
      // ESPN provides linescores array with scores per period
      let homeScore = gameData.homeTeam.score;
      let awayScore = gameData.awayTeam.score;

      console.log(`Q${quarter} - Initial scores: Away ${awayScore}, Home ${homeScore}`);
      console.log(`Home linescores:`, gameData.homeTeam.linescores);
      console.log(`Away linescores:`, gameData.awayTeam.linescores);

      // Try to get quarter-specific scores from linescores if available
      const homeTeam = gameData.homeTeam as any;
      const awayTeam = gameData.awayTeam as any;
      
      if (homeTeam.linescores && homeTeam.linescores.length >= quarter) {
        // Calculate cumulative score up to this quarter
        // ESPN uses 'displayValue' not 'value'
        homeScore = homeTeam.linescores
          .slice(0, quarter)
          .reduce((sum: number, score: any) => sum + (parseInt(score.displayValue || score.value || '0')), 0);
        awayScore = awayTeam.linescores
          .slice(0, quarter)
          .reduce((sum: number, score: any) => sum + (parseInt(score.displayValue || score.value || '0')), 0);
        console.log(`Q${quarter} - After linescores: Away ${awayScore}, Home ${homeScore}`);
      } else {
        console.log(`Q${quarter} - No linescores available, using current game score`);
      }

      // Find the winning square
      const homeLastDigit = homeScore % 10;
      const awayLastDigit = awayScore % 10;

      const rowIndex = rowNumbers.indexOf(awayLastDigit);
      const colIndex = colNumbers.indexOf(homeLastDigit);

      if (rowIndex === -1 || colIndex === -1) {
        console.log(`No matching square for Q${quarter}: Home ${homeScore} (${homeLastDigit}), Away ${awayScore} (${awayLastDigit})`);
        continue;
      }

      const winningSquare = board.squares.find(
        (s) => s.row === rowIndex && s.col === colIndex
      );

      if (!winningSquare?.playerName) {
        console.log(`No player owns square at (${rowIndex}, ${colIndex}) for Q${quarter}`);
        continue; // No one owns this square
      }

      // Calculate payout
      let payout = 0;
      if (board.payoutType === 'dollar') {
        payout = payouts[quarter - 1] || 0;
      } else {
        payout = (totalPot * (payouts[quarter - 1] || 0)) / 100;
      }

      // Create winner record
      const winner = await prisma.winner.create({
        data: {
          boardId: board.id,
          quarter,
          playerName: winningSquare.playerName,
          scoreHome: homeScore,
          scoreAway: awayScore,
          payout,
        },
      });

      console.log(`Winner recorded for Q${quarter}: ${winningSquare.playerName} at (${rowIndex}, ${colIndex}) - Score: ${awayScore}-${homeScore}`);
      newWinners.push(winner);
    }

    return NextResponse.json({ 
      success: true, 
      newWinners,
      message: `${newWinners.length} winner(s) recorded`
    });
  } catch (error) {
    console.error('Error updating winners:', error);
    return NextResponse.json({ error: 'Failed to update winners' }, { status: 500 });
  }
}
