"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  fetchTrackSequenceForModule,
  getNextStep,
  getPreviousStep,
  getItemUrl,
  getItemLabel,
  SequenceItem,
} from "@/lib/progress/courseSequence";

interface QuizOption {
  id: string;
  option_text: string;
}
interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}
interface QuizData {
  quizId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}
interface QuizResult {
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  passingScore: number;
}

export default function QuizPage() {
  const params = useParams<{ moduleId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [trackSequence, setTrackSequence] = useState<SequenceItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/quiz/by-module/${params.moduleId}`);
        if (res.ok) {
          const q = await res.json();
          setQuiz(q);
        }

        const seqRes = await fetchTrackSequenceForModule(supabaseBrowser, params.moduleId);
        if (seqRes) {
          setTrackSequence(seqRes.sequence);
        }
      } catch (err) {
        console.error("Failed to load quiz or sequence:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.moduleId]);

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (!quiz) return;
    setSubmitting(true);
    setError("");

    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("You need to be signed in.");
      setSubmitting(false);
      return;
    }

    const payload = {
      quizId: quiz.quizId,
      answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })),
    };

    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Failed to submit quiz.");
      setSubmitting(false);
      return;
    }

    setResult(await res.json());
    setSubmitting(false);
  }

  const currentQuizId = quiz?.quizId || "";
  const nextStep = trackSequence.length > 0 && currentQuizId ? getNextStep(trackSequence, currentQuizId) : null;
  const prevStep = trackSequence.length > 0 && currentQuizId ? getPreviousStep(trackSequence, currentQuizId) : null;

  function handleGoNext() {
    if (nextStep === "track_finished") {
      router.push("/dashboard/certification");
    } else if (nextStep && typeof nextStep === "object") {
      router.push(getItemUrl(nextStep));
    } else {
      router.push("/dashboard/assessments");
    }
  }

  function handleGoPrev() {
    if (prevStep && prevStep !== "start_of_track") {
      router.push(getItemUrl(prevStep));
    }
  }

  if (loading) {
    return <p className="px-6 py-12 text-ink-muted">Loading quiz…</p>;
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-content px-6 py-12">
        <p className="text-ink-muted">No quiz found for this module.</p>
        <Link href="/dashboard/assessments" className="mt-2 inline-block text-sm text-accent-hover underline">
          Back to Assessments
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-content px-6 py-16 text-center">
        <h1 className="font-display text-2xl text-ink">
          {result.passed ? "You passed! 🎉" : "Not quite — try again"}
        </h1>
        <p className="mt-3 text-ink-soft">
          You scored <strong className={result.passed ? "text-accent font-semibold" : "text-amber-600 font-semibold"}>{result.score}%</strong> ({result.correctCount} of {result.totalCount} correct).
          The passing score is {result.passingScore}%.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {result.passed ? (
            <>
              {nextStep ? (
                <button
                  type="button"
                  onClick={handleGoNext}
                  className="rounded bg-accent px-6 py-2.5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover transition-colors"
                >
                  {nextStep === "track_finished" ? "Finish Track 🎉" : `${getItemLabel(nextStep)} →`}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentIndex(0);
                }}
                className="rounded border border-border px-5 py-2.5 text-sm font-medium text-ink-soft hover:border-accent"
              >
                Retake quiz
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/assessments")}
                className="rounded border border-border px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper-raised"
              >
                Back to Assessments
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentIndex(0);
                }}
                className="rounded bg-accent px-6 py-2.5 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
              >
                Try again
              </button>
              {prevStep && prevStep !== "start_of_track" && (
                <button
                  type="button"
                  onClick={handleGoPrev}
                  className="rounded border border-border px-5 py-2.5 text-sm font-medium text-ink-soft hover:border-accent"
                >
                  Review {prevStep.title || "previous lesson"}
                </button>
              )}
              {nextStep && (
                <button
                  type="button"
                  onClick={handleGoNext}
                  className="rounded border border-border px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper-raised"
                >
                  Continue anyway →
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/dashboard/assessments")}
                className="rounded border border-border px-4 py-2.5 text-sm font-medium text-ink-muted hover:text-ink"
              >
                Back to Assessments
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;
  const hasAnswered = !!answers[question.id];

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>
          Question {currentIndex + 1} of {quiz.questions.length}
        </span>
        {prevStep && prevStep !== "start_of_track" && (
          <button
            type="button"
            onClick={handleGoPrev}
            className="text-xs text-ink-soft hover:underline"
          >
            ← Back to lesson
          </button>
        )}
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <h1 className="mt-6 font-display text-xl text-ink">{question.question}</h1>

      <div className="mt-6 flex flex-col gap-3">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className={`flex items-center gap-3 rounded border px-4 py-3 text-sm text-ink cursor-pointer transition-colors ${
              answers[question.id] === opt.id ? "border-accent bg-accent-tint font-medium" : "border-border hover:bg-paper-raised"
            }`}
          >
            <input
              type="radio"
              name={question.id}
              checked={answers[question.id] === opt.id}
              onChange={() => selectAnswer(question.id, opt.id)}
            />
            {opt.option_text}
          </label>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="rounded border border-border px-5 py-2 text-sm font-medium text-ink-soft disabled:opacity-40"
        >
          Back
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAnswered || submitting}
            className="rounded bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit quiz"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!hasAnswered}
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="rounded bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
