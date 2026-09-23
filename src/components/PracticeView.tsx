import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Filter,
  GraduationCap,
  Award,
  BookOpen,
} from "lucide-react";
import { PracticeQuestion, AcademicTierId } from "../types";

interface PracticeViewProps {
  onAskTutor: (query: string, tier: string) => void;
  selectedTier?: AcademicTierId;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  onAskTutor,
  selectedTier = "all",
}) => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [tierFilter, setTierFilter] = useState<string>(selectedTier);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<
    Record<string, { correct: boolean; correct_index: number; explanation: string }>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions(tierFilter);
  }, [tierFilter]);

  const fetchQuestions = async (tier: string) => {
    setLoading(true);
    const url = tier === "all" ? "/api/practice-questions" : `/api/practice-questions?tier=${tier}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setQuestions(data);
          }
          setLoading(false);
          return;
        }
      } catch {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        }
      }
    }
    setLoading(false);
  };

  const handleSelectOption = async (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));

    try {
      const res = await fetch("/api/practice-questions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, selected_index: optionIndex }),
      });
      const data = await res.json();
      setResults((prev) => ({ ...prev, [questionId]: data }));
    } catch (err) {
      console.error("Failed to check answer:", err);
    }
  };

  const tierLabels: Record<string, string> = {
    all: "All Curricula",
    btech: "B.Tech Engineering",
    bba: "BBA Business Admin",
    intermediate: "Intermediate (11 & 12)",
    class10: "10th Class Secondary",
  };

  const answeredCount = Object.keys(results).length;
  const correctCount = (Object.values(results) as Array<{ correct: boolean }>).filter(
    (r) => r.correct
  ).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Practice & Viva Exam Simulator</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Curriculum Assessments & Viva Questions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your academic level to test your knowledge with verified board and university questions.
            </p>
          </div>

          {/* Score Counter */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Score & Mastery</div>
              <div className="text-sm font-bold text-slate-900">
                {correctCount} / {answeredCount} Correct
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {answeredCount > 0 ? `${Math.round((correctCount / answeredCount) * 100)}%` : "0%"}
            </div>
          </div>
        </div>

        {/* Tier Filter Buttons */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter Tier:</span>
          </span>
          {["all", "btech", "bba", "intermediate", "class10"].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tierFilter === t
                  ? "bg-blue-600 text-white shadow-2xs font-semibold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {tierLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
          Loading questions...
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            const hasAnswered = selectedAnswers[q.id] !== undefined;
            const result = results[q.id];

            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {qIdx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                      {tierLabels[q.tier] || q.tier}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">• {q.subject}</span>
                  </div>

                  <button
                    onClick={() =>
                      onAskTutor(
                        `Explain this question in detail: "${q.question}" with complete steps, derivation, and concepts`,
                        q.tier
                      )
                    }
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors shrink-0"
                    title="Ask AI Tutor for comprehensive explanation"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain in Depth</span>
                  </button>
                </div>

                <div className="text-sm font-semibold text-slate-900 leading-snug">
                  {q.question}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[q.id] === oIdx;
                    let optionStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";

                    if (hasAnswered && result) {
                      if (oIdx === result.correct_index) {
                        optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500";
                      } else if (isSelected && !result.correct) {
                        optionStyle = "border-rose-400 bg-rose-50 text-rose-800 font-semibold";
                      } else {
                        optionStyle = "border-slate-200 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {hasAnswered && result && oIdx === result.correct_index && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {hasAnswered && result && isSelected && !result.correct && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {result && (
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      result.correct
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      {result.correct ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correct Answer!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Incorrect Selection</span>
                        </>
                      )}
                    </div>
                    <p>{result.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
