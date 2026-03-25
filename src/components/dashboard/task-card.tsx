'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { GripVertical, X } from 'lucide-react';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}

export function TaskCard({ task, isDragging, onDragStart }: TaskCardProps) {
  const { updateTask, deleteTask } = useProject();

  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editContent, setEditContent] = useState(task.content ?? '');

  useEffect(() => {
    if (open) {
      setEditTitle(task.title);
      setEditContent(task.content ?? '');
    }
  }, [open, task.title, task.content]);

  const handleUpdate = async () => {
    if (!editTitle.trim()) return;

    await updateTask(task.id, {
      title: editTitle.trim(),
      content: editContent.trim() || undefined,
    });

    setOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteTask(task.id);
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, task)}
        className={cn(
          'group flex items-start gap-2 p-3 rounded-lg bg-card border border-border cursor-grab active:cursor-grabbing transition-all',
          isDragging && 'opacity-50 scale-95',
          'hover:border-primary/30 hover:shadow-md'
        )}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 text-left"
        >
          <p className="text-sm text-foreground break-words">{task.title}</p>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={handleDelete}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write task details here..."
                className="min-h-[180px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleUpdate()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}