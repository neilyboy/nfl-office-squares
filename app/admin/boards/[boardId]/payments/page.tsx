'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, DollarSign, CheckCheck, X } from 'lucide-react';

export default function PaymentsPage({ params }: { params: { boardId: string } }) {
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const togglePayment = async (squareId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/squares/${squareId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update payment status');

      toast({
        title: 'Success',
        description: !currentStatus ? 'Payment marked as received' : 'Payment unmarked',
      });

      fetchBoard();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markAllPaid = async () => {
    if (!confirm('Mark all squares as paid?')) return;

    try {
      const updates = board.squares
        .filter((s: any) => s.playerName && !s.isPaid)
        .map((s: any) => 
          fetch(`/api/squares/${s.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPaid: true }),
          })
        );

      await Promise.all(updates);

      toast({
        title: 'Success',
        description: 'All squares marked as paid',
      });

      fetchBoard();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markPlayerSquares = async (playerName: string, isPaid: boolean) => {
    if (!confirm(`Mark all of ${playerName}'s squares as ${isPaid ? 'paid' : 'unpaid'}?`)) return;

    try {
      const playerSquaresList = board.squares.filter((s: any) => s.playerName === playerName);
      const updates = playerSquaresList.map((s: any) => 
        fetch(`/api/squares/${s.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPaid }),
        })
      );

      await Promise.all(updates);

      toast({
        title: 'Success',
        description: `All of ${playerName}'s squares marked as ${isPaid ? 'paid' : 'unpaid'}`,
      });

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
  const paidSquares = filledSquares.filter((s: any) => s.isPaid);
  const unpaidSquares = filledSquares.filter((s: any) => !s.isPaid);

  // Group by player
  const playerSquares = filledSquares.reduce((acc: any, square: any) => {
    if (!acc[square.playerName]) {
      acc[square.playerName] = [];
    }
    acc[square.playerName].push(square);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{board.name} - Payments</h1>
            <p className="text-muted-foreground mt-1">
              {paidSquares.length}/{filledSquares.length} squares paid
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/boards')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Owed</p>
              <p className="text-2xl font-bold">${board.costPerSquare * filledSquares.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-green-600">${board.costPerSquare * paidSquares.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">${board.costPerSquare * unpaidSquares.length}</p>
            </CardContent>
          </Card>
        </div>

        {unpaidSquares.length > 0 && (
          <div className="mb-6">
            <Button onClick={markAllPaid} className="w-full" size="lg">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All as Paid
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Payments by Player</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.keys(playerSquares).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No squares claimed yet
                </p>
              )}

              {Object.entries(playerSquares).map(([playerName, squares]: [string, any]) => {
                const playerTotal = squares.length * board.costPerSquare;
                const playerPaid = squares.filter((s: any) => s.isPaid).length;
                const allPaid = playerPaid === squares.length;

                return (
                  <div key={playerName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{playerName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {squares.length} square{squares.length > 1 ? 's' : ''} • ${playerTotal} total
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!allPaid && (
                          <Button
                            size="sm"
                            onClick={() => markPlayerSquares(playerName, true)}
                          >
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Mark All Paid
                          </Button>
                        )}
                        {playerPaid > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPlayerSquares(playerName, false)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Mark All Unpaid
                          </Button>
                        )}
                        {allPaid ? (
                          <Badge className="bg-green-500">{playerPaid}/{squares.length} Paid</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600">
                            {playerPaid}/{squares.length} Paid
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {squares.map((square: any) => (
                        <div
                          key={square.id}
                          className="flex items-center justify-between p-2 bg-secondary/20 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={square.isPaid}
                              onCheckedChange={() => togglePayment(square.id, square.isPaid)}
                            />
                            <div className="text-sm">
                              <span className="font-medium">
                                Square ({square.row + 1}, {square.col + 1})
                              </span>
                              <span className="text-muted-foreground ml-2">
                                • {square.paymentMethod || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">${board.costPerSquare}</span>
                            {square.isPaid ? (
                              <Badge className="bg-green-500 text-xs">Paid</Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 text-xs">Unpaid</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
