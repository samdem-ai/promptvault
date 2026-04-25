import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  activeWorkspaceId: number | null;
  selectedPromptId: number | null;
  selectedTagName: string | null;
  selectedRunId: number | null;
  paletteOpen: boolean;
  paletteQuery: string;
  authorName: string;
  setActiveWorkspace: (id: number | null) => void;
  selectPrompt: (id: number | null) => void;
  selectTag: (name: string | null) => void;
  selectRun: (id: number | null) => void;
  openPalette: () => void;
  closePalette: () => void;
  setPaletteQuery: (q: string) => void;
  setAuthorName: (name: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      selectedPromptId: null,
      selectedTagName: null,
      selectedRunId: null,
      paletteOpen: false,
      paletteQuery: '',
      authorName: 'researcher',
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id, selectedPromptId: null }),
      selectPrompt: (id) => set({ selectedPromptId: id }),
      selectTag: (name) => set({ selectedTagName: name }),
      selectRun: (id) => set({ selectedRunId: id }),
      openPalette: () => set({ paletteOpen: true, paletteQuery: '' }),
      closePalette: () => set({ paletteOpen: false }),
      setPaletteQuery: (q) => set({ paletteQuery: q }),
      setAuthorName: (name) => set({ authorName: name }),
    }),
    {
      name: 'inject-ui',
      partialize: (s) => ({
        activeWorkspaceId: s.activeWorkspaceId,
        authorName: s.authorName,
      }),
    }
  )
);
