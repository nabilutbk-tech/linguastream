import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const LANGUAGES = {
  en: { label: 'English', flag: 'EN', nativeName: 'English' },
  ja: { label: 'Japanese', flag: 'JA', nativeName: '日本語' },
  id: { label: 'Indonesian', flag: 'ID', nativeName: 'Bahasa Indonesia' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;