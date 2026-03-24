'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Project, Label, Task, QuickNote, LabelColor } from '@/types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  labels: Label[];
  tasks: Task[];
  quickNotes: QuickNote[];
  setCurrentProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
  refreshBoard: (projectId?: number) => Promise<void>;
  createProject: (name: string) => Promise<Project | null>;
  renameProject: (projectId: number, name: string) => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
  addLabel: (name: string, color: LabelColor) => Promise<void>;
  updateLabel: (labelId: number, name: string, color: LabelColor) => Promise<void>;
  deleteLabel: (labelId: number) => Promise<void>;
  addTask: (title: string, labelId: number) => Promise<void>;
  updateTask: (
    taskId: number,
    updates: Partial<Pick<Task, 'title' | 'done'>>
  ) => Promise<void>;
  moveTask: (taskId: number, labelId: number, position: number) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  addQuickNote: (content: string) => Promise<void>;
  updateQuickNote: (noteId: number, content: string) => Promise<void>;
  deleteQuickNote: (noteId: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);

  const userHeaders = useCallback(() => {
    if (!user?.uid) throw new Error('User not found');

    return {
      'Content-Type': 'application/json',
      'x-firebase-uid': user.uid,
    };
  }, [user?.uid]);

  const authHeaders = useCallback(() => {
    if (!user?.uid) throw new Error('User not found');

    return {
      'x-firebase-uid': user.uid,
    };
  }, [user?.uid]);

  const refreshProjects = useCallback(async () => {
    if (!user?.uid) {
      setProjects([]);
      setCurrentProject(null);
      setLabels([]);
      setTasks([]);
      setQuickNotes([]);
      return;
    }

    const res = await fetch('/api/projects', {
      headers: authHeaders(),
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');

    const nextProjects = data.projects ?? [];
    setProjects(nextProjects);

    setCurrentProject((prev) => {
      if (!prev) return nextProjects[0] ?? null;
      return nextProjects.find((p: Project) => p.id === prev.id) ?? nextProjects[0] ?? null;
    });
  }, [user?.uid, authHeaders]);

  const refreshBoard = useCallback(
    async (projectId?: number) => {
      const targetProjectId = projectId ?? currentProject?.id;

      if (!user?.uid || !targetProjectId) {
        setLabels([]);
        setTasks([]);
        setQuickNotes([]);
        return;
      }

      const res = await fetch(`/api/projects/${targetProjectId}/board`, {
        headers: authHeaders(),
        cache: 'no-store',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch board');

      setLabels(data.labels ?? []);
      setTasks(data.tasks ?? []);
      setQuickNotes(data.quickNotes ?? []);
    },
    [user?.uid, currentProject?.id, authHeaders]
  );

  const createProject = useCallback(
    async (name: string) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: userHeaders(),
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      const project = data.project as Project;
      setProjects((prev) => [project, ...prev]);
      setCurrentProject(project);
      setLabels([]);
      setTasks([]);
      setQuickNotes([]);

      return project;
    },
    [userHeaders]
  );

  const renameProject = useCallback(
    async (projectId: number, name: string) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: userHeaders(),
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rename project');

      const updated = data.project as Project;
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      setCurrentProject((prev) => (prev?.id === projectId ? updated : prev));
    },
    [userHeaders]
  );

  const deleteProject = useCallback(
    async (projectId: number) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete project');

      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== projectId);
        const nextCurrent = currentProject?.id === projectId ? next[0] ?? null : currentProject;
        setCurrentProject(nextCurrent);

        if (!nextCurrent) {
          setLabels([]);
          setTasks([]);
          setQuickNotes([]);
        }

        return next;
      });
    },
    [currentProject, authHeaders]
  );

  const addLabel = useCallback(
    async (name: string, color: LabelColor) => {
      if (!currentProject) return;

      const res = await fetch('/api/labels', {
        method: 'POST',
        headers: userHeaders(),
        body: JSON.stringify({
          name,
          color,
          projectId: currentProject.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create label');

      setLabels((prev) => [...prev, data.label]);
    },
    [currentProject, userHeaders]
  );

  const updateLabel = useCallback(
    async (labelId: number, name: string, color: LabelColor) => {
      const res = await fetch(`/api/labels/${labelId}`, {
        method: 'PATCH',
        headers: userHeaders(),
        body: JSON.stringify({ name, color }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update label');

      const updatedLabel: Label = data.label;
      setLabels((prev) =>
        prev.map((label) => (label.id === labelId ? updatedLabel : label))
      );
    },
    [userHeaders]
  );

  const deleteLabel = useCallback(
    async (labelId: number) => {
      const res = await fetch(`/api/labels/${labelId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete label');

      setLabels((prev) => prev.filter((label) => label.id !== labelId));
      setTasks((prev) => prev.filter((task) => task.labelId !== labelId));
    },
    [authHeaders]
  );

  const addTask = useCallback(
    async (title: string, labelId: number) => {
      if (!currentProject) return;

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: userHeaders(),
        body: JSON.stringify({
          title,
          projectId: currentProject.id,
          labelId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');

      setTasks((prev) => [...prev, data.task]);
    },
    [currentProject, userHeaders]
  );

  const updateTask = useCallback(
    async (taskId: number, updates: Partial<Pick<Task, 'title' | 'done'>>) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: userHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');

      const updated = data.task as Task;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    },
    [userHeaders]
  );

  const moveTask = useCallback(
    async (taskId: number, labelId: number, position: number) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: userHeaders(),
        body: JSON.stringify({ labelId, position }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to move task');

      const updated = data.task as Task;

      setTasks((prev) => {
        const withoutCurrent = prev.filter((t) => t.id !== taskId);
        const next = withoutCurrent.map((t) => {
          if (t.labelId === labelId && t.position >= position) {
            return { ...t, position: t.position + 1 };
          }
          return t;
        });

        return [...next, updated].sort((a, b) => {
          if (a.labelId !== b.labelId) return a.labelId - b.labelId;
          return a.position - b.position;
        });
      });
    },
    [userHeaders]
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete task');

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
    [authHeaders]
  );

  const addQuickNote = useCallback(
    async (content: string) => {
      if (!currentProject) return;

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: userHeaders(),
        body: JSON.stringify({
          content,
          projectId: currentProject.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create note');

      setQuickNotes((prev) => [data.note, ...prev]);
    },
    [currentProject, userHeaders]
  );

  const updateQuickNote = useCallback(
    async (noteId: number, content: string) => {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: userHeaders(),
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update note');

      const updatedNote: QuickNote = data.note;
      setQuickNotes((prev) =>
        prev.map((note) => (note.id === noteId ? updatedNote : note))
      );
    },
    [userHeaders]
  );

  const deleteQuickNote = useCallback(
    async (noteId: number) => {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete note');

      setQuickNotes((prev) => prev.filter((note) => note.id !== noteId));
    },
    [authHeaders]
  );

  useEffect(() => {
    refreshProjects().catch(console.error);
  }, [refreshProjects]);

  useEffect(() => {
    refreshBoard().catch(console.error);
  }, [currentProject?.id, refreshBoard]);

  const value = useMemo(
    () => ({
      projects,
      currentProject,
      labels,
      tasks,
      quickNotes,
      setCurrentProject,
      refreshProjects,
      refreshBoard,
      createProject,
      renameProject,
      deleteProject,
      addLabel,
      updateLabel,
      deleteLabel,
      addTask,
      updateTask,
      moveTask,
      deleteTask,
      addQuickNote,
      updateQuickNote,
      deleteQuickNote,
    }),
    [
      projects,
      currentProject,
      labels,
      tasks,
      quickNotes,
      refreshProjects,
      refreshBoard,
      createProject,
      renameProject,
      deleteProject,
      addLabel,
      updateLabel,
      deleteLabel,
      addTask,
      updateTask,
      moveTask,
      deleteTask,
      addQuickNote,
      updateQuickNote,
      deleteQuickNote,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
}