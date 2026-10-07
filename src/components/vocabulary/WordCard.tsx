"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, Edit3, Star, StarOff } from "lucide-react";
import { VocabWord } from "@/types";
import { LANGUAGES, LanguageCode, cn } from "@/lib/utils";

interface WordCardProps {
  word: VocabWord;
  onUpdate: (word: VocabWord) => void;
  onDelete: (id: string) => void;
  onToggleMastered: (id: string) => void;
  selected: boolean;
  onToggleSelect: () => void;
}

export function WordCard({
  word,
  onUpdate,
  onDelete,
  onToggleMastered,
  selected,
  onToggleSelect,
}: WordCardProps) {
  const [editing, setEditing] = useState(false);
  const [meaning, setMeaning] = useState(word.meaning);
  const lang = LANGUAGES[word.language as LanguageCode];

  const handleSave = () => {
    onUpdate({ ...word, meaning });
    setEditing(false);
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-primary",
        word.mastered && "opacity-60"
      )}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSelect}
              className={cn(
                "w-4 h-4 rounded border-2 transition-colors flex-shrink-0 mt-0.5 flex items-center justify-center",
                selected
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {selected && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            <div>
              <p
                className={cn(
                  "font-bold text-base",
                  word.language === "ja" && "font-jp"
                )}
              >
                {word.word}
              </p>
              {word.reading && (
                <p className="text-xs text-muted-foreground">{word.reading}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {lang && (
              <Badge variant="outline" className="text-[10px] h-5">
                {lang.flag}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => word.id && onToggleMastered(word.id)}
            >
              {word.mastered ? (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              ) : (
                <StarOff className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {editing ? (
          <div className="flex gap-1.5">
            <Input
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Enter meaning..."
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <Button size="sm" className="h-8 px-2" onClick={handleSave}>
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <p
            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => setEditing(true)}
          >
            {word.meaning || (
              <span className="italic text-muted-foreground/50 flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                Click to add meaning
              </span>
            )}
          </p>
        )}

        {word.context && (
          <p className="text-xs text-muted-foreground/70 italic line-clamp-2 bg-muted/50 rounded px-2 py-1">
            &ldquo;{word.context}&rdquo;
          </p>
        )}

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-destructive hover:text-destructive"
            onClick={() => word.id && onDelete(word.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}