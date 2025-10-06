'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OnScreenKeyboard } from '@/components/on-screen-keyboard';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  CheckCircle, 
  Lock, 
  Trash2,
  DollarSign,
  User,
  Archive,
  Download,
  Upload,
  Edit,
  Keyboard as KeyboardIcon
} from 'lucide-react';

interface Board {
  id: string;
  name: string;
  gameId: string;
  teamHome: string;
  teamAway: string;
  costPerSquare: number;
  status: string;
  isFinalized: boolean;
  rowNumbers: string | null;
  colNumbers: string | null;
  squares: any[];
}

export default function ManageBoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchBoards();
    fetchKeyboardSetting();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards?includeGameData=false');
      if (!response.ok) throw new Error('Failed to fetch boards');
      const data = await response.json();
      setBoards(data.boards);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load boards',
        variant: 'destructive',
      });
    } finally {
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

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setNewBoardName(board.name);
    setEditDialogOpen(true);
  };

  const handleSaveBoardName = async () => {
    if (!editingBoard || !newBoardName.trim()) {
      toast({
        title: 'Error',
        description: 'Board name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/boards/${editingBoard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update board name');

      toast({
        title: 'Success',
        description: 'Board name updated',
      });

      setEditDialogOpen(false);
      setShowKeyboard(false);
      fetchBoards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFinalizeBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to finalize this board? This will reveal the numbers and cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/boards/${boardId}/finalize`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to finalize board');
      }

      toast({
        title: 'Success',
        description: 'Board finalized! Numbers have been revealed.',
      });

      fetchBoards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleCloseBoard = async (boardId: string) => {
    if (!confirm('Close this board? No more squares can be purchased.')) {
      return;
    }

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to close board');
      }

      toast({
        title: 'Success',
        description: 'Board closed',
      });

      fetchBoards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleArchiveBoard = async (boardId: string, boardName: string) => {
    if (!confirm(`Archive "${boardName}"? archived boards are hidden from the main view but can be restored.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive board');
      }

      toast({
        title: 'Success',
        description: 'Board archived',
      });

      fetchBoards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBoard = async (boardId: string, boardName: string) => {
    if (!confirm(`⚠️ DELETE "${boardName}"?\n\nThis will permanently delete:\n• All squares and player data\n• All payment records\n• All winners\n\nThis CANNOT be undone!\n\nType the board name to confirm.`)) {
      return;
    }

    const confirmName = prompt(`Type "${boardName}" to confirm deletion:`);
    if (confirmName !== boardName) {
      toast({
        title: 'Cancelled',
        description: 'Board name did not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete board');
      }

      toast({
        title: 'Success',
        description: 'Board permanently deleted',
      });

      fetchBoards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleExportBoard = (boardId: string, boardName: string) => {
    // Trigger download
    window.location.href = `/api/boards/${boardId}/export`;
    toast({
      title: 'Exporting',
      description: `Downloading backup for ${boardName}`,
    });
  };

  const handleImportBoard = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch('/api/boards/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to import board');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: result.message,
      });

      fetchBoards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid backup file',
        variant: 'destructive',
      });
    }

    // Reset input
    event.target.value = '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'closed': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Boards</h1>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              id="import-file"
              className="hidden"
              onChange={handleImportBoard}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Board
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {boards.map((board) => {
            const filledSquares = board.squares.length;
            const paidSquares = board.squares.filter((s: any) => s.isPaid).length;

            return (
              <Card key={board.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{board.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {board.teamAway} @ {board.teamHome}
                      </p>
                    </div>
                    <Badge className={getStatusColor(board.status)}>
                      {board.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Filled Squares</p>
                      <p className="text-2xl font-bold">{filledSquares}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paid Squares</p>
                      <p className="text-2xl font-bold text-green-600">{paidSquares}/{filledSquares}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cost/Square</p>
                      <p className="text-2xl font-bold">${board.costPerSquare}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-bold">
                        {board.isFinalized ? (
                          <span className="text-blue-600">Finalized</span>
                        ) : (
                          <span className="text-yellow-600">Not Finalized</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!board.isFinalized && (
                      <Button
                        onClick={() => handleFinalizeBoard(board.id)}
                        variant="default"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalize & Reveal Numbers
                      </Button>
                    )}
                    
                    {board.isFinalized && (
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/boards/${board.id}/update-winners?force=true`, {
                              method: 'POST',
                            });
                            const data = await response.json();
                            toast({
                              title: 'Success',
                              description: data.message || 'Winners updated',
                            });
                            fetchBoards();
                          } catch (error: any) {
                            toast({
                              title: 'Error',
                              description: error.message,
                              variant: 'destructive',
                            });
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Winners
                      </Button>
                    )}
                    
                    {board.status === 'open' && (
                      <Button
                        onClick={() => handleCloseBoard(board.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Close Board
                      </Button>
                    )}

                    <Button
                      onClick={() => handleEditBoard(board)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Name
                    </Button>

                    <Button
                      onClick={() => router.push(`/admin/boards/${board.id}/squares`)}
                      variant="outline"
                      size="sm"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Manage Squares
                    </Button>

                    <Button
                      onClick={() => router.push(`/admin/boards/${board.id}/payments`)}
                      variant="outline"
                      size="sm"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Track Payments
                    </Button>

                    <Button
                      onClick={() => handleExportBoard(board.id, board.name)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>

                    <Button
                      onClick={() => handleArchiveBoard(board.id, board.name)}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>

                    <Button
                      onClick={() => handleDeleteBoard(board.id, board.name)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {boards.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No boards found</p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push('/admin/boards/create')}
                >
                  Create Your First Board
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Board Name Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        // Only allow closing if keyboard is not open
        if (!showKeyboard) {
          setEditDialogOpen(open);
        }
      }}>
        <DialogContent 
          onInteractOutside={(e) => {
            // Prevent closing when clicking keyboard
            if (showKeyboard) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent Escape from closing dialog when keyboard is open
            if (showKeyboard) {
              e.preventDefault();
              setShowKeyboard(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Board Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                  setShowKeyboard(true);
                }
              }}>
                <Input
                  id="boardName"
                  placeholder={keyboardEnabled ? "Tap to open keyboard" : "Enter board name"}
                  value={newBoardName}
                  onChange={(e) => !keyboardEnabled && setNewBoardName(e.target.value)}
                  readOnly={keyboardEnabled}
                  className={keyboardEnabled ? "cursor-pointer" : ""}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !keyboardEnabled) {
                      handleSaveBoardName();
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setShowKeyboard(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveBoardName}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* On-Screen Keyboard */}
      {showKeyboard && keyboardEnabled && editDialogOpen && (
        <OnScreenKeyboard
          value={newBoardName}
          onChange={setNewBoardName}
          onClose={() => setShowKeyboard(false)}
          placeholder="Enter Board Name"
        />
      )}
    </div>
  );
}
