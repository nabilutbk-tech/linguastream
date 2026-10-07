"use client";

import React, { useState, useMemo } from "react";
import { useVocabStore } from "@/stores/useVocabStore";
import { WordCard } from "@/components/vocabulary/WordCard";
import { AnkiExport } from "@/components/vocabulary/AnkiExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Trash2,
  CheckSquare,
  Square,
  Filter,
  Star,
} from "lucide-react";
import { LANGUAGES } from "@/lib/utils";

export default function VocabularyPage() {
  const {
    words,
    selectedWords,
    removeWord,
    toggleSelected,
    selectAll,
    deselectAll,
    toggleMastered,
  } = useVocabStore();

  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [showMastered, setShowMastered] = useState(true);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const matchesSearch = w.word
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesLang = langFilter === "all" || w.language === langFilter;
      const matchesMastered = showMastered || !w.mastered;
      return matchesSearch && matchesLang && matchesMastered;
    });
  }, [words, search, langFilter, showMastered]);

  const stats = {
    total: words.length,
    mastered: words.filter((w) => w.mastered).length,
    languages: [...new Set(words.map((w) => w.language))].length,
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Vocabulary
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your learned words and export to Anki
          </p>
        </div>
        <AnkiExport />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Words</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{stats.mastered}</p>
          <p className="text-xs text-muted-foreground">Mastered</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.languages}</p>
          <p className="text-xs text-muted-foreground">Languages</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vocabulary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={langFilter} onValueChange={(v: any) => v && setLangFilter(v)}>
            <SelectTrigger className="w-[130px]">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <SelectItem key={code} value={code}>
                  {lang.flag} {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showMastered ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowMastered(!showMastered)}
            className="w-9"
          >
            <Star className={`w-4 h-4 ${showMastered ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {words.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectedWords.length === words.length ? deselectAll : selectAll}
            className="gap-1.5 text-xs"
          >
            {selectedWords.length === words.length ? (
              <CheckSquare className="w-3.5 h-3.5" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            {selectedWords.length === words.length ? "Deselect All" : "Select All"}
          </Button>
          {selectedWords.length > 0 && (
            <>
              <Badge variant="secondary" className="text-xs">
                {selectedWords.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  selectedWords.forEach((id) => removeWord(id));
                  deselectAll();
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </Button>
            </>
          )}
        </div>
      )}

      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredWords.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onUpdate={() => {}}
              onDelete={removeWord}
              onToggleMastered={toggleMastered}
              selected={!!word.id && selectedWords.includes(word.id)}
              onToggleSelect={() => word.id && toggleSelected(word.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">
            {words.length === 0 ? "No vocabulary yet" : "No matching words"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {words.length === 0
              ? "Extract words from subtitles while watching videos to build your vocabulary."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      )}
    </div>
  );
}