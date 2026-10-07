export interface SubtitleEntry {
  id: number;
  startTime: number; // in seconds
  endTime: number;
  startTimeStr: string;
  endTimeStr: string;
  text: string;
  rawText: string;
}

export interface ParsedSubtitle {
  format: 'srt' | 'ass';
  language: string;
  entries: SubtitleEntry[];
}

export interface SubtitleStyle {
  fontSize: number;
  fontColor: string;
  bgColor: string;
  bgOpacity: number;
  highlightColor: string;
  position: 'top' | 'bottom';
  fontFamily: string;
}

export interface VocabWord {
  id?: string;
  word: string;
  reading?: string;
  meaning: string;
  context?: string;
  language: string;
  tags?: string;
  notes?: string;
  mastered?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'listening';
  question: string;
  options?: string[];
  correctAnswer: string;
  context?: string;
  audioTimestamp?: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  volume: number;
  isFullscreen: boolean;
  isMuted: boolean;
}

export interface VideoInfo {
  id: string;
  title: string;
  description?: string;
  sourceType: 'local' | 'telegram';
  videoUrl?: string;
  thumbnailUrl?: string;
  telegramFileId?: string;
  telegramChatId?: string;
  telegramMessageId?: number;
  duration?: number;
  language: string;
  category?: string;
  subtitles: SubtitleInfo[];
  createdAt: string;
}

export interface SubtitleInfo {
  id: string;
  language: string;
  label: string;
  format: string;
}