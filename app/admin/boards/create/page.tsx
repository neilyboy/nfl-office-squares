'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { OnScreenKeyboard } from '@/components/on-screen-keyboard';
import { ArrowLeft, DollarSign, Percent, Calendar, Shield, Keyboard as KeyboardIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Game {
  id: string;
  name: string;
  shortName: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbr: string;
  awayAbbr: string;
}

export default function CreateBoardPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  
  // Form state
  const [selectedGameId, setSelectedGameId] = useState('');
  const [boardName, setBoardName] = useState('');
  const [costPerSquare, setCostPerSquare] = useState('10');
  const [payoutType, setPayoutType] = useState<'percentage' | 'dollar'>('percentage');
  const [payoutQ1, setPayoutQ1] = useState('25');
  const [payoutQ2, setPayoutQ2] = useState('25');
  const [payoutQ3, setPayoutQ3] = useState('25');
  const [payoutQ4, setPayoutQ4] = useState('25');
  
  // Payment methods
  const [allowPaypal, setAllowPaypal] = useState(true);
  const [paypalUsername, setPaypalUsername] = useState('');
  const [allowVenmo, setAllowVenmo] = useState(true);
  const [venmoUsername, setVenmoUsername] = useState('');
  const [allowCash, setAllowCash] = useState(true);

  // On-screen keyboard
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState<'boardName' | 'paypal' | 'venmo' | null>(null);

  useEffect(() => {
    fetchGames();
    fetchKeyboardSetting();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games/upcoming');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(data.games || []);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load games',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const fetchKeyboardSetting = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setKeyboardEnabled(data.settings?.enableOnScreenKeyboard || false);
      }
    } catch (error) {
      console.error('Failed to fetch keyboard setting:', error);
    }
  };

  const validatePayouts = () => {
    if (payoutType === 'percentage') {
      const total = parseFloat(payoutQ1) + parseFloat(payoutQ2) + parseFloat(payoutQ3) + parseFloat(payoutQ4);
      if (Math.abs(total - 100) > 0.01) {
        toast({
          title: 'Invalid Payouts',
          description: 'Percentage payouts must total 100%',
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePayouts()) return;

    if (!allowPaypal && !allowVenmo && !allowCash) {
      toast({
        title: 'No Payment Methods',
        description: 'Please enable at least one payment method',
        variant: 'destructive',
      });
      return;
    }

    if (allowPaypal && !paypalUsername.trim()) {
      toast({
        title: 'PayPal Username Required',
        description: 'Please enter a PayPal username or disable PayPal',
        variant: 'destructive',
      });
      return;
    }

    if (allowVenmo && !venmoUsername.trim()) {
      toast({
        title: 'Venmo Username Required',
        description: 'Please enter a Venmo username or disable Venmo',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedGame = games.find(g => g.id === selectedGameId);
      if (!selectedGame) throw new Error('Game not found');

      const response = await fetch('/api/admin/boards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGameId,
          name: boardName,
          teamHome: selectedGame.homeAbbr,
          teamAway: selectedGame.awayAbbr,
          costPerSquare: parseFloat(costPerSquare),
          payoutType,
          payoutQ1: parseFloat(payoutQ1),
          payoutQ2: parseFloat(payoutQ2),
          payoutQ3: parseFloat(payoutQ3),
          payoutQ4: parseFloat(payoutQ4),
          allowPaypal,
          paypalUsername: allowPaypal ? paypalUsername : null,
          allowVenmo,
          venmoUsername: allowVenmo ? venmoUsername : null,
          allowCash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create board');
      }

      toast({
        title: 'Board Created!',
        description: `${boardName} is ready for players`,
      });

      router.push('/admin');
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

  const selectedGame = games.find(g => g.id === selectedGameId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create New Board</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Game
              </CardTitle>
              <CardDescription>Choose an upcoming NFL game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Game</Label>
                <Select value={selectedGameId} onValueChange={setSelectedGameId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game..." />
                  </SelectTrigger>
                  <SelectContent>
                    {games.length === 0 ? (
                      <SelectItem value="none" disabled>No upcoming games found</SelectItem>
                    ) : (
                      games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.shortName} - {formatDate(game.date)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedGame && (
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="font-semibold">{selectedGame.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedGame.date)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Board Details */}
          <Card>
            <CardHeader>
              <CardTitle>Board Details</CardTitle>
              <CardDescription>Configure your squares board</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="boardName">Board Name</Label>
                  {keyboardEnabled && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <KeyboardIcon className="w-3 h-3" />
                      Tap to type
                    </span>
                  )}
                </div>
                <div onClick={() => {
                  if (keyboardEnabled && !showKeyboard) {
                    setActiveField('boardName');
                    setShowKeyboard(true);
                  }
                }}>
                  <Input
                    id="boardName"
                    placeholder={keyboardEnabled ? "Tap to open keyboard" : "e.g., Super Bowl Main Board, $5 Kids Board"}
                    value={boardName}
                    onChange={(e) => !keyboardEnabled && setBoardName(e.target.value)}
                    readOnly={keyboardEnabled}
                    className={keyboardEnabled ? "cursor-pointer" : ""}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerSquare">Cost Per Square ($)</Label>
                <Input
                  id="costPerSquare"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="10.00"
                  value={costPerSquare}
                  onChange={(e) => setCostPerSquare(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Payouts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Quarter Payouts
              </CardTitle>
              <CardDescription>Configure how much each quarter pays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Payout Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={payoutType === 'percentage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPayoutType('percentage')}
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    Percentage
                  </Button>
                  <Button
                    type="button"
                    variant={payoutType === 'dollar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPayoutType('dollar')}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Dollar Amount
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="q1">Quarter 1</Label>
                  <Input
                    id="q1"
                    type="number"
                    step="0.01"
                    min="0"
                    value={payoutQ1}
                    onChange={(e) => setPayoutQ1(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q2">Quarter 2</Label>
                  <Input
                    id="q2"
                    type="number"
                    step="0.01"
                    min="0"
                    value={payoutQ2}
                    onChange={(e) => setPayoutQ2(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q3">Quarter 3</Label>
                  <Input
                    id="q3"
                    type="number"
                    step="0.01"
                    min="0"
                    value={payoutQ3}
                    onChange={(e) => setPayoutQ3(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q4">Quarter 4</Label>
                  <Input
                    id="q4"
                    type="number"
                    step="0.01"
                    min="0"
                    value={payoutQ4}
                    onChange={(e) => setPayoutQ4(e.target.value)}
                    required
                  />
                </div>
              </div>

              {payoutType === 'percentage' && (
                <p className="text-sm text-muted-foreground">
                  Total: {parseFloat(payoutQ1) + parseFloat(payoutQ2) + parseFloat(payoutQ3) + parseFloat(payoutQ4)}%
                  {Math.abs((parseFloat(payoutQ1) + parseFloat(payoutQ2) + parseFloat(payoutQ3) + parseFloat(payoutQ4)) - 100) > 0.01 && (
                    <span className="text-destructive ml-2">Must equal 100%</span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Choose which payment methods to accept</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PayPal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="paypal-toggle">Accept PayPal</Label>
                  <Switch
                    id="paypal-toggle"
                    checked={allowPaypal}
                    onCheckedChange={setAllowPaypal}
                  />
                </div>
                {allowPaypal && (
                  <div onClick={() => {
                    if (keyboardEnabled && !showKeyboard) {
                      setActiveField('paypal');
                      setShowKeyboard(true);
                    }
                  }}>
                    <Input
                      placeholder={keyboardEnabled ? "Tap to open keyboard" : "PayPal username (e.g., yourname)"}
                      value={paypalUsername}
                      onChange={(e) => !keyboardEnabled && setPaypalUsername(e.target.value)}
                      readOnly={keyboardEnabled}
                      className={keyboardEnabled ? "cursor-pointer" : ""}
                    />
                  </div>
                )}
              </div>

              {/* Venmo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="venmo-toggle">Accept Venmo</Label>
                  <Switch
                    id="venmo-toggle"
                    checked={allowVenmo}
                    onCheckedChange={setAllowVenmo}
                  />
                </div>
                {allowVenmo && (
                  <div onClick={() => {
                    if (keyboardEnabled && !showKeyboard) {
                      setActiveField('venmo');
                      setShowKeyboard(true);
                    }
                  }}>
                    <Input
                      placeholder={keyboardEnabled ? "Tap to open keyboard" : "Venmo username (e.g., @yourname)"}
                      value={venmoUsername}
                      onChange={(e) => !keyboardEnabled && setVenmoUsername(e.target.value)}
                      readOnly={keyboardEnabled}
                      className={keyboardEnabled ? "cursor-pointer" : ""}
                    />
                  </div>
                )}
              </div>

              {/* Cash */}
              <div className="flex items-center justify-between">
                <Label htmlFor="cash-toggle">Accept Cash</Label>
                <Switch
                  id="cash-toggle"
                  checked={allowCash}
                  onCheckedChange={setAllowCash}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedGameId}
              className="flex-1"
            >
              {submitting ? 'Creating...' : 'Create Board'}
            </Button>
          </div>
        </form>
      </div>

      {/* On-Screen Keyboard */}
      {showKeyboard && keyboardEnabled && activeField && (
        <OnScreenKeyboard
          value={
            activeField === 'boardName' ? boardName :
            activeField === 'paypal' ? paypalUsername :
            venmoUsername
          }
          onChange={(value) => {
            if (activeField === 'boardName') setBoardName(value);
            else if (activeField === 'paypal') setPaypalUsername(value);
            else if (activeField === 'venmo') setVenmoUsername(value);
          }}
          onClose={() => {
            setShowKeyboard(false);
            setActiveField(null);
          }}
          placeholder={
            activeField === 'boardName' ? 'Enter Board Name' :
            activeField === 'paypal' ? 'Enter PayPal Username' :
            'Enter Venmo Username'
          }
        />
      )}
    </div>
  );
}
