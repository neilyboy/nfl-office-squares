'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Key, Shield } from 'lucide-react';

export default function SetupPage() {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate PIN
    if (!/^\d{4}$|^\d{6}$/.test(pin)) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be 4 or 6 digits',
        variant: 'destructive',
      });
      return;
    }

    // Validate password
    if (password.length < 8) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      toast({
        title: 'Setup Complete!',
        description: 'Redirecting to admin dashboard...',
      });

      // Small delay to ensure cookie is properly set before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use window.location for full page reload to ensure cookie is sent
      window.location.href = '/admin';
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to NFL Squares</CardTitle>
          <CardDescription>
            Let's set up your admin access. You'll need a PIN and a recovery password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PIN */}
            <div className="space-y-2">
              <Label htmlFor="pin">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Admin PIN
                </div>
              </Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 4 or 6 digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
              <p className="text-xs text-muted-foreground">
                This PIN will be used to access the admin area
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Recovery Password
                </div>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter recovery password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Used to reset your PIN if you forget it (min. 8 characters)
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm recovery password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
