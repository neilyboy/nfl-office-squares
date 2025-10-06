'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Shield, 
  Plus, 
  Settings, 
  BarChart3, 
  Archive,
  Lock,
  Keyboard as KeyboardIcon,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { OnScreenKeyboard } from '@/components/on-screen-keyboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Don't check setup here - admin page should always be accessible
    // The main page handles redirecting to setup if needed
    checkSession();
    fetchSettings();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/admin/session');
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setKeyboardEnabled(data.settings?.enableOnScreenKeyboard || false);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowKeyboard(false); // Close keyboard on submit
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin dashboard',
      });

      setIsAuthenticated(true);
      setPin(''); // Clear PIN after successful login
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyboardToggle = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enableOnScreenKeyboard: enabled }),
      });

      if (!response.ok) throw new Error('Failed to update setting');

      setKeyboardEnabled(enabled);
      toast({
        title: 'Setting Updated',
        description: `On-screen keyboard ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update keyboard setting',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your PIN to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pin">PIN</Label>
                  {keyboardEnabled && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <KeyboardIcon className="w-3 h-3" />
                      Tap to use keyboard
                    </span>
                  )}
                </div>
                <div onClick={() => keyboardEnabled && !showKeyboard && setShowKeyboard(true)}>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder={keyboardEnabled ? "Tap to open keyboard" : "Enter your PIN"}
                    value={pin}
                    onChange={(e) => !keyboardEnabled && setPin(e.target.value.replace(/\D/g, ''))}
                    readOnly={keyboardEnabled}
                    className={keyboardEnabled ? "cursor-pointer" : ""}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Back to Boards
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* On-Screen Keyboard */}
        {showKeyboard && keyboardEnabled && (
          <OnScreenKeyboard
            value={pin}
            onChange={(value) => setPin(value.replace(/\D/g, '').slice(0, 6))}
            onClose={() => setShowKeyboard(false)}
            placeholder="Enter PIN (Numbers Only)"
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' });
                router.push('/');
              }}
            >
              <Lock className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                // Logout for security when going back to public view
                await fetch('/api/admin/logout', { method: 'POST' });
                router.push('/');
              }}
            >
              Back to Boards
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Board Management
              </CardTitle>
              <CardDescription>Create and manage squares boards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/boards/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Board
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/boards')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Manage Boards
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/boards/archived')}
              >
                <Archive className="w-4 h-4 mr-2" />
                View Archives
              </Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </CardTitle>
              <CardDescription>Configure application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyboardIcon className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="keyboard-toggle">On-Screen Keyboard</Label>
                </div>
                <Switch
                  id="keyboard-toggle"
                  checked={keyboardEnabled}
                  onCheckedChange={handleKeyboardToggle}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable on-screen keyboard for touchscreen devices
              </p>

              <Button className="w-full justify-start" variant="outline">
                <Lock className="w-4 h-4 mr-2" />
                Change PIN
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Full admin features are being built! This includes:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Create boards from ESPN game schedule</li>
              <li>Configure payouts (percentage or dollar amounts)</li>
              <li>Manage payment methods per board</li>
              <li>Finalize boards (reveal numbers)</li>
              <li>Mark payments as complete</li>
              <li>Delete/archive boards</li>
              <li>Backup and restore functionality</li>
              <li>View detailed board statistics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
