'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Trophy, DollarSign, Users, Target, Sparkles } from 'lucide-react';

interface Winner {
  quarter: number;
  playerName: string;
  scoreHome: number;
  scoreAway: number;
  payout: number;
}

interface BoardInfoPanelProps {
  boardName: string;
  costPerSquare: number;
  totalPot: number;
  filledSquares: number;
  totalSquares: number;
  status: string;
  winners: Winner[];
  potentialWinner?: {
    playerName: string;
    quarter: number;
    payout: number;
  } | null;
  payoutQ1: number;
  payoutQ2: number;
  payoutQ3: number;
  payoutQ4: number;
  payoutType: 'percentage' | 'dollar';
}

export function BoardInfoPanel({
  boardName,
  costPerSquare,
  totalPot,
  filledSquares,
  totalSquares,
  status,
  winners,
  potentialWinner,
  payoutQ1,
  payoutQ2,
  payoutQ3,
  payoutQ4,
  payoutType,
}: BoardInfoPanelProps) {
  const getStatusBadge = () => {
    const variants = {
      open: { variant: 'default' as const, label: 'Open' },
      closed: { variant: 'secondary' as const, label: 'Closed' },
      live: { variant: 'default' as const, label: 'Live' },
      completed: { variant: 'secondary' as const, label: 'Completed' },
      archived: { variant: 'outline' as const, label: 'Archived' },
    };
    return variants[status as keyof typeof variants] || variants.open;
  };

  const getQuarterPayout = (quarter: number) => {
    const payouts = [payoutQ1, payoutQ2, payoutQ3, payoutQ4];
    const payout = payouts[quarter - 1];
    
    if (payoutType === 'dollar') {
      return formatCurrency(payout);
    }
    const amount = (totalPot * payout) / 100;
    return formatCurrency(amount);
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-2">
      {/* Board Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Board Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-2">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Cost/Square</p>
              <p className="text-sm font-bold">{formatCurrency(costPerSquare)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pot</p>
              <p className="text-sm font-bold text-green-500">{formatCurrency(totalPot)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Filled: {filledSquares}/100</p>
            <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${(filledSquares / totalSquares) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Potential Winner Card */}
      {potentialWinner && status === 'live' && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Potential Winner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-2">
            <p className="font-semibold text-base">{potentialWinner.playerName}</p>
            <p className="text-xs text-muted-foreground">Q{potentialWinner.quarter} - {formatCurrency(potentialWinner.payout)}</p>
          </CardContent>
        </Card>
      )}

      {/* Quarter Winners Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Winners
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-2">
          {[1, 2, 3, 4].map((quarter) => {
            const winner = winners.find((w) => w.quarter === quarter);
            const payout = getQuarterPayout(quarter);

            return (
              <div
                key={quarter}
                className="p-2 rounded border border-border bg-secondary/30"
              >
                <div className="flex items-center justify-between">
                  <span className={`quarter-badge quarter-badge-${quarter}`}>Q{quarter}</span>
                  <span className="text-xs font-semibold">{payout}</span>
                </div>
                {winner ? (
                  <p className="text-xs font-semibold mt-1">{winner.playerName}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">TBD</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
