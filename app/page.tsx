'use client';

import { useEffect, useState, useCallback } from 'react';
import { GameHeader } from '@/components/game-header';
import { SquaresGrid } from '@/components/squares-grid';
import { BoardInfoPanel } from '@/components/board-info-panel';
import { SquareSelectionDialog } from '@/components/square-selection-dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShoppingCart, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface PaymentConfig {
  paypalUsername: string | null;
  venmoUsername: string | null;
  allowCash: boolean;
  allowPaypal: boolean;
  allowVenmo: boolean;
}

interface Board {
  id: string;
  name: string;
  gameId: string;
  teamHome: string;
  teamAway: string;
  costPerSquare: number;
  status: string;
  isFinalized: boolean;
  rowNumbers: number[] | null;
  colNumbers: number[] | null;
  payoutQ1: number;
  payoutQ2: number;
  payoutQ3: number;
  payoutQ4: number;
  payoutType: 'percentage' | 'dollar';
  squares: any[];
  winners: any[];
  paymentConfig: PaymentConfig | null;
  gameData?: any;
}

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastManualChange, setLastManualChange] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [enableOnScreenKeyboard, setEnableOnScreenKeyboard] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [isLoadingGameData, setIsLoadingGameData] = useState(false);
  const [previousGameStates, setPreviousGameStates] = useState<Map<string, any>>(new Map());

  const fetchBoards = useCallback(async () => {
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) throw new Error('Failed to fetch boards');
      const data = await response.json();
      setBoards(data.boards);
      
      // Check for completed quarters in each board and auto-update winners
      for (const board of data.boards) {
        if (board.gameData && board.isFinalized) {
          const boardKey = board.id;
          const gameData = board.gameData;
          const previousState = previousGameStates.get(boardKey);
          
          console.log(`🔍 Checking ${board.name}:`, {
            period1Complete: gameData.period1?.complete,
            period2Complete: gameData.period2?.complete,
            period3Complete: gameData.period3?.complete,
            period4Complete: gameData.period4?.complete,
            existingWinners: board.winners?.map((w: any) => `Q${w.quarter}`)
          });
          
          // Track quarters that just completed OR are already complete but missing winners
          const completedQuarters: number[] = [];
          const existingWinnerQuarters = new Set(board.winners?.map((w: any) => w.quarter) || []);
          
          for (let quarter = 1; quarter <= 4; quarter++) {
            const quarterKey = `period${quarter}`;
            const currentQuarterComplete = gameData[quarterKey]?.complete || false;
            const previousQuarterComplete = previousState?.[quarterKey]?.complete || false;
            
            // If quarter just completed (wasn't complete before, but is now)
            if (currentQuarterComplete && !previousQuarterComplete && !existingWinnerQuarters.has(quarter)) {
              console.log(`✨ Quarter ${quarter} just completed!`);
              completedQuarters.push(quarter);
            }
            // OR if quarter is complete but we don't have a winner for it yet (on initial load)
            else if (currentQuarterComplete && !existingWinnerQuarters.has(quarter) && !previousState) {
              console.log(`📋 Found completed quarter ${quarter} without winner for ${board.name}`);
              completedQuarters.push(quarter);
            }
          }

          // If any quarters need winners updated
          if (completedQuarters.length > 0) {
            console.log(`🏈 Updating winners for quarter(s) ${completedQuarters.join(', ')} on ${board.name}...`);
            
            try {
              const winnersResponse = await fetch(`/api/boards/${board.id}/update-winners`, {
                method: 'POST',
              });
              
              if (winnersResponse.ok) {
                console.log(`✅ Winners auto-updated! Refreshing board...`);
                // Trigger a refresh after a short delay to show the new winner
                setTimeout(() => {
                  fetchBoards();
                }, 2000);
              } else {
                console.error(`❌ Winners API error: ${winnersResponse.status}`);
              }
            } catch (error) {
              console.error('Error auto-updating winners:', error);
            }
          }

          // Update previous state
          setPreviousGameStates(prev => {
            const newMap = new Map(prev);
            newMap.set(boardKey, {
              period1: gameData.period1,
              period2: gameData.period2,
              period3: gameData.period3,
              period4: gameData.period4,
            });
            return newMap;
          });
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching boards:', error);
      setLoading(false);
    }
  }, [previousGameStates]);

  const fetchAdminSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setEnableOnScreenKeyboard(data.settings.enableOnScreenKeyboard);
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    }
  }, []);

  // Fetch boards on mount and set up polling for live games
  useEffect(() => {
    fetchBoards();
    fetchAdminSettings();
    const interval = setInterval(fetchBoards, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // Auto-advance through boards
  useEffect(() => {
    // Don't auto-advance if dialog is open, auto-advance is off, or only one board
    if (!autoAdvance || boards.length <= 1 || dialogOpen) return;

    const now = Date.now();
    const timeSinceManualChange = now - lastManualChange;
    const delay = timeSinceManualChange < 20000 ? 20000 : 10000;

    const timer = setTimeout(() => {
      setCurrentBoardIndex((prev) => (prev + 1) % boards.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [autoAdvance, currentBoardIndex, boards.length, lastManualChange, dialogOpen]);

  // Sync game data from board
  useEffect(() => {
    if (boards.length > 0 && boards[currentBoardIndex]?.gameData) {
      setGameData(boards[currentBoardIndex].gameData);
    }
  }, [boards, currentBoardIndex]);

  const handlePrevBoard = () => {
    setLastManualChange(Date.now());
    setCurrentBoardIndex((prev) => (prev - 1 + boards.length) % boards.length);
  };

  const handleNextBoard = () => {
    setLastManualChange(Date.now());
    setCurrentBoardIndex((prev) => (prev + 1) % boards.length);
  };

  const handleSquareClick = (row: number, col: number) => {
    // On main page, clicking a square only shows details (read-only)
    // Use Buy Squares button to enter purchase mode
    const square = currentBoard.squares.find((s: any) => s.row === row && s.col === col);
    
    if (square?.playerName) {
      // Show square details in read-only mode
      setSelectedSquare(square);
      setDialogOpen(true);
    } else if (isAdmin) {
      // Admin can edit empty squares
      setSelectedSquare({
        id: `temp-${row}-${col}`,
        boardId: currentBoard.id,
        row,
        col,
        playerName: null,
        isPaid: false,
      });
      setDialogOpen(true);
    }
  };

  const handleSquareUpdated = () => {
    fetchBoards(); // Refresh all boards
    setDialogOpen(false);
    setSelectedSquare(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading boards...</p>
        </div>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold mb-4">No Boards Available</h1>
          <p className="text-muted-foreground mb-6">
            There are currently no active boards. Please check back later or contact the admin.
          </p>
          <Button onClick={() => router.push('/admin')}>
            <Settings className="w-4 h-4 mr-2" />
            Admin Login
          </Button>
        </div>
      </div>
    );
  }

  const currentBoard = boards[currentBoardIndex];

  // Calculate totals
  const filledSquares = currentBoard.squares.length;
  const totalPot = currentBoard.costPerSquare * filledSquares;

  // Find potential winner based on current scores
  const getPotentialWinner = () => {
    if (!gameData || !currentBoard.isFinalized || !currentBoard.rowNumbers || !currentBoard.colNumbers) {
      return null;
    }

    // Only show potential winner during active game
    if (gameData.status.state !== 'in' && gameData.status.state !== 'post') return null;

    const homeLastDigit = gameData.homeTeam.score % 10;
    const awayLastDigit = gameData.awayTeam.score % 10;

    const rowIndex = currentBoard.rowNumbers.indexOf(awayLastDigit);
    const colIndex = currentBoard.colNumbers.indexOf(homeLastDigit);

    if (rowIndex === -1 || colIndex === -1) return null;

    const winningSquare = currentBoard.squares.find(
      (s: any) => s.row === rowIndex && s.col === colIndex
    );

    if (!winningSquare?.playerName) return null;

    const quarter = gameData.status.period;
    const payouts = [
      currentBoard.payoutQ1,
      currentBoard.payoutQ2,
      currentBoard.payoutQ3,
      currentBoard.payoutQ4,
    ];

    let payout = 0;
    if (currentBoard.payoutType === 'dollar') {
      payout = payouts[quarter - 1] || 0;
    } else {
      payout = (totalPot * payouts[quarter - 1]) / 100;
    }

    return {
      row: rowIndex,
      col: colIndex,
      playerName: winningSquare.playerName,
      quarter,
      payout,
    };
  };

  const potentialWinner = getPotentialWinner();

  return (
    <div className="h-screen overflow-hidden p-2 md:p-4">
      <div className="h-full max-w-7xl mx-auto flex flex-col">
        {/* Top navigation - compact */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            {boards.length > 1 && (
              <>
                <Button variant="outline" size="sm" onClick={handlePrevBoard}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentBoardIndex + 1}/{boards.length}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextBoard}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Buttons moved to right panel */}
          </div>
        </div>

        {/* Main content - fills remaining height */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-3">
          {/* Left: Grid Only (View Mode) */}
          <div className="flex flex-col gap-2 min-h-0" style={{ overflow: 'visible', minHeight: 0 }}>
            <div style={{ overflow: 'visible' }}>
              <SquaresGrid
              squares={currentBoard.squares}
              rowNumbers={currentBoard.rowNumbers}
              colNumbers={currentBoard.colNumbers}
              isFinalized={currentBoard.isFinalized}
              homeTeamAbbr={currentBoard.teamHome}
              awayTeamAbbr={currentBoard.teamAway}
              potentialWinner={
                potentialWinner ? { row: potentialWinner.row, col: potentialWinner.col } : null
              }
              winners={currentBoard.winners}
              currentScores={
                gameData
                  ? { home: gameData.homeTeam.score, away: gameData.awayTeam.score }
                  : undefined
              }
              onSquareClick={handleSquareClick}
            />
            </div>
          </div>

          {/* Right: Game Header + Board Info */}
          <div className="flex flex-col gap-3 overflow-auto">
            {gameData && (
              <GameHeader
                boardName={currentBoard.name}
                homeTeam={{
                  name: gameData.homeTeam.displayName,
                  abbreviation: gameData.homeTeam.abbreviation,
                  score: gameData.homeTeam.score,
                }}
                awayTeam={{
                  name: gameData.awayTeam.displayName,
                  abbreviation: gameData.awayTeam.abbreviation,
                  score: gameData.awayTeam.score,
                }}
                gameStatus={gameData.status}
                gameDate={gameData.date}
              />
            )}
            
            <BoardInfoPanel
              boardName={currentBoard.name}
              costPerSquare={currentBoard.costPerSquare}
              totalPot={totalPot}
              filledSquares={filledSquares}
              totalSquares={100}
              status={currentBoard.status}
              winners={currentBoard.winners}
              potentialWinner={potentialWinner}
              payoutQ1={currentBoard.payoutQ1}
              payoutQ2={currentBoard.payoutQ2}
              payoutQ3={currentBoard.payoutQ3}
              payoutQ4={currentBoard.payoutQ4}
              payoutType={currentBoard.payoutType}
            />
            
            {/* Action Buttons */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              {currentBoard.status === 'open' && (
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => router.push(`/buy?boardId=${currentBoard.id}`)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Squares
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={async () => {
                  // Clear admin session to force re-authentication
                  await fetch('/api/admin/logout', { method: 'POST' });
                  router.push('/admin');
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Square Selection Dialog */}
      <SquareSelectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        square={selectedSquare}
        boardId={currentBoard.id}
        isAdmin={isAdmin}
        enableOnScreenKeyboard={enableOnScreenKeyboard}
        onSquareUpdated={handleSquareUpdated}
        paymentConfig={currentBoard.paymentConfig}
      />
    </div>
  );
}
