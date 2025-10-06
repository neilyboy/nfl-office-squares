'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnScreenKeyboard } from '@/components/on-screen-keyboard';
import { Check, X, User, DollarSign, CreditCard } from 'lucide-react';
import { getInitials, getAvatarColorFromString } from '@/lib/utils';

interface Square {
  id: string;
  boardId: string;
  row: number;
  col: number;
  playerName: string | null;
  paymentMethod: string | null;
  isPaid: boolean;
}

interface PaymentConfig {
  paypalUsername: string | null;
  venmoUsername: string | null;
  allowCash: boolean;
  allowPaypal: boolean;
  allowVenmo: boolean;
}

interface SquareSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  square: Square | null;
  boardId: string;
  isAdmin: boolean;
  enableOnScreenKeyboard: boolean;
  onSquareUpdated: () => void;
  paymentConfig: PaymentConfig | null;
}

export function SquareSelectionDialog({
  open,
  onClose,
  square,
  boardId,
  isAdmin,
  enableOnScreenKeyboard,
  onSquareUpdated,
  paymentConfig,
}: SquareSelectionDialogProps) {
  const [playerName, setPlayerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  useEffect(() => {
    if (square) {
      setPlayerName(square.playerName || '');
      setPaymentMethod(square.paymentMethod || '');
      setIsPaid(square.isPaid || false);
    } else {
      setPlayerName('');
      setPaymentMethod('');
      setIsPaid(false);
    }
  }, [square]);

  const handleSave = async () => {
    if (!square || !playerName.trim()) return;

    setLoading(true);
    try {
      const requestData = {
        playerName: playerName.trim(),
        paymentMethod: paymentMethod,
        isPaid: isAdmin ? isPaid : false,
        row: square.row,
        col: square.col,
      };
      
      console.log('Saving square:', {
        url: `/api/boards/${boardId}/squares/${square.id}`,
        data: requestData
      });

      const response = await fetch(`/api/boards/${boardId}/squares/${square.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        throw new Error(errorData.error || 'Failed to update square');
      }

      onSquareUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating square:', error);
      alert(`Failed to update square: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSquare = async () => {
    if (!square || !isAdmin) return;

    if (!confirm('Are you sure you want to clear this square?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/boards/${boardId}/squares/${square.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear square');

      onSquareUpdated();
      onClose();
    } catch (error) {
      console.error('Error clearing square:', error);
      alert('Failed to clear square. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!square) return null;

  const isNewSquare = !square.playerName;
  const isReadOnly = !isAdmin && !isNewSquare; // Non-admin viewing existing square
  const avatarColor = playerName ? getAvatarColorFromString(playerName) : '#64748b';

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
          // Prevent closing when clicking on keyboard
          if (showKeyboard) {
            e.preventDefault();
          }
        }}>
          <DialogHeader>
            <DialogTitle>
              {isReadOnly ? 'Square Details' : (isNewSquare ? 'Claim Square' : 'Update Square')}
            </DialogTitle>
            <DialogDescription>
              Row {square.row + 1}, Column {square.col + 1}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Player Preview */}
            {playerName && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getInitials(playerName)}
                </div>
                <div>
                  <p className="font-semibold">{playerName}</p>
                  <p className="text-xs text-muted-foreground">
                    Position: ({square.row + 1}, {square.col + 1})
                  </p>
                </div>
              </div>
            )}

            {/* Read-only view for non-admin users */}
            {isReadOnly ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <span className="capitalize font-medium">{paymentMethod || 'Unknown'}</span>
                </div>
                {square.isPaid && (
                  <div className="flex items-center gap-2 text-green-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">Payment Received</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Player Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="playerName">
                    <User className="w-4 h-4 inline mr-1" />
                    Player Name
                  </Label>
                  <div onClick={() => enableOnScreenKeyboard && !showKeyboard && setShowKeyboard(true)}>
                    <Input
                      id="playerName"
                      value={playerName}
                      onChange={(e) => !enableOnScreenKeyboard && setPlayerName(e.target.value)}
                      placeholder="Enter player name..."
                      autoComplete="off"
                      readOnly={enableOnScreenKeyboard}
                      className="text-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                {!isAdmin && (
              <div className="space-y-2">
                <Label>
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Payment Method
                </Label>
                <div className="grid gap-2">
                  {/* Always show cash as fallback */}
                  {(!paymentConfig || paymentConfig.allowCash) && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-lg border transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💵</span>
                        <span className="font-medium">Cash</span>
                      </div>
                    </button>
                  )}
                  {paymentConfig?.allowPaypal && paymentConfig?.paypalUsername && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 rounded-lg border transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">PayPal</span>
                      </div>
                    </button>
                  )}
                  {paymentConfig?.allowVenmo && paymentConfig?.venmoUsername && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('venmo')}
                      className={`p-3 rounded-lg border transition-all ${
                        paymentMethod === 'venmo'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Venmo</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Payment Status (Admin Only) */}
            {isAdmin && (
              <>
                <div className="space-y-2">
                  <Label>Current Payment Method</Label>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                    {square?.paymentMethod ? (
                      <span className="font-medium capitalize">{square.paymentMethod}</span>
                    ) : (
                      <span className="text-muted-foreground">None selected</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <Label htmlFor="isPaid" className="flex items-center gap-2 cursor-pointer">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Payment Received
                  </Label>
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="w-5 h-5 accent-green-500 cursor-pointer"
                  />
                </div>
              </>
            )}
              </>
            )}

            {/* Action Buttons */}
            {isReadOnly ? (
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={!playerName.trim() || (!isAdmin && !paymentMethod) || loading}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isNewSquare ? 'Claim Square' : 'Update'}
                  </Button>
                  <Button variant="outline" onClick={onClose} disabled={loading}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>

                {/* Clear Square (Admin Only) */}
                {isAdmin && !isNewSquare && (
                  <Button
                    variant="destructive"
                    onClick={handleClearSquare}
                    disabled={loading}
                    className="w-full"
                  >
                    Clear Square
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
        
        {/* On-Screen Keyboard - Inside Dialog portal */}
        {showKeyboard && enableOnScreenKeyboard && (
          <OnScreenKeyboard
            value={playerName}
            onChange={setPlayerName}
            onClose={() => setShowKeyboard(false)}
            placeholder="Enter player name"
          />
        )}
      </Dialog>
    </>
  );
}
