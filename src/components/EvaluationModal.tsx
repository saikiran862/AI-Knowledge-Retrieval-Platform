import React from "react";
import { X, CheckCircle, XCircle, Award, BarChart3 } from "lucide-react";
import { EvaluationSummary } from "../types";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  summary: EvaluationSummary | null;
  onRunEvaluation: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  loading,
  summary,
  onRunEvaluation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Retrieval Evaluation & Benchmark Suite
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              10 benchmark queries measuring Top-1, Top-3, Top-5 accuracy and Out-of-Scope filtering
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {summary ? (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Top-1 Accuracy</span>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {summary.top1_accuracy_pct}%
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Top-3 Accuracy</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {summary.top3_accuracy_pct}%
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Top-5 Accuracy</span>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {summary.top5_accuracy_pct}%
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Out-of-Scope Reject</span>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {summary.out_of_scope_rejection_pct}%
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-200">
                  <span>Query & Domain Breakdown</span>
                  <span>Results (Top-1 / Top-3 / Top-5)</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                  {summary.detailed_results.map((row, idx) => (
                    <div key={idx} className="p-3 text-xs hover:bg-slate-50 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            row.domain === "Education"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : row.domain === "Human Resources"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {row.domain}
                          </span>
                          <span className="font-semibold text-slate-800 truncate">{row.query}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Top score: <span className="font-mono">{row.top1_score.toFixed(3)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                        <span className="flex items-center gap-1" title="Top-1 result">
                          1: {row.top1_result ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        </span>
                        <span className="flex items-center gap-1" title="Top-3 result">
                          3: {row.top3_result ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        </span>
                        <span className="flex items-center gap-1" title="Top-5 result">
                          5: {row.top5_result ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Benchmark Not Yet Executed</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Run the evaluation suite to test Top-1, Top-3, and Top-5 accuracy against the active vector store index.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Results exported to: results/retrieval_results.csv
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
            <button
              onClick={onRunEvaluation}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {loading ? "Running Suite..." : "Execute Benchmark"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
