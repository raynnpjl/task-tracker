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
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addQuickNote(newNote.trim());
      setNewNote('');
      setIsAdding(false);
    }
  };

  const handleUpdateNote = async (noteId: number) => {
    if (editingContent.trim()) {
      await updateQuickNote(noteId, editingContent.trim());
    }
    setEditingId(null);
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
        <div className="mb-3 flex gap-2">
          <Input
            autoFocus
            placeholder="Write a quick note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleAddNote();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewNote('');
              }
            }}
            className="flex-1 bg-secondary border-border"
          />
          <Button size="sm" onClick={() => void handleAddNote()}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewNote('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {quickNotes.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No quick notes yet. Add one to capture your thoughts.
          </p>
        )}

        {quickNotes.map((note) => (
          <div
            key={note.id}
            className={cn(
              'group flex items-start gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors'
            )}
          >
            {editingId === note.id ? (
              <Input
                autoFocus
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleUpdateNote(note.id);
                  if (e.key === 'Escape') {
                    setEditingId(null);
                    setEditingContent('');
                  }
                }}
                onBlur={() => void handleUpdateNote(note.id)}
                className="flex-1 h-7 bg-card border-border text-sm"
              />
            ) : (
              <>
                <p
                  className="flex-1 text-sm text-foreground cursor-pointer"
                  onClick={() => {
                    setEditingId(note.id);
                    setEditingContent(note.content);
                  }}
                >
                  {note.content}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => void deleteQuickNote(note.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}