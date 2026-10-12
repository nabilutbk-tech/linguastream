"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Film, FileText, Loader2, Check, ExternalLink, AlertCircle, FolderOpen } from "lucide-react";
import { LANGUAGES } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VideoInfo } from "@/types";

interface UploadModalProps {
  onUpload?: (data: FormData) => Promise<void>;
}

const VIDEO_PROVIDERS = [
  {
    id: "github",
    name: "GitHub Releases",
    icon: "🐙",
    description: "Free, unlimited storage, 2GB/file",
    setup: "Requires GitHub Token + Repo",
    recommended: true,
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    icon: "📱",
    description: "Free, up to 50MB/file (official API)",
    setup: "Requires Bot Token + Chat ID",
    recommended: false,
  },
  {
    id: "internet-archive",
    name: "Internet Archive",
    icon: "📚",
    description: "Free, forever storage",
    setup: "Requires Archive.org API keys",
    recommended: false,
  },
  {
    id: "vercel-blob",
    name: "Vercel Blob",
    icon: "▲",
    description: "Free tier: 1GB",
    setup: "Auto-configured on Vercel",
    recommended: false,
  },
];

export function UploadModal({ onUpload }: UploadModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [series, setSeries] = useState("");
  const [existingSeries, setExistingSeries] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const [provider, setProvider] = useState("github");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subFile1, setSubFile1] = useState<File | null>(null);
  const [subLang1, setSubLang1] = useState("en");
  const [subFile2, setSubFile2] = useState<File | null>(null);
  const [subLang2, setSubLang2] = useState("ja");

  const handleSubmit = useCallback(async () => {
    if (!videoFile) {
      setError("Please select a video file");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("title", title || videoFile.name);
      formData.append("description", description);
      formData.append("series", series);
      formData.append("language", language);
      formData.append("provider", provider);
      formData.append("video", videoFile);
      
      if (subFile1) {
        formData.append("subtitle1", subFile1);
        formData.append("subLang1", subLang1);
      }
      if (subFile2) {
        formData.append("subtitle2", subFile2);
        formData.append("subLang2", subLang2);
      }

      if (onUpload) {
        await onUpload(formData);
      }

      // Reset form
      setOpen(false);
      setTitle("");
      setDescription("");
      setSeries("");
      setVideoFile(null);
      setSubFile1(null);
      setSubFile2(null);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [videoFile, title, description, series, language, provider, subFile1, subLang1, subFile2, subLang2, onUpload]);

  const selectedProvider = VIDEO_PROVIDERS.find((p) => p.id === provider);

  // Muat daftar folder/series yang sudah ada saat dialog dibuka (untuk autocomplete)
  const handleOpenChange = useCallback(async (open: boolean) => {
    setOpen(open);
    if (open) {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const list: VideoInfo[] = await res.json();
          const names = Array.from(
            new Set(
              list
                .map((v) => v.series)
                .filter((s): s is string => !!s && s.trim() !== "")
                .map((s) => s.trim())
            )
          ).sort((a, b) => a.localeCompare(b));
          setExistingSeries(names);
        }
      } catch {
        // abaikan, datalist opsional
      }
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Upload className="w-4 h-4" />
        Upload Video
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            Upload Video - 100% Free Hosting
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Video Hosting Provider</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VIDEO_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  disabled={loading}
                  className={`relative p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                    provider === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{p.name}</span>
                        {p.recommended && (
                          <Badge variant="default" className="text-[10px] h-4">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.description}
                      </p>
                    </div>
                    {provider === p.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {selectedProvider && (
              <div className="bg-muted/50 rounded-lg p-3 text-xs">
                <p className="font-medium mb-1">Setup Required:</p>
                <p className="text-muted-foreground">{selectedProvider.setup}</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Video Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Learning Video..."
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the video content..."
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Series / Folder */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" />
              Series / Folder (Optional)
            </Label>
            <Input
              list="series-suggestions"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder="Contoh: Boruto, Naruto, One Piece..."
              disabled={loading}
            />
            <datalist id="series-suggestions">
              {existingSeries.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {existingSeries.length > 0 && (
              <p className="text-xs text-muted-foreground">
                📁 Folder yang sudah ada: {existingSeries.join(", ")}
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <Label>Content Language *</Label>
            <Select value={language} onValueChange={(v) => v != null && setLanguage(v)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <SelectItem key={code} value={code}>
                    {lang.flag} {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Video File */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <Film className="w-3.5 h-3.5" />
              Video File *
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              disabled={loading}
              className="file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:text-primary-foreground file:cursor-pointer"
            />
            {videoFile && (
              <p className="text-xs text-muted-foreground">
                {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)}MB)
              </p>
            )}
          </div>

          {/* Subtitle 1 */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Subtitle 1 (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".srt,.ass,.ssa"
                onChange={(e) => setSubFile1(e.target.files?.[0] || null)}
                disabled={loading}
                className="flex-1 file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs file:cursor-pointer"
              />
              <Select value={subLang1} onValueChange={(v) => v != null && setSubLang1(v)} disabled={loading}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <SelectItem key={code} value={code}>
                      {lang.flag} {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subtitle 2 */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Subtitle 2 (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".srt,.ass,.ssa"
                onChange={(e) => setSubFile2(e.target.files?.[0] || null)}
                disabled={loading}
                className="flex-1 file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs file:cursor-pointer"
              />
              <Select value={subLang2} onValueChange={(v) => v != null && setSubLang2(v)} disabled={loading}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <SelectItem key={code} value={code}>
                      {lang.flag} {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!videoFile || loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload to {selectedProvider?.name}
              </>
            )}
          </Button>

          {/* Setup Guide Link */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
              📘 Need help setting up?
            </p>
            <a
              href="https://github.com/nabilutbk-tech/mystream/blob/main/SETUP_FREE_HOSTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Setup Guide
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
