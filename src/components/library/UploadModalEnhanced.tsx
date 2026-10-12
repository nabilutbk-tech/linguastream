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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Film, FileText, Loader2, Check, ExternalLink } from "lucide-react";
import { LANGUAGES } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface UploadModalProps {
  onUpload?: (data: FormData) => Promise<void>;
}

const VIDEO_PROVIDERS = [
  {
    id: "telegram",
    name: "Telegram Bot",
    icon: "📱",
    description: "Free, up to 2GB per file",
    setup: "Requires Bot Token + Chat ID",
    recommended: true,
  },
  {
    id: "github",
    name: "GitHub Releases",
    icon: "🐙",
    description: "Free, unlimited storage",
    setup: "Requires GitHub Token + Repo",
    recommended: true,
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

export function UploadModalEnhanced({ onUpload }: UploadModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("en");
  const [provider, setProvider] = useState("telegram");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subFile1, setSubFile1] = useState<File | null>(null);
  const [subLang1, setSubLang1] = useState("en");
  const [subFile2, setSubFile2] = useState<File | null>(null);
  const [subLang2, setSubLang2] = useState("ja");
  const { toast } = useToast();

  const handleSubmit = useCallback(async () => {
    if (!videoFile) {
      toast({ title: "Please select a video file", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title || videoFile.name);
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

      toast({ title: "Video uploaded successfully!" });
      setOpen(false);
      setTitle("");
      setVideoFile(null);
      setSubFile1(null);
      setSubFile2(null);
    } catch (error: any) {
      toast({ 
        title: "Upload failed", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [videoFile, title, language, provider, subFile1, subLang1, subFile2, subLang2, onUpload, toast]);

  const selectedProvider = VIDEO_PROVIDERS.find((p) => p.id === provider);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 gap-2">
        <Upload className="w-4 h-4" />
        Upload Video
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            Upload Video - 100% Free Hosting
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Video Hosting Provider</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VIDEO_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`relative p-3 rounded-lg border-2 text-left transition-all ${
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
            <Label>Video Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Learning Video..."
            />
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <Label>Content Language</Label>
            <Select value={language} onValueChange={(v: any) => v && setLanguage(v)}>
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
              Video File
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
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
                className="flex-1 file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs file:cursor-pointer"
              />
              <Select value={subLang1} onValueChange={(v: any) => v && setSubLang1(v)}>
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
                className="flex-1 file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs file:cursor-pointer"
              />
              <Select value={subLang2} onValueChange={(v: any) => v && setSubLang2(v)}>
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
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {loading ? "Uploading..." : "Upload to " + selectedProvider?.name}
          </Button>

          {/* Setup Guide Link */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
              📘 Need help setting up?
            </p>
            <a
              href="https://github.com/nabilutbk-tech/mystream#video-hosting-setup"
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
