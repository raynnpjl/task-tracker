export interface User {
  id: string;
  email: string;
  name: string;
}

export interface QuickNote {
  id: string;
  content: string;
  createdAt: Date;
  projectId: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
  order: number;
}

export interface Task {
  id: string;
  content: string;
  labelId: string;
  projectId: string;
  createdAt: Date;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
  userId: string;
}

export type LabelColor = 
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'yellow'
  | 'pink'
  | 'gray';

export const LABEL_COLORS: Record<LabelColor, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};
