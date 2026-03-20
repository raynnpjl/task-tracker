'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
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
import {
  Layers,
  Plus,
  Search,
  LogOut,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderKanban,
  ChevronLeft,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PROJECT_ICONS = ['📁', '📊', '🎯', '💡', '🚀', '📝', '⭐', '🔥', '💼', '🎨'];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    deleteProject,
    renameProject,
  } = useProject();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const randomIcon = PROJECT_ICONS[Math.floor(Math.random() * PROJECT_ICONS.length)];
      createProject(newProjectName.trim(), randomIcon);
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const handleRenameProject = (projectId: string) => {
    if (editingName.trim()) {
      renameProject(projectId, editingName.trim());
      setEditingProjectId(null);
      setEditingName('');
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sidebar-foreground">TaskFlow</span>
          </div>
        )}
        {collapsed && <Layers className="w-5 h-5 text-primary mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            'text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed && 'hidden'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="flex-1 overflow-y-auto p-2">
        {!collapsed && (
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full mb-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => onToggle()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}

        {/* Create project form */}
        {isCreating && !collapsed && (
          <div className="p-2 mb-2 rounded-lg bg-sidebar-accent">
            <Input
              autoFocus
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProject();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewProjectName('');
                }
              }}
              className="mb-2 bg-sidebar border-sidebar-border text-sidebar-foreground"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateProject} className="flex-1">
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName('');
                }}
                className="text-sidebar-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Project list */}
        <div className="space-y-1">
          {filteredProjects.length === 0 && !isCreating && !collapsed && (
            <div className="px-2 py-8 text-center">
              <FolderKanban className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No projects yet</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsCreating(true)}
                className="text-primary"
              >
                Create your first project
              </Button>
            </div>
          )}

          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={cn(
                'group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors',
                currentProject?.id === project.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
              onClick={() => setCurrentProject(project)}
            >
              <span className="text-base flex-shrink-0">{project.icon}</span>
              {!collapsed && (
                <>
                  {editingProjectId === project.id ? (
                    <Input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameProject(project.id);
                        if (e.key === 'Escape') {
                          setEditingProjectId(null);
                          setEditingName('');
                        }
                      }}
                      onBlur={() => handleRenameProject(project.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 px-1 py-0 text-sm bg-sidebar border-sidebar-border"
                    />
                  ) : (
                    <span className="flex-1 truncate text-sm">{project.name}</span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProjectId(project.id);
                          setEditingName(project.name);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed && 'justify-center px-0'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              {!collapsed && (
                <div className="ml-2 text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
