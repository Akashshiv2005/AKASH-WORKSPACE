import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface JournalData {
  selectedMood: string;
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  reflectionText: string;
  lastSavedAt?: string;
}

interface JournalState extends JournalData {
  setMood: (mood: string) => void;
  setGratitude1: (val: string) => void;
  setGratitude2: (val: string) => void;
  setGratitude3: (val: string) => void;
  setReflectionText: (val: string) => void;
  saveJournal: (data?: Partial<JournalData>) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      selectedMood: '🚀',
      gratitude1: '',
      gratitude2: '',
      gratitude3: '',
      reflectionText: '',
      lastSavedAt: undefined,

      setMood: (selectedMood) => set({ selectedMood }),
      setGratitude1: (gratitude1) => set({ gratitude1 }),
      setGratitude2: (gratitude2) => set({ gratitude2 }),
      setGratitude3: (gratitude3) => set({ gratitude3 }),
      setReflectionText: (reflectionText) => set({ reflectionText }),

      saveJournal: (data) =>
        set((state) => ({
          ...state,
          ...data,
          lastSavedAt: new Date().toISOString(),
        })),
    }),
    {
      name: 'akash-journal-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
