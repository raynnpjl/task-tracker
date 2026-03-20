'use client';

import { useState } from 'react';
import { useProject } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2, Palette } from 'lucide-react';
import { TaskCard } from './task-card';
import type { Label, Task, LabelColor } from '@/types';
import { LABEL_COLORS } from '@/types';
import { cn } from '@/lib/utils';

interface LabelSectionProps {
  label: Label;
  tasks: Task[];
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, labelId: string) => void;
  draggingTaskId: string | null;
}

const colorOptions: LabelColor[] = ['blue', 'green', 'orange', 'red', 'purple', 'yellow', 'pink', 'gray'];

export function LabelSection({
  label,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  draggingTaskId,
}: LabelSectionProps) {
  const { addTask, updateLabel, deleteLabel } = useProject();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(label.name);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  const handleAddTask = () => {
    if (newTaskContent.trim()) {
      addTask(newTaskContent.trim(), label.id);
      setNewTaskContent('');
      setIsAddingTask(false);
    }
  };

  const handleUpdateLabel = () => {
    if (editName.trim()) {
      updateLabel(label.id, editName.trim(), label.color as LabelColor);
    }
    setIsEditing(false);
  };

  const handleColorChange = (color: LabelColor) => {
    updateLabel(label.id, label.name, color);
    setIsColorMenuOpen(false);
  };

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[320px] h-full bg-secondary/30 rounded-xl border border-border transition-colors',
        draggingTaskId && 'border-dashed border-primary/30'
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, label.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={cn(
              'w-3 h-3 rounded-full border',
              LABEL_COLORS[label.color as LabelColor]?.split(' ')[0] || 'bg-gray-500/20'
            )}
          />
          {isEditing ? (
            <Input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateLabel();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditName(label.name);
                }
              }}
              onBlur={handleUpdateLabel}
              className="h-6 text-sm bg-card border-border"
            />
          ) : (
            <span className="font-medium text-sm text-foreground truncate">{label.name}</span>
          )}
          <span className="text-xs text-muted-foreground flex-shrink-0">({tasks.length})</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenu open={isColorMenuOpen} onOpenChange={setIsColorMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Palette className="w-4 h-4 mr-2" />
                    Change Color
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="w-36">
                  {colorOptions.map((color) => (
                    <DropdownMenuItem
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className="flex items-center gap-2"
                    >
                      <div className={cn('w-3 h-3 rounded-full', LABEL_COLORS[color].split(' ')[0])} />
                      <span className="capitalize">{color}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteLabel(label.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Add task form */}
        {isAddingTask && (
          <div className="p-2 rounded-lg bg-card border border-border">
            <Input
              autoFocus
              placeholder="Task description..."
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskContent('');
                }
              }}
              className="mb-2 bg-secondary border-border text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask} className="flex-1">
                Add Task
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Task list */}
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isDragging={draggingTaskId === task.id}
            onDragStart={onDragStart}
          />
        ))}

        {tasks.length === 0 && !isAddingTask && (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">No tasks yet</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsAddingTask(true)}
              className="text-primary text-xs"
            >
              Add a task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
