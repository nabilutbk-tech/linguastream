"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight } from "lucide-react";

interface QuizResultsProps {
  correct: number;
  total: number;
  onRetry: () => void;
  onNewQuiz: () => void;
}

export function QuizResults({
  correct,
  total,
  onRetry,
  onNewQuiz,
}: QuizResultsProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { emoji: "🏆", text: "Excellent!", color: "text-amber-500" };
    if (percentage >= 70) return { emoji: "🎉", text: "Great Job!", color: "text-emerald-500" };
    if (percentage >= 50) return { emoji: "👍", text: "Good Effort!", color: "text-blue-500" };
    return { emoji: "💪", text: "Keep Practicing!", color: "text-orange-500" };
  };

  const grade = getGrade();

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center space-y-6">
        <div className="text-6xl">{grade.emoji}</div>

        <div className="space-y-2">
          <h2 className={`text-2xl font-bold ${grade.color}`}>{grade.text}</h2>
          <p className="text-muted-foreground">
            You scored {correct} out of {total}
          </p>
        </div>

        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${percentage * 2.83} 283`}
              className="text-primary transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{percentage}%</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
          <Button onClick={onNewQuiz} className="gap-2">
            New Quiz
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}