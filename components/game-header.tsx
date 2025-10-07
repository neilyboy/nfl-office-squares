'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTeamColors, getTeamLogoPath, getTeamWordmarkPath } from '@/lib/espn-api';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar } from 'lucide-react';

interface GameHeaderProps {
  boardName: string;
  homeTeam: {
    name: string;
    abbreviation: string;
    score: number;
  };
  awayTeam: {
    name: string;
    abbreviation: string;
    score: number;
  };
  gameStatus: {
    period: number;
    clock: string;
    state: 'pre' | 'in' | 'post';
    detail: string;
  };
  gameDate: string;
}

export function GameHeader({
  boardName,
  homeTeam,
  awayTeam,
  gameStatus,
  gameDate,
}: GameHeaderProps) {
  const homeColors = getTeamColors(homeTeam.abbreviation);
  const awayColors = getTeamColors(awayTeam.abbreviation);

  const getStatusDisplay = () => {
    if (gameStatus.state === 'pre') {
      return (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(gameDate)}</span>
        </div>
      );
    }
    if (gameStatus.state === 'post') {
      return <Badge variant="secondary">Final</Badge>;
    }
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>
          Q{gameStatus.period} - {gameStatus.clock}
        </span>
      </div>
    );
  };

  const getStatusBadgeVariant = () => {
    if (gameStatus.state === 'in') return 'default';
    if (gameStatus.state === 'post') return 'secondary';
    return 'outline';
  };

  return (
    <Card className="p-3">
      {/* Board name */}
      <div className="text-center mb-2">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          {boardName}
        </h1>
      </div>

      {/* Game matchup */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {/* Away team */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-16 h-16 rounded-lg p-2 flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${awayColors.primary}, ${awayColors.secondary})`,
            }}
          >
            <Image
              src={getTeamLogoPath(awayTeam.abbreviation)}
              alt={awayTeam.name}
              width={64}
              height={64}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {gameStatus.state !== 'pre' && (
            <div className="text-3xl font-bold">{awayTeam.score}</div>
          )}
          <Image
            src={getTeamWordmarkPath(awayTeam.abbreviation)}
            alt={awayTeam.name}
            width={120}
            height={30}
            className="h-6 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.6))' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Center - Status */}
        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <Badge variant={getStatusBadgeVariant()} className="text-xs">
            {getStatusDisplay()}
          </Badge>
          {gameStatus.state !== 'pre' && (
            <span className="text-xl font-bold text-muted-foreground">@</span>
          )}
        </div>

        {/* Home team */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-16 h-16 rounded-lg p-2 flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${homeColors.primary}, ${homeColors.secondary})`,
            }}
          >
            <Image
              src={getTeamLogoPath(homeTeam.abbreviation)}
              alt={homeTeam.name}
              width={64}
              height={64}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {gameStatus.state !== 'pre' && (
            <div className="text-3xl font-bold">{homeTeam.score}</div>
          )}
          <Image
            src={getTeamWordmarkPath(homeTeam.abbreviation)}
            alt={homeTeam.name}
            width={120}
            height={30}
            className="h-6 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.6))' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
    </Card>
  );
}
