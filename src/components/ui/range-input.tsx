"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RangeInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  "aria-label"?: string;
}

export function RangeInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
  ...rest
}: RangeInputProps) {
  const percent =
    max > min
      ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
      : 0;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("range-input w-full", className)}
      style={{ "--range-progress": `${percent}%` } as React.CSSProperties}
      {...rest}
    />
  );
}