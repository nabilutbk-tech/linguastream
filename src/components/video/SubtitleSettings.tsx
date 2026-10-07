"use client";

import React, { useState } from "react";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { RangeInput } from "@/components/ui/range-input";
import { Settings, Palette, Type, Clock, Trash2 } from "lucide-react";
import { SubtitleStyle } from "@/types";
import { cn } from "@/lib/utils";

const fontFamilies = [
  { value: "system-ui", label: "System (default)" },
  { value: "'Noto Sans JP', sans-serif", label: "Noto Sans JP (cocok untuk Jepang)" },
  { value: "monospace", label: "Monospace" },
];

const SYNC_STEPS = [-0.5, -0.1, 0.1, 0.5];

function hexToRgba(hex: string, alpha: number) {
  const m = hex.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const safe = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 min-w-0 font-mono text-xs"
        />
      </div>
    </div>
  );
}

function StyleEditor({
  style,
  onChange,
  offset,
  onOffsetChange,
  sampleText,
}: {
  style: SubtitleStyle;
  onChange: (s: Partial<SubtitleStyle>) => void;
  offset: number;
  onOffsetChange: (o: number) => void;
  sampleText: string;
}) {
  const changeOffset = (next: number) => {
    const rounded = Math.round(next * 10) / 10;
    onOffsetChange(Math.max(-30, Math.min(30, rounded)));
  };

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="flex justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 p-5">
        <span
          className="subtitle-text rounded-md px-3 py-1 text-center"
          style={{
            backgroundColor: hexToRgba(style.bgColor, style.bgOpacity),
            color: style.fontColor,
            fontFamily: style.fontFamily,
            fontSize: `${Math.min(style.fontSize, 28)}px`,
          }}
        >
          {sampleText}
        </span>
      </div>

      {/* Font size */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Ukuran teks: {style.fontSize}px
        </Label>
        <RangeInput
          value={style.fontSize}
          min={12}
          max={48}
          step={1}
          onChange={(v) => onChange({ fontSize: v })}
          aria-label="Ukuran teks subtitle"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ColorField
          label="Warna teks"
          value={style.fontColor}
          onChange={(v) => onChange({ fontColor: v })}
        />
        <ColorField
          label="Warna latar teks"
          value={style.bgColor}
          onChange={(v) => onChange({ bgColor: v })}
        />
      </div>

      {/* Background opacity */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Transparansi latar: {Math.round(style.bgOpacity * 100)}%
        </Label>
        <RangeInput
          value={style.bgOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => onChange({ bgOpacity: v })}
          aria-label="Transparansi latar subtitle"
        />
      </div>

      {/* Font family */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Jenis font</Label>
        <NativeSelect
          value={style.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
        >
          {fontFamilies.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      {/* Sync */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Geser waktu subtitle
          </Label>
          <span className="font-mono text-sm font-bold">
            {offset > 0 ? "+" : ""}
            {offset.toFixed(1)}s
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {SYNC_STEPS.slice(0, 2).map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-1 text-xs"
              onClick={() => changeOffset(offset + s)}
            >
              {s}s
            </Button>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 px-1 text-xs"
            onClick={() => changeOffset(0)}
          >
            Reset
          </Button>
          {SYNC_STEPS.slice(2).map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-1 text-xs"
              onClick={() => changeOffset(offset + s)}
            >
              +{s}s
            </Button>
          ))}
        </div>

        <RangeInput
          value={offset}
          min={-30}
          max={30}
          step={0.1}
          onChange={changeOffset}
          aria-label="Geser waktu subtitle"
        />
        <p className="text-xs text-muted-foreground">
          <b>Minus (−)</b> = subtitle muncul lebih cepat. <b>Plus (+)</b> =
          subtitle muncul lebih lambat.
        </p>
      </div>
    </div>
  );
}

export function SubtitleSettings() {
  const [tab, setTab] = useState<"primary" | "secondary">("primary");

    const {
    primaryTrack,
    secondaryTrack,
    activeTrackIds,
    primaryStyle,
    secondaryStyle,
    offsetPrimary,
    offsetSecondary,
    toggleTrack,
    removeTrack,
    setPrimaryStyle,
    setSecondaryStyle,
    setOffsetPrimary,
    setOffsetSecondary,
  } = useSubtitleStore();

  const slotTracks = [
    primaryTrack ? { track: primaryTrack, slot: 0 as const, tag: "Sub 1" } : null,
    secondaryTrack ? { track: secondaryTrack, slot: 1 as const, tag: "Sub 2" } : null,
  ].filter(Boolean) as {
    track: NonNullable<typeof primaryTrack>;
    slot: 0 | 1;
    tag: string;
  }[];

  return (
    <Sheet>
      <SheetTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Subtitle Style</span>
      </SheetTrigger>

      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Subtitle Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-10">
          {/* Track list */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Subtitle yang dimuat (maks. 2)
            </Label>
                        <div className="space-y-2">
              {slotTracks.map(({ track, tag }) => {
                const isActive = activeTrackIds.includes(track.id);
                return (
                  <div
                    key={track.id}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-3",
                      isActive ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTrack(track.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <div
                        className={cn(
                          "h-3 w-3 shrink-0 rounded-full border-2",
                          isActive
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {track.label}
                        {track.fileName ? ` — ${track.fileName}` : ""}
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {tag}
                      </Badge>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => removeTrack(track.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
              {slotTracks.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Belum ada subtitle yang dimuat
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Tab buatan sendiri */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["primary", "secondary"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    tab === key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {key === "primary" ? "Subtitle 1" : "Subtitle 2"}
                </button>
              ))}
            </div>

            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Type className="h-4 w-4 text-primary" />
              Tampilan {tab === "primary" ? "Subtitle 1 (baris bawah)" : "Subtitle 2 (baris atas)"}
            </h3>

            {tab === "primary" ? (
              <StyleEditor
                style={primaryStyle}
                onChange={setPrimaryStyle}
                offset={offsetPrimary}
                onOffsetChange={setOffsetPrimary}
                sampleText="Contoh subtitle 1 / サンプル"
              />
            ) : (
              <StyleEditor
                style={secondaryStyle}
                onChange={setSecondaryStyle}
                offset={offsetSecondary}
                onOffsetChange={setOffsetSecondary}
                sampleText="Contoh subtitle 2 / サンプル"
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}