"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, XCircle } from "lucide-react";

interface QuizProgressProps {
  current: number;
  total: number;
  correct: number;
  wrong: number;
}

export function QuizProgress({
  current,
  total,
  correct,
  wrong,
}: QuizProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            Question {Math.min(current + 1, total)} of {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-emerald-600">
            <CheckCircle2 className="w-3 h-3" />
            {correct}
          </Badge>
          <Badge variant="outline" className="gap-1 text-destructive">
            <XCircle className="w-3 h-3" />
            {wrong}
          </Badge>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}