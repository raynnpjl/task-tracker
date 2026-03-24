'use client';

import { useState } from 'react';
import { useProject } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Tags } from 'lucide-react';
import { QuickNotes } from './quick-notes';
import { LabelSection } from './label-section';
import type { Task, LabelColor } from '@/types';
import { LABEL_COLORS } from '@/types';
import { cn } from '@/lib/utils';

const colorOptions: LabelColor[] = ['blue', 'green', 'orange', 'red', 'purple', 'yellow', 'pink', 'gray'];

export function ProjectWorkspace() {
  const { currentProject, labels, tasks, addLabel, moveTask } = useProject();
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState<LabelColor>('blue');
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);

  const handleAddLabel = async () => {
    if (newLabelName.trim()) {
      await addLabel(newLabelName.trim(), newLabelColor);
      setNewLabelName('');
      setNewLabelColor('blue');
      setIsAddingLabel(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(task.id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };


  const handleDrop = async (e: React.DragEvent, labelId: number) => {
    e.preventDefault();

    if (draggingTask && draggingTask.labelId !== labelId) {
      const labelTasks = tasks.filter((t) => t.labelId === labelId);
      await moveTask(draggingTask.id, labelId, labelTasks.length);
    }

    setDraggingTask(null);
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Tags className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Select a project</h2>
          <p className="text-muted-foreground">
            Choose a project from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" onDragEnd={handleDragEnd}>
      {/* Project header */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentProject.name}</h1>
            <p className="text-sm text-muted-foreground">
              {labels.length} labels | {tasks.length} tasks
            </p>
          </div>
        </div>
      </div>

      {/* Quick notes section */}
      <div className="flex-shrink-0 p-6 pb-4">
        <QuickNotes />
      </div>

      {/* Labels section header */}
      <div className="flex-shrink-0 px-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-foreground">Task Sections</h3>
          </div>
          
          {/* Add label button */}
          {!isAddingLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingLabel(true)}
              className="gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </Button>
          )}
        </div>

        {/* Add label form */}
        {isAddingLabel && (
          <div className="mt-4 p-4 rounded-lg bg-card border border-border max-w-sm">
            <div className="flex gap-2 mb-3">
              <Input
                autoFocus
                placeholder="Section name..."
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddLabel();
                  if (e.key === 'Escape') {
                    setIsAddingLabel(false);
                    setNewLabelName('');
                  }
                }}
                className="flex-1 bg-secondary border-border"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <div className={cn('w-4 h-4 rounded-full', LABEL_COLORS[newLabelColor].split(' ')[0])} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {colorOptions.map((color) => (
                    <DropdownMenuItem
                      key={color}
                      onClick={() => setNewLabelColor(color)}
                      className="flex items-center gap-2"
                    >
                      <div className={cn('w-3 h-3 rounded-full', LABEL_COLORS[color].split(' ')[0])} />
                      <span className="capitalize">{color}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddLabel} className="flex-1">
                Create Section
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingLabel(false);
                  setNewLabelName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
        <div className="flex gap-4 h-full">
          {labels.map((label) => (
            <LabelSection
              key={label.id}
              label={label}
              tasks={tasks.filter((t) => t.labelId === label.id)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              draggingTaskId={draggingTask?.id || null}
            />
          ))}

          {labels.length === 0 && !isAddingLabel && (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center max-w-md p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Tags className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">No sections yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create sections like To-Do, In Progress, or Done to organize your tasks.
                </p>
                <Button 
                  onClick={() => setIsAddingLabel(true)}
                  className="cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Section
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
