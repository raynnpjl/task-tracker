'use client';

import { useState } from 'react';
import { useProject } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuickNotes() {
  const { quickNotes, addQuickNote, updateQuickNote, deleteQuickNote } = useProject();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  const handleAddNote = async () => {
    if (!newTitle.trim()) return;

    await addQuickNote({
      title: newTitle.trim(),
      content: newContent.trim(),
      done: false,
    });

    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!editingTitle.trim()) return;

    await updateQuickNote(noteId, {
      title: editingTitle.trim(),
      content: editingContent.trim(),
    });

    setEditingId(null);
    setEditingTitle('');
    setEditingContent('');
  };

  const startEditing = (
    note: { id: number; title: string; content: string }
  ) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingContent('');
  };

  return (
    <div className="bg-card/50 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-foreground">Quick Notes</h3>
          <span className="text-xs text-muted-foreground">({quickNotes.length})</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isAdding && (
        <div className="mb-4 rounded-lg border border-border bg-secondary/40 p-3 space-y-2">
          <Input
            autoFocus
            placeholder="Note title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-card border-border"
          />

          <textarea
            placeholder="Write your note..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full min-h-[100px] rounded-md border border-border bg-card px-3 py-2 text-sm outline-none resize-none"
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => void handleAddNote()}
            >
              Add
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={() => {
                setIsAdding(false);
                setNewTitle('');
                setNewContent('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {quickNotes.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No quick notes yet. Add one to capture your thoughts.
          </p>
        )}

        {quickNotes.map((note) => (
          <div
            key={note.id}
            className="group rounded-xl border border-border bg-secondary/40 p-3 hover:bg-secondary/60 transition-colors"
          >
            {editingId === note.id ? (
              <div className="space-y-2">
                <Input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Note title..."
                  className="bg-card border-border"
                />

                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  placeholder="Write your note..."
                  className="w-full min-h-[100px] rounded-md border border-border bg-card px-3 py-2 text-sm outline-none resize-none"
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => void handleUpdateNote(note.id)}
                  >
                    Save
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={note.done}
                  onChange={() =>
                    void updateQuickNote(note.id, { done: !note.done })
                  }
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-border"
                />

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => startEditing(note)}
                >
                  <h4
                    className={cn(
                      'text-sm font-medium text-foreground break-words',
                      note.done && 'line-through text-muted-foreground'
                    )}
                  >
                    {note.title}
                  </h4>

                  {note.content && (
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive cursor-pointer flex-shrink-0"
                  onClick={() => void deleteQuickNote(note.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}