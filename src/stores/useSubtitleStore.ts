import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SubtitleEntry, SubtitleStyle } from '@/types';

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  entries: SubtitleEntry[];
  enabled: boolean;
  fileName?: string;
}

interface SubtitleStore {
  // Slot tetap: index 0 = Subtitle 1 (Primary), index 1 = Subtitle 2 (Secondary)
  primaryTrack: SubtitleTrack | null;
  secondaryTrack: SubtitleTrack | null;

  primaryStyle: SubtitleStyle;
  secondaryStyle: SubtitleStyle;
  offsetPrimary: number;
  offsetSecondary: number;

  // Kompatibilitas komponen lama (tracks + activeTrackIds)
  tracks: SubtitleTrack[];
  activeTrackIds: string[];

  setSlotTrack: (slot: 0 | 1, track: SubtitleTrack | null) => void;
  toggleTrack: (id: string) => void;
  removeTrack: (id: string) => void;
  clearTracks: () => void;
  addTrack: (track: SubtitleTrack) => void; // legacy fallback

  setPrimaryStyle: (style: Partial<SubtitleStyle>) => void;
  setSecondaryStyle: (style: Partial<SubtitleStyle>) => void;
  setOffsetPrimary: (offset: number) => void;
  setOffsetSecondary: (offset: number) => void;
  setActiveTrackIds: (ids: string[]) => void;

  getCurrentEntries: (time: number, trackId: string) => SubtitleEntry[];
}

const defaultStyle: SubtitleStyle = {
  fontSize: 24,
  fontColor: '#FFFFFF',
  bgColor: '#000000',
  bgOpacity: 0.7,
  highlightColor: '#4ADE80',
  position: 'bottom',
  fontFamily: 'system-ui',
};

const defaultSecondaryStyle: SubtitleStyle = {
  fontSize: 18,
  fontColor: '#E5E7EB',
  bgColor: '#000000',
  bgOpacity: 0.5,
  highlightColor: '#60A5FA',
  position: 'bottom',
  fontFamily: 'system-ui',
};

function deriveList(
  primary: SubtitleTrack | null,
  secondary: SubtitleTrack | null
): { tracks: SubtitleTrack[]; activeTrackIds: string[] } {
  const tracks: SubtitleTrack[] = [];
  const activeTrackIds: string[] = [];
  if (primary) {
    tracks.push(primary);
    if (primary.enabled) activeTrackIds.push(primary.id);
  }
  if (secondary) {
    tracks.push(secondary);
    if (secondary.enabled) activeTrackIds.push(secondary.id);
  }
  return { tracks, activeTrackIds };
}

export const useSubtitleStore = create<SubtitleStore>()(
  persist(
    (set, get) => ({
      primaryTrack: null,
      secondaryTrack: null,
      tracks: [],
      activeTrackIds: [],

      primaryStyle: defaultStyle,
      secondaryStyle: defaultSecondaryStyle,
      offsetPrimary: 0,
      offsetSecondary: 0,

      setSlotTrack: (slot, track) =>
        set((state) => {
          const primaryTrack = slot === 0 ? track : state.primaryTrack;
          const secondaryTrack = slot === 1 ? track : state.secondaryTrack;
          const { tracks, activeTrackIds } = deriveList(primaryTrack, secondaryTrack);
          return { primaryTrack, secondaryTrack, tracks, activeTrackIds };
        }),

      // Legacy: isi slot kosong pertama
      addTrack: (track) =>
        set((state) => {
          if (!state.primaryTrack) {
            const primaryTrack = { ...track, enabled: true };
            const { tracks, activeTrackIds } = deriveList(primaryTrack, state.secondaryTrack);
            return { primaryTrack, tracks, activeTrackIds };
          }
          if (!state.secondaryTrack) {
            const secondaryTrack = { ...track, enabled: true };
            const { tracks, activeTrackIds } = deriveList(state.primaryTrack, secondaryTrack);
            return { secondaryTrack, tracks, activeTrackIds };
          }
          return state;
        }),

      removeTrack: (id) =>
        set((state) => {
          const primaryTrack =
            state.primaryTrack?.id === id ? null : state.primaryTrack;
          const secondaryTrack =
            state.secondaryTrack?.id === id ? null : state.secondaryTrack;
          const { tracks, activeTrackIds } = deriveList(primaryTrack, secondaryTrack);
          return { primaryTrack, secondaryTrack, tracks, activeTrackIds };
        }),

      clearTracks: () =>
        set({
          primaryTrack: null,
          secondaryTrack: null,
          tracks: [],
          activeTrackIds: [],
        }),

      toggleTrack: (id) =>
        set((state) => {
          const toggle = (t: SubtitleTrack | null) =>
            t && t.id === id ? { ...t, enabled: !t.enabled } : t;
          const primaryTrack = toggle(state.primaryTrack);
          const secondaryTrack = toggle(state.secondaryTrack);
          const { tracks, activeTrackIds } = deriveList(primaryTrack, secondaryTrack);
          return { primaryTrack, secondaryTrack, tracks, activeTrackIds };
        }),

      setActiveTrackIds: (ids) =>
        set((state) => {
          const primaryTrack = state.primaryTrack
            ? { ...state.primaryTrack, enabled: ids.includes(state.primaryTrack.id) }
            : null;
          const secondaryTrack = state.secondaryTrack
            ? {
                ...state.secondaryTrack,
                enabled: ids.includes(state.secondaryTrack.id),
              }
            : null;
          const { tracks, activeTrackIds } = deriveList(primaryTrack, secondaryTrack);
          return { primaryTrack, secondaryTrack, tracks, activeTrackIds };
        }),

      setPrimaryStyle: (style) =>
        set((state) => ({
          primaryStyle: { ...state.primaryStyle, ...style },
        })),

      setSecondaryStyle: (style) =>
        set((state) => ({
          secondaryStyle: { ...state.secondaryStyle, ...style },
        })),

      setOffsetPrimary: (offset) => set({ offsetPrimary: offset }),
      setOffsetSecondary: (offset) => set({ offsetSecondary: offset }),

      getCurrentEntries: (time, trackId) => {
        const state = get();
        const track =
          state.primaryTrack?.id === trackId
            ? state.primaryTrack
            : state.secondaryTrack?.id === trackId
            ? state.secondaryTrack
            : null;
        if (!track || !track.enabled) return [];

        const isPrimary = state.primaryTrack?.id === trackId;
        const offset = isPrimary ? state.offsetPrimary : state.offsetSecondary;
        const adjustedTime = time - offset;

        return track.entries.filter(
          (e) => adjustedTime >= e.startTime && adjustedTime <= e.endTime
        );
      },
    }),
    {
      name: 'subtitle-settings',
      partialize: (state) => ({
        primaryStyle: state.primaryStyle,
        secondaryStyle: state.secondaryStyle,
      }),
    }
  )
);