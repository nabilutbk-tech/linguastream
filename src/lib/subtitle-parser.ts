import { SubtitleEntry, ParsedSubtitle } from '@/types';

function timeToSeconds(timeStr: string): number {
  const cleaned = timeStr.trim().replace(',', '.');
  const parts = cleaned.split(':');
  
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
}

function secondsToTimeStr(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = (seconds % 60).toFixed(2);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${parseFloat(s).toFixed(2).padStart(5, '0')}`;
}

export function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\n+/);
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    
    const id = parseInt(lines[0].trim(), 10);
    if (isNaN(id)) continue;
    
    const timeMatch = lines[1].match(
      /(\d{2}:\d{2}:\d{2}[,\.]\d{2,3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{2,3})/
    );
    if (!timeMatch) continue;
    
    const startTime = timeToSeconds(timeMatch[1]);
    const endTime = timeToSeconds(timeMatch[2]);
    const text = lines.slice(2).join('\n');
    
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    
    entries.push({
      id,
      startTime,
      endTime,
      startTimeStr: secondsToTimeStr(startTime),
      endTimeStr: secondsToTimeStr(endTime),
      text: cleanText,
      rawText: text.trim(),
    });
  }
  return entries;
}

export function parseASS(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = content.split(/\r?\n/);
  
  let inEvents = false;
  let formatFields: string[] = [];
  let counter = 1;
  
  for (const line of lines) {
    if (line.trim() === '[Events]') {
      inEvents = true;
      continue;
    }
    if (line.startsWith('[') && line !== '[Events]') {
      inEvents = false;
      continue;
    }
    if (!inEvents) continue;
    
    if (line.startsWith('Format:')) {
      formatFields = line.substring(7).split(',').map(f => f.trim().toLowerCase());
      continue;
    }
    
    if (line.startsWith('Dialogue:')) {
      const values = line.substring(9).split(',');
      const startIdx = formatFields.indexOf('start');
      const endIdx = formatFields.indexOf('end');
      const textIdx = formatFields.indexOf('text');
      
      if (startIdx === -1 || endIdx === -1 || textIdx === -1) continue;
      
      const startTime = timeToSeconds(values[startIdx]?.trim() || '0:00:00.00');
      const endTime = timeToSeconds(values[endIdx]?.trim() || '0:00:00.00');
      
      const rawText = values.slice(textIdx).join(',').trim();
      const cleanText = rawText
        .replace(/\{[^}]*\}/g, '')
        .replace(/\\N/g, '\n')
        .replace(/\\n/g, '\n')
        .trim();
      
      if (!cleanText) continue;
      
      entries.push({
        id: counter++,
        startTime,
        endTime,
        startTimeStr: secondsToTimeStr(startTime),
        endTimeStr: secondsToTimeStr(endTime),
        text: cleanText,
        rawText,
      });
    }
  }
  entries.sort((a, b) => a.startTime - b.startTime);
  return entries;
}

export function detectSubtitleFormat(filename: string): 'srt' | 'ass' {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'ass' || ext === 'ssa') return 'ass';
  return 'srt';
}

export function extractWordsFromSubtitles(
  entries: SubtitleEntry[],
  language: string
): { word: string; context: string; count: number }[] {
  const wordMap = new Map<string, { context: string; count: number }>();
  
  for (const entry of entries) {
    let words: string[] = [];
    if (language === 'ja') {
      words = entry.text.match(/[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]+/g) || [];
    } else {
      words = entry.text.toLowerCase().replace(/[^\w\s'-]/g, '').split(/\s+/).filter(w => w.length > 1);
    }
    
    for (const word of words) {
      const existing = wordMap.get(word);
      if (existing) {
        existing.count++;
      } else {
        wordMap.set(word, { context: entry.text, count: 1 });
      }
    }
  }
  
  return Array.from(wordMap.entries())
    .map(([word, data]) => ({ word, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function detectLanguage(entries: SubtitleEntry[]): "en" | "ja" | "id" | null {
  const sample = entries
    .slice(0, 300)
    .map((e) => e.text)
    .join(" ");
  if (!sample.trim()) return null;

  // Jepang: banyak huruf kana / kanji
  const jaChars = (sample.match(/[\u3040-\u30ff\u4e00-\u9faf]/g) || []).length;
  const letters = (sample.match(/\p{L}/gu) || []).length || 1;
  if (jaChars / letters > 0.3) return "ja";

  // Inggris vs Indonesia: hitung kata umum
  const EN = new Set(["the", "and", "you", "that", "is", "to", "of", "it", "this", "what", "are", "for", "not", "have"]);
  const ID = new Set(["yang", "dan", "di", "itu", "ini", "tidak", "aku", "kamu", "dengan", "untuk", "ada", "saya", "dia", "apa", "akan"]);

  const words = sample.toLowerCase().match(/[a-z']+/g) || [];
  let en = 0;
  let id = 0;
  for (const w of words) {
    if (EN.has(w)) en++;
    else if (ID.has(w)) id++;
  }
  if (en === 0 && id === 0) return null;
  return id > en ? "id" : "en";
}