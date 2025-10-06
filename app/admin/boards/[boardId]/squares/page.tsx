'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Trash2, User, UserX } from 'lucide-react';
import { SquaresGrid } from '@/components/squares-grid';

export default function ManageSquaresPage({ params }: { params: { boardId: string } }) {
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${params.boardId}`);
      if (!response.ok) throw new Error('Failed to fetch board');
      const data = await response.json();
      setBoard(data.board);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load board',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    const square = board.squares.find((s: any) => s.row === row && s.col === col);
    setSelectedSquare(square || { row, col, playerName: null });
  };

  const handleClearSquare = async (squareId: string) => {
    if (!confirm('Clear this square? This will remove the player and payment information.')) {
      return;
    }

    try {
      const response = await fetch(`/api/squares/${squareId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear square');

      toast({
        title: 'Success',
        description: 'Square cleared',
      });

      setSelectedSquare(null);
      fetchBoard();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleClearAllPlayerSquares = async (playerName: string) => {
    const playerSquares = board.squares.filter((s: any) => s.playerName === playerName);
    
    if (!confirm(`Remove ALL ${playerSquares.length} square(s) from ${playerName}? This cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = playerSquares.map((square: any) =>
        fetch(`/api/squares/${square.id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);

      toast({
        title: 'Success',
        description: `Removed all squares from ${playerName}`,
      });

      setSelectedSquare(null);
      fetchBoard();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!board) return null;

  const filledSquares = board.squares.filter((s: any) => s.playerName);
  
  // Group squares by player
  const playerSquares = filledSquares.reduce((acc: any, square: any) => {
    if (!acc[square.playerName]) {
      acc[square.playerName] = [];
    }
    acc[square.playerName].push(square);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{board.name} - Manage Squares</h1>
            <p className="text-muted-foreground mt-1">
              {filledSquares.length}/100 squares claimed • {Object.keys(playerSquares).length} players
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/boards')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Grid */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Click a square to view/manage</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ overflow: 'visible' }}>
                  <SquaresGrid
                    squares={board.squares}
                    rowNumbers={board.isFinalized ? JSON.parse(board.rowNumbers) : null}
                    colNumbers={board.isFinalized ? JSON.parse(board.colNumbers) : null}
                    isFinalized={board.isFinalized}
                    homeTeamAbbr={board.teamHome}
                    awayTeamAbbr={board.teamAway}
                    onSquareClick={handleSquareClick}
                    selectedSquares={selectedSquare ? new Set([`${selectedSquare.row},${selectedSquare.col}`]) : new Set()}
                    showDialog={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Stats Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sold:</span>
                  <span className="text-sm font-bold">{filledSquares.length}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Players:</span>
                  <span className="text-sm font-bold">{Object.keys(playerSquares).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue:</span>
                  <span className="text-sm font-bold text-green-500">
                    ${(filledSquares.length * board.costPerSquare).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Players List */}
            {Object.keys(playerSquares).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Players ({Object.keys(playerSquares).length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {Object.entries(playerSquares)
                    .sort(([, a]: any, [, b]: any) => b.length - a.length)
                    .map(([playerName, squares]: [string, any]) => (
                      <div
                        key={playerName}
                        className="flex items-center justify-between p-2 bg-secondary/20 rounded hover:bg-secondary/40 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">{playerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {squares.length} square{squares.length > 1 ? 's' : ''} • ${(squares.length * board.costPerSquare).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleClearAllPlayerSquares(playerName)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Square Details */}
            <div>
            {selectedSquare ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Square ({selectedSquare.row + 1}, {selectedSquare.col + 1})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSquare.playerName ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Player:</span>
                        </div>
                        <p className="text-xl font-bold">{selectedSquare.playerName}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Payment Method:</p>
                        <p className="capitalize">{selectedSquare.paymentMethod || 'Unknown'}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Payment Status:</p>
                        {selectedSquare.isPaid ? (
                          <Badge className="bg-green-500">Paid</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600">Unpaid</Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Cost:</p>
                        <p className="text-lg font-bold">${board.costPerSquare}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Player has:</p>
                        <p className="text-lg font-medium">
                          {playerSquares[selectedSquare.playerName]?.length || 0} total square{playerSquares[selectedSquare.playerName]?.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="destructive"
                          className="w-full"
                          size="lg"
                          onClick={() => handleClearSquare(selectedSquare.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove This Square
                        </Button>

                        {playerSquares[selectedSquare.playerName]?.length > 1 && (
                          <Button
                            variant="outline"
                            className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            size="lg"
                            onClick={() => handleClearAllPlayerSquares(selectedSquare.playerName)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Remove All from {selectedSquare.playerName}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">This square is empty</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Click a square on the grid to view details
                  </p>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
