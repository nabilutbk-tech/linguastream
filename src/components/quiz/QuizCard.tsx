"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (answer: string, correct: boolean) => void;
}

export function QuizCard({ question, onAnswer }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputAnswer, setInputAnswer] = useState("");
  const [answered, setAnswered] = useState(false);

  const isCorrect =
    selectedAnswer === question.correctAnswer ||
    inputAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswered(true);
    onAnswer(option, option === question.correctAnswer);
  };

  const handleSubmitInput = () => {
    if (answered || !inputAnswer.trim()) return;
    setAnswered(true);
    const correct =
      inputAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    onAnswer(inputAnswer, correct);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            {question.type === "multiple_choice"
              ? "Multiple Choice"
              : "Fill in the Blank"}
          </Badge>
          <h3 className="text-lg font-medium leading-relaxed">
            {question.question}
          </h3>
          {question.context && (
            <p className="text-sm text-muted-foreground italic">
              Context: &ldquo;{question.context}&rdquo;
            </p>
          )}
        </div>

        {question.type === "multiple_choice" && question.options && (
          <div className="grid gap-2">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === question.correctAnswer;

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleSelect(option)}
                  disabled={answered}
                  className={cn(
                    "text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 text-sm",
                    "hover:bg-accent/50 hover:border-primary/30",
                    !answered && "border-border",
                    answered && isCorrectOption && "border-emerald-500 bg-emerald-500/10",
                    answered && isSelected && !isCorrectOption && "border-destructive bg-destructive/10",
                    answered && !isSelected && !isCorrectOption && "border-border opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {answered && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {answered && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {question.type === "fill_blank" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={answered}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitInput()}
                className={cn(
                  "flex-1",
                  answered && isCorrect && "border-emerald-500",
                  answered && !isCorrect && "border-destructive"
                )}
              />
              <Button
                onClick={handleSubmitInput}
                disabled={answered || !inputAnswer.trim()}
              >
                Check
              </Button>
            </div>
            {answered && !isCorrect && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Correct answer: <span className="font-bold">{question.correctAnswer}</span>
              </p>
            )}
          </div>
        )}

        {answered && (
          <div
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg text-sm font-medium",
              isCorrect
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Correct! Great job! 🎉
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Not quite. Keep practicing! 💪
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}