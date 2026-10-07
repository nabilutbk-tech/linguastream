"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useVocabStore } from "@/stores/useVocabStore";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizResults } from "@/components/quiz/QuizResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Play, BookOpen, Settings2 } from "lucide-react";
import { LANGUAGES } from "@/lib/utils";
import { QuizQuestion } from "@/types";

function generateQuizQuestions(
  words: { word: string; meaning: string; context?: string }[],
  count: number,
  allWords: { word: string; meaning: string }[]
): QuizQuestion[] {
  const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((word, index) => {
    const isMultipleChoice = Math.random() > 0.3;

    if (isMultipleChoice) {
      const otherWords = allWords
        .filter((w) => w.word !== word.word && w.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.meaning);

      while (otherWords.length < 3) {
        otherWords.push(`Option ${otherWords.length + 1}`);
      }

      const options = [...otherWords, word.meaning].sort(
        () => Math.random() - 0.5
      );

      return {
        id: `q-${index}`,
        type: "multiple_choice" as const,
        question: `What does "${word.word}" mean?`,
        options,
        correctAnswer: word.meaning,
        context: word.context,
      };
    } else {
      return {
        id: `q-${index}`,
        type: "fill_blank" as const,
        question: `Type the meaning of "${word.word}"`,
        correctAnswer: word.meaning,
        context: word.context,
      };
    }
  });
}

export default function QuizPage() {
  const { words } = useVocabStore();
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [langFilter, setLangFilter] = useState("all");
  const [questionCount, setQuestionCount] = useState(10);

  const availableWords = useMemo(() => {
    return words.filter((w) => {
      const hasMeaning = w.meaning && w.meaning.trim() !== "";
      const matchesLang = langFilter === "all" || w.language === langFilter;
      return hasMeaning && matchesLang;
    });
  }, [words, langFilter]);

  const startQuiz = useCallback(() => {
    if (availableWords.length < 2) return;

    const count = Math.min(questionCount, availableWords.length);
    const allWordsWithMeaning = words.filter((w) => w.meaning);
    const generated = generateQuizQuestions(
      availableWords,
      count,
      allWordsWithMeaning
    );

    setQuestions(generated);
    setCurrentIndex(0);
    setCorrect(0);
    setWrong(0);
    setQuizStarted(true);
    setQuizFinished(false);
  }, [availableWords, questionCount, words]);

  const handleAnswer = useCallback(
    (_answer: string, isCorrect: boolean) => {
      if (isCorrect) setCorrect((c) => c + 1);
      else setWrong((w) => w + 1);

      setTimeout(() => {
        if (currentIndex + 1 >= questions.length) {
          setQuizFinished(true);
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 1500);
    },
    [currentIndex, questions.length]
  );

  if (quizFinished) {
    return (
      <div className="container mx-auto px-4 py-6">
        <QuizResults
          correct={correct}
          total={questions.length}
          onRetry={startQuiz}
          onNewQuiz={() => {
            setQuizStarted(false);
            setQuizFinished(false);
          }}
        />
      </div>
    );
  }

  if (quizStarted && questions.length > 0) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <QuizProgress
          current={currentIndex}
          total={questions.length}
          correct={correct}
          wrong={wrong}
        />
        <QuizCard
          key={questions[currentIndex].id}
          question={questions[currentIndex]}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold">Interactive Quiz</h1>
        <p className="text-sm text-muted-foreground">
          Test your vocabulary knowledge from subtitle extractions
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="w-4 h-4 text-primary" />
            Quiz Settings
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Language</Label>
            <Select value={langFilter} onValueChange={(v: any) => v && setLangFilter(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <SelectItem key={code} value={code}>
                    {lang.flag} {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">
              Number of Questions: {Math.min(questionCount, Math.max(1, availableWords.length))}
            </Label>
            <Slider
              value={[questionCount]}
              min={5}
              max={Math.max(5, Math.min(50, availableWords.length))}
              step={5}
              onValueChange={(v: any) => setQuestionCount(Array.isArray(v) ? v[0] : v)}
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {availableWords.length} words available
              </p>
              <p className="text-xs text-muted-foreground">
                Only words with meanings can be quizzed
              </p>
            </div>
          </div>

          <Button
            onClick={startQuiz}
            disabled={availableWords.length < 2}
            className="w-full gap-2"
            size="lg"
          >
            <Play className="w-4 h-4" />
            Start Quiz
          </Button>

          {availableWords.length < 2 && (
            <p className="text-xs text-center text-muted-foreground">
              Add at least 2 words with meanings to your vocabulary to start a quiz.
              Extract words from subtitles in the Local Player.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}