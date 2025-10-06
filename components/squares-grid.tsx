'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';
import { getTeamColors, getTeamWordmarkPath } from '@/lib/espn-api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, DollarSign, CreditCard } from 'lucide-react';

interface Square {
  id: string;
  row: number;
  col: number;
  playerName: string | null;
  paymentMethod: string | null;
  isPaid: boolean;
}

interface Winner {
  quarter: number;
  playerName: string;
  scoreAway: number;
  payout: number;
}

interface SquaresGridProps {
  squares: any[];
  rowNumbers: number[] | null;
  colNumbers: number[] | null;
  isFinalized: boolean;
  homeTeamAbbr: string;
  awayTeamAbbr: string;
  selectedSquares?: Set<string>;
  potentialWinner?: { row: number; col: number } | null;
  winners?: any[];
  currentScores?: { home: number; away: number };
  onSquareClick?: (row: number, col: number) => void;
  showDialog?: boolean; // Control whether to show the built-in dialog
}

export function SquaresGrid({
  squares,
  rowNumbers,
  colNumbers,
  isFinalized,
  homeTeamAbbr,
  awayTeamAbbr,
  onSquareClick,
  selectedSquares = new Set(),
  potentialWinner,
  winners = [],
  currentScores,
  showDialog = true,
}: SquaresGridProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const homeColors = getTeamColors(homeTeamAbbr);
  const awayColors = getTeamColors(awayTeamAbbr);

  const getSquareAt = (row: number, col: number): Square | undefined => {
    return squares.find((s) => s.row === row && s.col === col);
  };

  const getWinnerQuarters = (row: number, col: number): number[] => {
    if (!isFinalized || !rowNumbers || !colNumbers) return [];
    
    const rowNum = rowNumbers[row];
    const colNum = colNumbers[col];
    
    return winners
      .filter((w) => {
        const homeLastDigit = w.scoreHome % 10;
        const awayLastDigit = w.scoreAway % 10;
        return homeLastDigit === colNum && awayLastDigit === rowNum;
      })
      .map((w) => w.quarter);
  };

  const isPotentialWinner = (row: number, col: number): boolean => {
    return potentialWinner?.row === row && potentialWinner?.col === col;
  };

  const handleSquareClick = (row: number, col: number) => {
    // If showDialog is false (admin mode), always use external handler
    if (!showDialog && onSquareClick) {
      onSquareClick(row, col);
      return;
    }
    
    // Otherwise use internal dialog
    const square = getSquareAt(row, col);
    if (square?.playerName) {
      setSelectedSquare(square);
    } else if (onSquareClick) {
      onSquareClick(row, col);
    }
  };

  return (
    <>
      <div className="relative p-4 bg-card rounded-lg border border-border max-w-full" style={{ overflow: 'visible', aspectRatio: '1/1', width: 'min(100%, calc(100vh - 120px))' }}>
        {/* Home Team Color Bar (horizontal - ABOVE grid) */}
        <div 
          className="absolute -top-2 left-[60px] right-0 h-12 rounded-t-lg pointer-events-none z-10"
          style={{
            background: `linear-gradient(135deg, ${homeColors.primary}, ${homeColors.secondary})`,
          }}
        />
        
        {/* Home Team Wordmark (overhanging beyond bar) */}
        <div className="absolute left-[60px] right-0 pointer-events-none z-20" style={{ 
          top: '-32px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible'
        }}>
          <img
            src={getTeamWordmarkPath(homeTeamAbbr)}
            alt={homeTeamAbbr}
            style={{ 
              height: '72px',
              width: 'auto',
              maxWidth: 'none',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Away Team Color Bar (vertical - LEFT of grid) */}
        <div 
          className="absolute top-0 -left-2 bottom-0 w-12 rounded-l-lg pointer-events-none z-10"
          style={{
            background: `linear-gradient(135deg, ${awayColors.primary}, ${awayColors.secondary})`,
          }}
        />

        {/* Away Team Wordmark (overhanging beyond bar) */}
        <div className="absolute top-0 bottom-0 pointer-events-none z-20" style={{
          left: '-32px',
          width: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible'
        }}>
          <div style={{ 
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            minWidth: '1000px',
            width: '1000px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible'
          }}>
            <img
              src={getTeamWordmarkPath(awayTeamAbbr)}
              alt={awayTeamAbbr}
              style={{ 
                height: '72px',
                width: 'auto',
                maxWidth: 'none',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-[1fr_repeat(10,1fr)] gap-0.5 mt-16 ml-16">

        {/* Top-left corner */}
        <div className="aspect-square min-h-[40px]" />

        {/* Column headers (Home team - top) */}
        {Array.from({ length: 10 }).map((_, col) => (
          <div
            key={`col-${col}`}
            className="aspect-square min-h-[40px] flex items-center justify-center text-lg font-bold rounded relative"
            style={{
              background: `linear-gradient(135deg, ${homeColors.primary}, ${homeColors.secondary})`,
              color: 'white',
            }}
          >
            {isFinalized && colNumbers ? colNumbers[col] : '?'}
          </div>
        ))}

        {/* Grid rows */}
        {Array.from({ length: 10 }).map((_, row) => (
          <div key={`row-${row}`} className="contents">
            {/* Row header (Away team - left) */}
            <div
              className="aspect-square min-h-[40px] flex items-center justify-center text-lg font-bold rounded relative"
              style={{
                background: `linear-gradient(135deg, ${awayColors.primary}, ${awayColors.secondary})`,
                color: 'white',
              }}
            >
              {isFinalized && rowNumbers ? rowNumbers[row] : '?'}
            </div>

            {/* Square cells */}
            {Array.from({ length: 10 }).map((_, col) => {
              const square = getSquareAt(row, col);
              const isSelected = selectedSquares.has(`${row},${col}`);
              const isPotential = isPotentialWinner(row, col);
              const winnerQuarters = getWinnerQuarters(row, col);

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => handleSquareClick(row, col)}
                  className={cn(
                    'aspect-square relative flex items-center justify-center cursor-pointer square-cell',
                    'bg-secondary/30 hover:bg-secondary/50 border border-border rounded transition-all',
                    square?.playerName && 'bg-secondary/60',
                    isSelected && 'ring-2 ring-primary bg-primary/20',
                    isPotential && 'potential-winner ring-4 ring-blue-500'
                  )}
                >
                  {/* Player initials */}
                  {square?.playerName && (
                    <span className="text-xs font-semibold text-foreground">
                      {getInitials(square.playerName)}
                    </span>
                  )}

                  {/* Quarter badges */}
                  {winnerQuarters.length > 0 && (
                    <div className="absolute top-0.5 right-0.5 flex flex-wrap gap-0.5 max-w-[80%]">
                      {winnerQuarters.map((q) => (
                        <span
                          key={q}
                          className={`quarter-badge quarter-badge-${q}`}
                        >
                          Q{q}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Payment icon */}
                  {square?.paymentMethod && square.isPaid && (
                    <div className="absolute bottom-0.5 right-0.5">
                      {square.paymentMethod === 'venmo' && (
                        <span className="text-[10px] text-blue-400">V</span>
                      )}
                      {square.paymentMethod === 'paypal' && (
                        <span className="text-[10px] text-yellow-400">P</span>
                      )}
                      {square.paymentMethod === 'cash' && (
                        <span className="text-[10px] text-green-400">$</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        </div> {/* Close inner grid */}
      </div> {/* Close outer container */}

      {/* Score display removed - shown in GameHeader instead */}

      {/* Square details dialog - only show if showDialog is true */}
      {showDialog && selectedSquare && (
        <Dialog open={!!selectedSquare} onOpenChange={() => setSelectedSquare(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Square Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{selectedSquare.playerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{selectedSquare.paymentMethod || 'Unknown'}</span>
                <Badge variant={selectedSquare.isPaid ? 'default' : 'secondary'}>
                  {selectedSquare.isPaid ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>Row {selectedSquare.row}, Column {selectedSquare.col}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
