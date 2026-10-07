import { create } from 'zustand';

interface PlayerStore {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showSpeedOverlay: boolean;

  setIsPlaying: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setSpeed: (s: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setIsFullscreen: (v: boolean) => void;
  setShowSpeedOverlay: (v: boolean) => void;
  seekRelative: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  showSpeedOverlay: false,

  setIsPlaying: (v) => set({ isPlaying: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setSpeed: (s) => set({ speed: s }),
  setVolume: (v) => set({ volume: v }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setIsFullscreen: (v) => set({ isFullscreen: v }),
  setShowSpeedOverlay: (v) => set({ showSpeedOverlay: v }),
  seekRelative: (seconds) => {
    const { currentTime, duration } = get();
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    set({ currentTime: newTime });
  },
}));