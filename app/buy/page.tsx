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
import { ShoppingCart, User, CreditCard, ArrowLeft, Keyboard as KeyboardIcon, ChevronLeft, ChevronRight } from 'lucide-react';

function BuyPageContent() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get('boardId');
  const router = useRouter();
  const { toast } = useToast();

  const [boards, setBoards] = useState<any[]>([]);
  const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSquares, setSelectedSquares] = useState<Set<string>>(new Set());
  const [playerName, setPlayerName] = useState('');
  const [step, setStep] = useState<'select' | 'details' | 'payment'>('select');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBoards();
    checkKeyboardSetting();
  }, []);

  useEffect(() => {
    // Find the board index when boardId changes or boards load
    if (boardId && boards.length > 0) {
      const index = boards.findIndex(b => b.id === parseInt(boardId));
      if (index !== -1) {
        setCurrentBoardIndex(index);
      }
    }
  }, [boardId, boards]);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) throw new Error('Failed to load boards');
      const data = await response.json();
      const openBoards = data.boards.filter((b: any) => b.status === 'open');
      setBoards(openBoards);
      
      // If no boardId in URL and we have boards, use first one
      if (!boardId && openBoards.length > 0) {
        router.push(`/buy?boardId=${openBoards[0].id}`);
      }
      
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load boards',
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

  const handlePrevBoard = () => {
    if (currentBoardIndex > 0) {
      const newIndex = currentBoardIndex - 1;
      setCurrentBoardIndex(newIndex);
      router.push(`/buy?boardId=${boards[newIndex].id}`);
      // Reset selections when changing boards
      setSelectedSquares(new Set());
      setStep('select');
    }
  };

  const handleNextBoard = () => {
    if (currentBoardIndex < boards.length - 1) {
      const newIndex = currentBoardIndex + 1;
      setCurrentBoardIndex(newIndex);
      router.push(`/buy?boardId=${boards[newIndex].id}`);
      // Reset selections when changing boards
      setSelectedSquares(new Set());
      setStep('select');
    }
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
          boardId: board.id,
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

  if (boards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No open boards available</p>
      </div>
    );
  }

  const board = boards[currentBoardIndex];
  if (!board) return null;

  const totalCost = selectedSquares.size * board.costPerSquare;
  const availableSquares = 100 - board.squares.length;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden p-2 md:p-4 lg:p-6 lg:px-8 pt-6 md:pt-8">
      <div className="h-full w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {boards.length > 1 && (
              <>
                <Button variant="outline" size="sm" onClick={handlePrevBoard} disabled={currentBoardIndex === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentBoardIndex + 1}/{boards.length}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextBoard} disabled={currentBoardIndex === boards.length - 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex-1" /> {/* Spacer */}
          <h1 className="text-lg md:text-xl font-bold">{board.name}</h1>
        </div>

        {step === 'select' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 lg:min-h-0 pb-24 lg:pb-0">
            {/* Left: Grid */}
            <div className="flex flex-col lg:min-h-0">
              <div className="lg:overflow-visible lg:h-full flex items-center justify-center">
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
            </div>

            {/* Right: Info Panel */}
            <div className="hidden lg:block lg:overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Purchase Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost per Square</p>
                    <p className="text-2xl font-bold">{formatCurrency(board.costPerSquare)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold">{availableSquares} / 100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Selected</p>
                    <p className="text-2xl font-bold text-primary">{selectedSquares.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(totalCost)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        )}

        {/* Continue Button - Fixed at bottom */}
        {step === 'select' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border lg:hidden">
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
        )}

        {/* Desktop Continue Button */}
        {step === 'select' && (
          <div className="hidden lg:block fixed bottom-4 right-4">
            <Button
              onClick={handleContinue}
              disabled={selectedSquares.size === 0}
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue ({selectedSquares.size} square{selectedSquares.size !== 1 ? 's' : ''} - {formatCurrency(totalCost)})
            </Button>
          </div>
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
