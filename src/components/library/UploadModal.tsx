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
import { Upload, Film, FileText, Loader2 } from "lucide-react";
import { LANGUAGES } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface UploadModalProps {
  onUpload?: (data: FormData) => Promise<void>;
}

export function UploadModal({ onUpload }: UploadModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("en");
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
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [videoFile, title, language, subFile1, subLang1, subFile2, subLang2, onUpload, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 gap-2">
        <Upload className="w-4 h-4" />
        Upload Video
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            Upload Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title..."
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
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}