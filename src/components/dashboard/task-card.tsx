'use client';

import { useState } from 'react';
import { useProject } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const handleUpdate = () => {
    if (editContent.trim()) {
      updateTask(task.id, editContent.trim());
    }
    setIsEditing(false);
  };

  return (
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
      
      {isEditing ? (
        <Input
          autoFocus
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdate();
            if (e.key === 'Escape') {
              setIsEditing(false);
              setEditContent(task.content);
            }
          }}
          onBlur={handleUpdate}
          className="flex-1 h-7 text-sm bg-secondary border-border"
        />
      ) : (
        <>
          <p
            className="flex-1 text-sm text-foreground cursor-pointer break-words"
            onClick={() => setIsEditing(true)}
          >
            {task.content}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </>
      )}
    </div>
  );
}
