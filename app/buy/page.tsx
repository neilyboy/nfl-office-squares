'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SquaresGrid } from '@/components/squares-grid';
import { OnScreenKeyboard } from '@/components/on-screen-keyboard';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, User, CreditCard, ArrowLeft, Keyboard as KeyboardIcon } from 'lucide-react';

function BuyPageContent() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get('boardId');
  const router = useRouter();
  const { toast } = useToast();

  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSquares, setSelectedSquares] = useState<Set<string>>(new Set());
  const [playerName, setPlayerName] = useState('');
  const [step, setStep] = useState<'select' | 'details' | 'payment'>('select');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!boardId) {
      router.push('/');
      return;
    }

    fetchBoard();
    checkKeyboardSetting();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`);
      if (!response.ok) throw new Error('Board not found');
      const data = await response.json();
      setBoard(data.board);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load board',
        variant: 'destructive',
      });
      router.push('/');
    }
  };

  const checkKeyboardSetting = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setKeyboardEnabled(data.settings?.enableOnScreenKeyboard || false);
      }
    } catch (error) {
      console.error('Failed to check keyboard setting:', error);
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    const key = `${row},${col}`;
    const newSelected = new Set(selectedSquares);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedSquares(newSelected);
  };

  const handleContinue = () => {
    if (selectedSquares.size === 0) {
      toast({
        title: 'No Squares Selected',
        description: 'Please select at least one square',
        variant: 'destructive',
      });
      return;
    }
    setStep('details');
  };

  const handleSubmitDetails = () => {
    if (!playerName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }
    setStep('payment');
  };

  const handlePayment = async (method: 'paypal' | 'venmo' | 'cash') => {
    setSubmitting(true);
    try {
      const squares = Array.from(selectedSquares).map((key) => {
        const [row, col] = key.split(',').map(Number);
        return { row, col };
      });

      const response = await fetch('/api/squares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          squares,
          playerName,
          paymentMethod: method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reserve squares');
      }

      toast({
        title: 'Success!',
        description: `Reserved ${squares.length} square(s) for ${playerName}`,
      });

      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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

  const totalCost = selectedSquares.size * board.costPerSquare;
  const availableSquares = 100 - board.squares.length;

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{board.name}</h1>
          <div className="w-20" />
        </div>

        {step === 'select' && (
          <>
            {/* Info Card */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost per Square</p>
                    <p className="text-xl font-bold">{formatCurrency(board.costPerSquare)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-xl font-bold">{availableSquares} / 100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Selected</p>
                    <p className="text-xl font-bold text-primary">{selectedSquares.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-xl font-bold text-green-500">{formatCurrency(totalCost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid */}
            <div style={{ overflow: 'visible' }}>
              <SquaresGrid
                squares={board.squares}
                rowNumbers={board.isFinalized ? JSON.parse(board.rowNumbers) : null}
                colNumbers={board.isFinalized ? JSON.parse(board.colNumbers) : null}
                isFinalized={board.isFinalized}
                homeTeamAbbr={board.teamHome}
                awayTeamAbbr={board.teamAway}
                onSquareClick={handleSquareClick}
                selectedSquares={selectedSquares}
              />
            </div>

            {/* Continue Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
              <div className="max-w-6xl mx-auto">
                <Button
                  onClick={handleContinue}
                  disabled={selectedSquares.size === 0}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue ({selectedSquares.size} square{selectedSquares.size !== 1 ? 's' : ''} - {formatCurrency(totalCost)})
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="playerName">Your Name</Label>
                <div className="relative">
                  <Input
                    id="playerName"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onFocus={() => keyboardEnabled && setShowKeyboard(true)}
                    className="pr-10"
                  />
                  {keyboardEnabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1"
                      onClick={() => setShowKeyboard(!showKeyboard)}
                    >
                      <KeyboardIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmitDetails} className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-bold text-foreground">{formatCurrency(totalCost)}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Player: <span className="font-bold text-foreground">{playerName}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Squares: <span className="font-bold text-foreground">{selectedSquares.size}</span>
                </p>
              </div>

              <div className="grid gap-3">
                {board.paymentConfig?.allowVenmo && (
                  <Button
                    onClick={() => handlePayment('venmo')}
                    disabled={submitting}
                    variant="outline"
                    className="h-auto py-4"
                  >
                    <div className="text-left w-full">
                      <div className="font-semibold">Venmo</div>
                      <div className="text-sm text-muted-foreground">
                        @{board.paymentConfig.venmoUsername}
                      </div>
                    </div>
                  </Button>
                )}

                {board.paymentConfig?.allowPaypal && (
                  <Button
                    onClick={() => handlePayment('paypal')}
                    disabled={submitting}
                    variant="outline"
                    className="h-auto py-4"
                  >
                    <div className="text-left w-full">
                      <div className="font-semibold">PayPal</div>
                      <div className="text-sm text-muted-foreground">
                        @{board.paymentConfig.paypalUsername}
                      </div>
                    </div>
                  </Button>
                )}

                {board.paymentConfig?.allowCash && (
                  <Button
                    onClick={() => handlePayment('cash')}
                    disabled={submitting}
                    variant="outline"
                    className="h-auto py-4"
                  >
                    <div className="text-left w-full">
                      <div className="font-semibold">Cash</div>
                      <div className="text-sm text-muted-foreground">
                        Pay the admin directly
                      </div>
                    </div>
                  </Button>
                )}
              </div>

              <Button variant="ghost" onClick={() => setStep('details')} className="w-full">
                Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* On-screen keyboard */}
      {keyboardEnabled && showKeyboard && step === 'details' && (
        <OnScreenKeyboard
          value={playerName}
          onChange={setPlayerName}
          onClose={() => setShowKeyboard(false)}
          placeholder="Enter your name"
        />
      )}
    </div>
  );
}

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>}>
      <BuyPageContent />
    </Suspense>
  );
}
