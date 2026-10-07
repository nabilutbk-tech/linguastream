"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Table, CheckCircle2 } from "lucide-react";
import { useVocabStore } from "@/stores/useVocabStore";
import { generateAnkiTSV, generateAnkiCSV, downloadFile } from "@/lib/anki-generator";
import { useToast } from "@/components/ui/use-toast";

export function AnkiExport() {
  const { words, selectedWords } = useVocabStore();
  const [format, setFormat] = useState<"tsv" | "csv">("tsv");
  const [scope, setScope] = useState<"all" | "selected">("all");
  const { toast } = useToast();

  const wordsToExport =
    scope === "selected"
      ? words.filter((w) => w.id && selectedWords.includes(w.id))
      : words;

  const handleExport = () => {
    if (wordsToExport.length === 0) {
      toast({ title: "No words to export", variant: "destructive" });
      return;
    }

    if (format === "tsv") {
      const content = generateAnkiTSV(wordsToExport);
      downloadFile(content, "linguastream_anki.txt", "text/plain;charset=utf-8");
    } else {
      const content = generateAnkiCSV(wordsToExport);
      downloadFile(content, "linguastream_anki.csv", "text/csv;charset=utf-8");
    }

    toast({
      title: `Exported ${wordsToExport.length} words`,
      description: `Format: ${format.toUpperCase()} - Ready to import into Anki`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2">
        <Download className="w-4 h-4 text-primary" />
        Export to Anki
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Export to Anki
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Words to export</Label>
            <Select value={scope} onValueChange={(v: any) => v && setScope(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All words ({words.length})</SelectItem>
                <SelectItem value="selected" disabled={selectedWords.length === 0}>
                  Selected only ({selectedWords.length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Export format</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("tsv")}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  format === "tsv"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Table className="w-4 h-4" />
                  <span className="font-medium text-sm">TSV</span>
                  {format === "tsv" && (
                    <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tab-separated (Recommended)
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  format === "csv"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium text-sm">CSV</span>
                  {format === "csv" && (
                    <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Comma-separated
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Preview</Label>
            <div className="bg-muted rounded-lg p-3 text-xs font-mono max-h-32 overflow-auto">
              {wordsToExport.slice(0, 3).map((w, i) => (
                <div key={i} className="truncate text-muted-foreground">
                  {w.word} → {w.meaning || "(no meaning)"} |{" "}
                  {w.context?.slice(0, 30) || ""}...
                </div>
              ))}
              {wordsToExport.length > 3 && (
                <div className="text-muted-foreground/50 mt-1">
                  ... and {wordsToExport.length - 3} more
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleExport} className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export {wordsToExport.length} words
          </Button>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-xs font-medium">How to import into Anki:</p>
            <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
              <li>Open Anki Desktop</li>
              <li>Go to File → Import</li>
              <li>Select the exported file</li>
              <li>Set field separator to Tab/Comma</li>
              <li>Map fields: Front, Back, Context</li>
              <li>Click Import</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}