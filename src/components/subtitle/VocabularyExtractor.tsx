"use client";

import React, { useMemo, useState } from "react";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { useVocabStore } from "@/stores/useVocabStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Check,
  Search,
  Download,
  Sparkles,
  Filter,
} from "lucide-react";
import { extractWordsFromSubtitles } from "@/lib/subtitle-parser";
import { generateAnkiTSV, downloadFile } from "@/lib/anki-generator";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function VocabularyExtractor() {
  const { tracks, activeTrackIds } = useSubtitleStore();
  const { words, addWord, addWords } = useVocabStore();
  const [search, setSearch] = useState("");
  const [sourceTrack, setSourceTrack] = useState<string>("primary");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const primaryTrack = tracks.find((t) => t.id === activeTrackIds[0]);
  const secondaryTrack = tracks.find((t) => t.id === activeTrackIds[1]);

  const extractedWords = useMemo(() => {
    let combinedEntries: any[] = [];
    let targetLang = "en";

    if (sourceTrack === "primary" && primaryTrack) {
      combinedEntries = primaryTrack.entries;
      targetLang = primaryTrack.language;
    } else if (sourceTrack === "secondary" && secondaryTrack) {
      combinedEntries = secondaryTrack.entries;
      targetLang = secondaryTrack.language;
    } else if (sourceTrack === "both") {
      if (primaryTrack) combinedEntries = [...combinedEntries, ...primaryTrack.entries];
      if (secondaryTrack) combinedEntries = [...combinedEntries, ...secondaryTrack.entries];
      targetLang = primaryTrack?.language || secondaryTrack?.language || "en";
    }

    if (combinedEntries.length === 0) return [];
    return extractWordsFromSubtitles(combinedEntries, targetLang);
  }, [sourceTrack, primaryTrack, secondaryTrack]);

  const filteredWords = useMemo(() => {
    if (!search) return extractedWords;
    return extractedWords.filter((w) =>
      w.word.toLowerCase().includes(search.toLowerCase())
    );
  }, [extractedWords, search]);

  const isWordAdded = (word: string) =>
    words.some((w) => w.word.toLowerCase() === word.toLowerCase());

  const handleAddWord = (word: string, context: string) => {
    addWord({
      word,
      meaning: "",
      context,
      language: primaryTrack?.language || "en",
    });
    toast({ title: `"${word}" added to vocabulary` });
  };

  const handleExportToAnki = () => {
    if (words.length === 0) {
      toast({ title: "No words to export", variant: "destructive" });
      return;
    }
    const tsv = generateAnkiTSV(words);
    downloadFile(tsv, "linguastream_vocab.txt", "text/plain");
    toast({ title: `Exported ${words.length} words for Anki` });
  };

  const handleAddAll = () => {
    const newWords = filteredWords
      .filter((w) => !isWordAdded(w.word))
      .slice(0, 100)
      .map((w) => ({
        word: w.word,
        meaning: "",
        context: w.context,
        language: primaryTrack?.language || "en",
      }));
    addWords(newWords);
    toast({ title: `Added ${newWords.length} words` });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2">
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline">Extract Vocab</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Vocabulary Extractor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Track Source Selection */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium">Extract from:</span>
            <Select value={sourceTrack} onValueChange={(v: any) => v && setSourceTrack(v)}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Subtitle 1 (Primary)</SelectItem>
                <SelectItem value="secondary" disabled={!secondaryTrack}>
                  Subtitle 2 (Secondary)
                </SelectItem>
                <SelectItem value="both" disabled={!secondaryTrack}>
                  Both Subtitles
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search words..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={handleAddAll}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={handleExportToAnki}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Anki
            </Button>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {extractedWords.length} unique words
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {words.length} in vocabulary
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin mt-3 -mx-6 px-6 divide-y">
          {filteredWords.map((item) => {
            const added = isWordAdded(item.word);
            return (
              <div
                key={item.word}
                className={cn(
                  "flex items-center gap-3 py-2.5 transition-colors",
                  added && "opacity-50"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.word}</span>
                    <Badge variant="outline" className="text-[10px] h-4">
                      ×{item.count}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.context}
                  </p>
                </div>
                <Button
                  variant={added ? "ghost" : "outline"}
                  size="icon"
                  className="w-7 h-7 flex-shrink-0"
                  disabled={added}
                  onClick={() => handleAddWord(item.word, item.context)}
                >
                  {added ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}