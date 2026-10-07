import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabWord } from '@/types';

interface VocabStore {
  words: VocabWord[];
  selectedWords: string[];

  addWord: (word: VocabWord) => void;
  addWords: (words: VocabWord[]) => void;
  removeWord: (id: string) => void;
  clearWords: () => void;
  toggleSelected: (word: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleMastered: (id: string) => void;
}

export const useVocabStore = create<VocabStore>()(
  persist(
    (set) => ({
      words: [],
      selectedWords: [],

      addWord: (word) => set((state) => {
        const exists = state.words.find(
          (w) => w.word === word.word && w.language === word.language
        );
        if (exists) return state;
        return { words: [...state.words, { ...word, id: word.id || crypto.randomUUID() }] };
      }),

      addWords: (newWordsList) => set((state) => {
        const filtered = newWordsList
          .filter(
            (w) => !state.words.find(
              (existing) => existing.word === w.word && existing.language === w.language
            )
          )
          .map((w) => ({ ...w, id: w.id || crypto.randomUUID() }));
        return { words: [...state.words, ...filtered] };
      }),

      removeWord: (id) => set((state) => ({
        words: state.words.filter((w) => w.id !== id),
        selectedWords: state.selectedWords.filter((wid) => wid !== id),
      })),

      clearWords: () => set({ words: [], selectedWords: [] }),

      toggleSelected: (wordId) => set((state) => ({
        selectedWords: state.selectedWords.includes(wordId)
          ? state.selectedWords.filter((w) => w !== wordId)
          : [...state.selectedWords, wordId],
      })),

      selectAll: () => set((state) => ({
        selectedWords: state.words.map((w) => w.id!),
      })),

      deselectAll: () => set({ selectedWords: [] }),

      toggleMastered: (id) => set((state) => ({
        words: state.words.map((w) =>
          w.id === id ? { ...w, mastered: !w.mastered } : w
        ),
      })),
    }),
    {
      name: 'vocabulary-store',
    }
  )
);