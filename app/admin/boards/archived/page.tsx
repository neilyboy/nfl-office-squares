'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';

interface Board {
  id: string;
  name: string;
  gameId: string;
  teamHome: string;
  teamAway: string;
  costPerSquare: number;
  status: string;
  isFinalized: boolean;
  createdAt: string;
  squares: any[];
}

export default function ArchivedBoardsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedBoards();
  }, []);

  const fetchArchivedBoards = async () => {
    try {
      const response = await fetch('/api/boards/archived');
      if (!response.ok) throw new Error('Failed to fetch archived boards');
      const data = await response.json();
      setBoards(data.boards);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load archived boards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (boardId: string, boardName: string) => {
    if (!confirm(`Restore "${boardName}"? This will move it back to active boards.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });

      if (!response.ok) throw new Error('Failed to restore board');

      toast({
        title: 'Success',
        description: 'Board restored to active boards',
      });

      fetchArchivedBoards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (boardId: string, boardName: string) => {
    if (!confirm(`⚠️ DELETE "${boardName}"?\n\nThis will permanently delete:\n• All squares and player data\n• All payment records\n• All winners\n\nThis CANNOT be undone!`)) {
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

      if (!response.ok) throw new Error('Failed to delete board');

      toast({
        title: 'Success',
        description: 'Board permanently deleted',
      });

      fetchArchivedBoards();
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Archived Boards</h1>
            <p className="text-muted-foreground mt-1">
              {boards.length} archived {boards.length === 1 ? 'board' : 'boards'}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/boards')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Boards
          </Button>
        </div>

        <div className="grid gap-4">
          {boards.map((board) => {
            const filledSquares = board.squares.filter((s: any) => s.playerName).length;
            
            return (
              <Card key={board.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{board.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>{board.teamAway} @ {board.teamHome}</span>
                        <span>•</span>
                        <span>${board.costPerSquare}/square</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gray-500">
                      Archived
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <span>{filledSquares}/100 squares sold</span>
                    <span>•</span>
                    <span>Archived on {new Date(board.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleRestore(board.id, board.name)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restore
                    </Button>

                    <Button
                      onClick={() => handleDelete(board.id, board.name)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Permanently
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {boards.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No archived boards</p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push('/admin/boards')}
                  variant="outline"
                >
                  View Active Boards
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
