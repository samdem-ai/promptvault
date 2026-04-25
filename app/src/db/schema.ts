export type PromptStatus = 'bypassed' | 'partial' | 'blocked' | 'untested';
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface Workspace {
  id?: number;
  name: string;
  color: string;
  systemPromptNotes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id?: number;
  name: string;
  color: string;
  description: string;
}

export interface Challenge {
  id?: number;
  challengeId: string;
  workspaceId: number;
  title: string;
  description?: string;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
}

export interface PromptVersion {
  id?: number;
  promptId: number;
  versionNumber: number;
  body: string;
  changeNote: string;
  author: string;
  createdAt: number;
}

export interface Prompt {
  id?: number;
  promptId: string;
  workspaceId: number;
  challengeId: number | null;
  title: string;
  currentVersionId: number | null;
  tags: string[];
  status: PromptStatus;
  modelLabel: string;
  author: string;
  archived: boolean;
  archivedAt: number | null;
  archiveReason: string;
  createdAt: number;
  updatedAt: number;
}

export interface Run {
  id?: number;
  runId: string;
  promptId: number;
  versionId: number | null;
  workspaceId: number;
  challengeId: number | null;
  status: PromptStatus;
  notes: string;
  duration: string;
  createdAt: number;
}

export interface ImportLog {
  id?: number;
  importId: string;
  sourceName: string;
  workspaceId: number;
  parsedCount: number;
  status: 'done' | 'error';
  errorMessage: string | null;
  createdAt: number;
}
