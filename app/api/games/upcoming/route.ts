import { NextResponse } from 'next/server';
import { getUpcomingGames } from '@/lib/espn-api';

export async function GET() {
  try {
    const espnGames = await getUpcomingGames();
    
    // Transform to our format
    const games = espnGames.map((game) => {
      const competition = game.competitions[0];
      const homeTeam = competition.competitors.find((c) => c.homeAway === 'home');
      const awayTeam = competition.competitors.find((c) => c.homeAway === 'away');
      
      return {
        id: game.id,
        name: game.name,
        shortName: game.shortName,
        date: game.date,
        homeTeam: homeTeam?.team.displayName || 'Home',
        awayTeam: awayTeam?.team.displayName || 'Away',
        homeAbbr: homeTeam?.team.abbreviation || 'HOME',
        awayAbbr: awayTeam?.team.abbreviation || 'AWAY',
      };
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching upcoming games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
