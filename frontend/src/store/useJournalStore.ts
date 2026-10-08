import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  date: string; // 'YYYY-MM-DD'
  selectedMood: string;
  energyLevel: 'High' | 'Medium' | 'Low';
  rating: number; // 1 to 5 stars
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  reflectionText: string;
  createdAt: string;
}

interface JournalState {
  entries: JournalEntry[];
  selectedDate: string; // 'YYYY-MM-DD'
  
  // Current Form Draft State
  selectedMood: string;
  energyLevel: 'High' | 'Medium' | 'Low';
  rating: number;
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  reflectionText: string;

  setSelectedDate: (date: string) => void;
  setMood: (mood: string) => void;
  setEnergyLevel: (level: 'High' | 'Medium' | 'Low') => void;
  setRating: (rating: number) => void;
  setGratitude1: (val: string) => void;
  setGratitude2: (val: string) => void;
  setGratitude3: (val: string) => void;
  setReflectionText: (val: string) => void;

  saveJournalEntry: () => void;
  loadEntryForDate: (dateStr: string) => void;
  deleteJournalEntry: (id: string) => void;
}

const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_TODAY = getTodayDateStr();

const DEMO_ENTRIES: JournalEntry[] = [
  {
    id: `entry-${DEFAULT_TODAY}`,
    date: DEFAULT_TODAY,
    selectedMood: '🚀',
    energyLevel: 'High',
    rating: 5,
    gratitude1: 'Built and deployed the new Executive Notion Clone dashboard',
    gratitude2: 'Super productive focus session with clean modular state',
    gratitude3: 'Achieved 100% streak completion across all core habits',
    reflectionText: 'Great day for execution. Maintained high energy and laser focus throughout all tasks!',
    createdAt: new Date().toISOString(),
  },
];

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: DEMO_ENTRIES,
      selectedDate: DEFAULT_TODAY,

      selectedMood: DEMO_ENTRIES[0].selectedMood,
      energyLevel: DEMO_ENTRIES[0].energyLevel,
      rating: DEMO_ENTRIES[0].rating,
      gratitude1: DEMO_ENTRIES[0].gratitude1,
      gratitude2: DEMO_ENTRIES[0].gratitude2,
      gratitude3: DEMO_ENTRIES[0].gratitude3,
      reflectionText: DEMO_ENTRIES[0].reflectionText,

      setSelectedDate: (date) => {
        set({ selectedDate: date });
        get().loadEntryForDate(date);
      },

      setMood: (selectedMood) => set({ selectedMood }),
      setEnergyLevel: (energyLevel) => set({ energyLevel }),
      setRating: (rating) => set({ rating }),
      setGratitude1: (gratitude1) => set({ gratitude1 }),
      setGratitude2: (gratitude2) => set({ gratitude2 }),
      setGratitude3: (gratitude3) => set({ gratitude3 }),
      setReflectionText: (reflectionText) => set({ reflectionText }),

      loadEntryForDate: (dateStr) => {
        const existing = get().entries.find((e) => e.date === dateStr);
        if (existing) {
          set({
            selectedMood: existing.selectedMood || '🚀',
            energyLevel: existing.energyLevel || 'High',
            rating: existing.rating || 5,
            gratitude1: existing.gratitude1 || '',
            gratitude2: existing.gratitude2 || '',
            gratitude3: existing.gratitude3 || '',
            reflectionText: existing.reflectionText || '',
          });
        } else {
          set({
            selectedMood: '🚀',
            energyLevel: 'High',
            rating: 5,
            gratitude1: '',
            gratitude2: '',
            gratitude3: '',
            reflectionText: '',
          });
        }
      },

      saveJournalEntry: () => {
        const {
          selectedDate,
          selectedMood,
          energyLevel,
          rating,
          gratitude1,
          gratitude2,
          gratitude3,
          reflectionText,
          entries,
        } = get();

        const newOrUpdatedEntry: JournalEntry = {
          id: `entry-${selectedDate}`,
          date: selectedDate,
          selectedMood,
          energyLevel,
          rating,
          gratitude1,
          gratitude2,
          gratitude3,
          reflectionText,
          createdAt: new Date().toISOString(),
        };

        const existingIndex = entries.findIndex((e) => e.date === selectedDate);
        let updatedEntries: JournalEntry[];
        if (existingIndex >= 0) {
          updatedEntries = [...entries];
          updatedEntries[existingIndex] = newOrUpdatedEntry;
        } else {
          updatedEntries = [newOrUpdatedEntry, ...entries];
        }

        set({ entries: updatedEntries });
      },

      deleteJournalEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },
    }),
    {
      name: 'akash-journal-multi-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
