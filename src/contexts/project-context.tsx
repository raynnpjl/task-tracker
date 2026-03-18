
'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Project, QuickNote, Label, Task, LabelColor } from '@/types';
import { useAuth } from './auth-context'

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  quickNotes: QuickNote[];
  labels: Label[];
  tasks: Task[];
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, icon: string) => void;
  deleteProject: (projectId: string) => void;
  renameProject: (projectId: string, newName: string) => void;
  addQuickNote: (content: string) => void;
  updateQuickNote: (noteId: string, content: string) => void;
  deleteQuickNote: (noteId: string) => void;
  addLabel: (name: string, color: LabelColor) => void;
  updateLabel: (labelId: string, name: string, color: LabelColor) => void;
  deleteLabel: (labelId: string) => void;
  addTask: (content: string, labelId: string) => void;
  updateTask: (taskId: string, content: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newLabelId: string, newOrder: number) => void;
  reorderLabels: (labelId: string, newOrder: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'taskflow_data';

interface StorageData {
  projects: Project[];
  quickNotes: QuickNote[];
  labels: Label[];
  tasks: Task[];
}

function getStorageData(): StorageData {
  if (typeof window === 'undefined') {
    return { projects: [], quickNotes: [], labels: [], tasks: [] };
  }
  const data = localStorage.getItem(STORAGE_KEY);
  return data
    ? JSON.parse(data)
    : { projects: [], quickNotes: [], labels: [], tasks: [] };
}

function saveStorageData(data: StorageData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load data on mount
  useEffect(() => {
    const data = getStorageData();
    setProjects(data.projects);
    setQuickNotes(data.quickNotes);
    setLabels(data.labels);
    setTasks(data.tasks);
  }, []);

  // Filter data by user
  const userProjects = projects.filter((p) => p.userId === user?.uid);
  const projectQuickNotes = quickNotes.filter(
    (n) => n.projectId === currentProject?.id
  );
  const projectLabels = labels
    .filter((l) => l.projectId === currentProject?.id)
    .sort((a, b) => a.order - b.order);
  const projectTasks = tasks.filter((t) => t.projectId === currentProject?.id);

  // Save data whenever it changes
  useEffect(() => {
    saveStorageData({ projects, quickNotes, labels, tasks });
  }, [projects, quickNotes, labels, tasks]);

  const createProject = useCallback(
    (name: string, icon: string) => {
      if (!user) return;
      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        icon,
        createdAt: new Date(),
        userId: user.uid,
      };
      setProjects((prev) => [...prev, newProject]);
      setCurrentProject(newProject);

      // Create default labels for new project
      const defaultLabels: Label[] = [
        { id: crypto.randomUUID(), name: 'To-Do', color: 'blue', projectId: newProject.id, order: 0 },
        { id: crypto.randomUUID(), name: 'In Progress', color: 'orange', projectId: newProject.id, order: 1 },
        { id: crypto.randomUUID(), name: 'Review', color: 'purple', projectId: newProject.id, order: 2 },
        { id: crypto.randomUUID(), name: 'Completed', color: 'green', projectId: newProject.id, order: 3 },
      ];
      setLabels((prev) => [...prev, ...defaultLabels]);
    },
    [user]
  );

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setQuickNotes((prev) => prev.filter((n) => n.projectId !== projectId));
    setLabels((prev) => prev.filter((l) => l.projectId !== projectId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    setCurrentProject((prev) => (prev?.id === projectId ? null : prev));
  }, []);

  const renameProject = useCallback((projectId: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, name: newName } : p))
    );
    setCurrentProject((prev) =>
      prev?.id === projectId ? { ...prev, name: newName } : prev
    );
  }, []);

  const addQuickNote = useCallback(
    (content: string) => {
      if (!currentProject) return;
      const newNote: QuickNote = {
        id: crypto.randomUUID(),
        content,
        createdAt: new Date(),
        projectId: currentProject.id,
      };
      setQuickNotes((prev) => [...prev, newNote]);
    },
    [currentProject]
  );

  const updateQuickNote = useCallback((noteId: string, content: string) => {
    setQuickNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, content } : n))
    );
  }, []);

  const deleteQuickNote = useCallback((noteId: string) => {
    setQuickNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const addLabel = useCallback(
    (name: string, color: LabelColor) => {
      if (!currentProject) return;
      const maxOrder = Math.max(
        0,
        ...labels.filter((l) => l.projectId === currentProject.id).map((l) => l.order)
      );
      const newLabel: Label = {
        id: crypto.randomUUID(),
        name,
        color,
        projectId: currentProject.id,
        order: maxOrder + 1,
      };
      setLabels((prev) => [...prev, newLabel]);
    },
    [currentProject, labels]
  );

  const updateLabel = useCallback((labelId: string, name: string, color: LabelColor) => {
    setLabels((prev) =>
      prev.map((l) => (l.id === labelId ? { ...l, name, color } : l))
    );
  }, []);

  const deleteLabel = useCallback((labelId: string) => {
    setLabels((prev) => prev.filter((l) => l.id !== labelId));
    setTasks((prev) => prev.filter((t) => t.labelId !== labelId));
  }, []);

  const addTask = useCallback(
    (content: string, labelId: string) => {
      if (!currentProject) return;
      const labelTasks = tasks.filter((t) => t.labelId === labelId);
      const maxOrder = Math.max(0, ...labelTasks.map((t) => t.order));
      const newTask: Task = {
        id: crypto.randomUUID(),
        content,
        labelId,
        projectId: currentProject.id,
        createdAt: new Date(),
        order: maxOrder + 1,
      };
      setTasks((prev) => [...prev, newTask]);
    },
    [currentProject, tasks]
  );

  const updateTask = useCallback((taskId: string, content: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, content } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const moveTask = useCallback((taskId: string, newLabelId: string, newOrder: number) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      // Get tasks in the target label
      const targetLabelTasks = prev
        .filter((t) => t.labelId === newLabelId && t.id !== taskId)
        .sort((a, b) => a.order - b.order);

      // Insert at the new position
      targetLabelTasks.splice(newOrder, 0, { ...task, labelId: newLabelId });

      // Update orders
      const updatedTargetTasks = targetLabelTasks.map((t, index) => ({
        ...t,
        order: index,
      }));

      // Return updated tasks
      return prev
        .filter((t) => t.labelId !== newLabelId && t.id !== taskId)
        .concat(updatedTargetTasks);
    });
  }, []);

  const reorderLabels = useCallback((labelId: string, newOrder: number) => {
    setLabels((prev) => {
      const label = prev.find((l) => l.id === labelId);
      if (!label || !currentProject) return prev;

      const projectLabelsArr = prev
        .filter((l) => l.projectId === currentProject.id && l.id !== labelId)
        .sort((a, b) => a.order - b.order);

      projectLabelsArr.splice(newOrder, 0, label);

      const updatedProjectLabels = projectLabelsArr.map((l, index) => ({
        ...l,
        order: index,
      }));

      return prev
        .filter((l) => l.projectId !== currentProject.id)
        .concat(updatedProjectLabels);
    });
  }, [currentProject]);

  return (
    <ProjectContext.Provider
      value={{
        projects: userProjects,
        currentProject,
        quickNotes: projectQuickNotes,
        labels: projectLabels,
        tasks: projectTasks,
        setCurrentProject,
        createProject,
        deleteProject,
        renameProject,
        addQuickNote,
        updateQuickNote,
        deleteQuickNote,
        addLabel,
        updateLabel,
        deleteLabel,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        reorderLabels,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
