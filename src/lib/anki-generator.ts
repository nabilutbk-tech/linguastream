import { VocabWord } from '@/types';

export function generateAnkiTSV(words: VocabWord[]): string {
  const header = '#separator:tab\n#html:true\n#columns:Front\tBack\tContext\tTags\n';
  
  const rows = words.map(word => {
    const front = word.reading 
      ? `${word.word}<br><small>${word.reading}</small>` 
      : word.word;
    const back = word.meaning;
    const context = word.context || '';
    const tags = word.tags || `lingua::${word.language}`;
    
    return `${front}\t${back}\t${context}\t${tags}`;
  });
  
  return header + rows.join('\n');
}

export function generateAnkiCSV(words: VocabWord[]): string {
  const rows = words.map(word => {
    const front = word.reading ? `${word.word} (${word.reading})` : word.word;
    const escapedMeaning = word.meaning.replace(/"/g, '""');
    const escapedContext = (word.context || '').replace(/"/g, '""');
    
    return `"${front}","${escapedMeaning}","${escapedContext}"`;
  });
  
  return rows.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}