import React, { useState } from "react";
import {
  Bot,
  User,
  Volume2,
  GitBranch,
  FileCheck,
  HelpCircle,
  Sparkles,
  Bookmark,
  Check,
  GraduationCap,
  Copy,
} from "lucide-react";
import { ChatMessage, AgentTraceStep, AcademicTierId } from "../types";

interface ChatPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  activeTier: AcademicTierId;
  onSelectClarification: (option: string) => void;
  onOpenTrace: (query: string, trace: AgentTraceStep[]) => void;
  onSelectSampleQuery: (query: string, tier?: AcademicTierId) => void;
  onBookmarkAnswer?: (query: string, answer: string, tier: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  loading,
  activeTier,
  onSelectClarification,
  onOpenTrace,
  onSelectSampleQuery,
  onBookmarkAnswer,
}) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech Synthesis is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`•]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const copyAnswer = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBookmark = (msg: ChatMessage) => {
    if (onBookmarkAnswer) {
      const tier = msg.academic_classification?.tier || "academic";
      onBookmarkAnswer(msg.text.slice(0, 80), msg.text.slice(0, 160), tier);
      setBookmarkedIds((prev) => ({ ...prev, [msg.id]: true }));
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case "High confidence":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium confidence":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low confidence":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const sampleAcademicQueries = [
    {
      tier: "btech" as AcademicTierId,
      label: "B.Tech Engineering",
      query: "Explain Dijkstra's shortest path algorithm with time complexity and C++ implementation",
      color: "border-blue-200 bg-blue-50/40 text-blue-900",
    },
    {
      tier: "bba" as AcademicTierId,
      label: "BBA Business Admin",
      query: "Explain Henri Fayol's 14 Principles of Management with practical business examples",
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-900",
    },
    {
      tier: "intermediate" as AcademicTierId,
      label: "Intermediate (11 & 12)",
      query: "Derive efficiency of Carnot heat engine and explain the Carnot cycle stages",
      color: "border-violet-200 bg-violet-50/40 text-violet-900",
    },
    {
      tier: "class10" as AcademicTierId,
      label: "10th Class Secondary",
      query: "State Ohm's Law and calculate equivalent resistance for parallel and series resistors",
      color: "border-amber-200 bg-amber-50/40 text-amber-900",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {/* Welcome Card if no conversation yet */}
      {messages.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              OmniEdu AI Academic Tutor Workspace
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Ask any question across <strong>B.Tech Engineering</strong>, <strong>BBA</strong>,{" "}
            <strong>Intermediate (11 & 12)</strong>, and <strong>10th Class</strong>.
            All responses are synthesized with mathematical proofs, equations, diagrams, code blocks, and
            curriculum textbook citations.
          </p>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              High-Yield Academic Queries by Curriculum:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleAcademicQueries.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSampleQuery(sample.query, sample.tier)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col justify-between group hover:shadow-2xs ${sample.color}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider opacity-70">
                      {sample.label}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="font-medium text-slate-800">"{sample.query}"</span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectSampleQuery("What is the policy?")}
                className="w-full text-left p-2.5 bg-white hover:bg-amber-50/60 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>"What is the policy?" (Tests Clarification Agent & Disambiguation)</span>
                </div>
                <span className="text-[10px] text-slate-400">Triggers Disambiguation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.sender === "assistant" && (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
          )}

          <div
            className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
              msg.sender === "user"
                ? "bg-blue-600 text-white rounded-tr-xs"
                : "bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-xs"
            }`}
          >
            {/* Header info for assistant */}
            {msg.sender === "assistant" && (
              <div className="flex flex-wrap items-center justify-between mb-2 pb-2 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>OmniEdu Academic Tutor</span>
                  {msg.academic_classification && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                      {msg.academic_classification.tier_name} • {msg.academic_classification.subject}
                    </span>
                  )}
                </div>
                {msg.confidence && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getConfidenceBadge(
                      msg.confidence
                    )}`}
                  >
                    {msg.confidence}
                  </span>
                )}
              </div>
            )}

            {/* Answer Content with Code & Formula support */}
            <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed select-text">
              {msg.text}
            </div>

            {/* Clarification Options pills */}
            {msg.needs_clarification && msg.clarification_options && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">
                  Select a topic to disambiguate:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {msg.clarification_options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => onSelectClarification(opt)}
                      className="text-[11px] px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition-colors font-medium text-left"
                    >
                      • {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Citations Box */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Curriculum Sources & Citations ({msg.citations.length})</span>
                </div>

                <div className="space-y-1.5">
                  {msg.citations.map((cite, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-white border border-slate-200 rounded-lg p-2 text-[11px] flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="truncate">
                          #{cIdx + 1} {cite.document_name}
                        </span>
                        <span className="text-blue-600 font-mono text-[10px] shrink-0 ml-2">
                          Similarity: {(cite.similarity_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      {cite.page_number && (
                        <span className="text-[10px] text-slate-400">
                          Unit/Page: {cite.page_number} • Chunk: {cite.chunk_id}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1 rounded mt-1 border border-slate-100">
                        "{cite.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions: Speech TTS + Copy + Bookmark + Agent Trace */}
            {msg.sender === "assistant" && (
              <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100 text-[11px] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => speakText(msg.text)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Speak answer using Web Speech API"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read aloud</span>
                  </button>

                  <button
                    onClick={() => copyAnswer(msg.id, msg.text)}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Copy full answer text"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onBookmarkAnswer && (
                    <button
                      onClick={() => handleBookmark(msg)}
                      className={`flex items-center gap-1 transition-colors ${
                        bookmarkedIds[msg.id]
                          ? "text-emerald-600 font-semibold"
                          : "text-slate-500 hover:text-blue-600"
                      }`}
                      title="Bookmark answer into your Student Profile"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{bookmarkedIds[msg.id] ? "Saved" : "Save Bookmark"}</span>
                    </button>
                  )}
                </div>

                {msg.agent_trace && msg.agent_trace.length > 0 && (
                  <button
                    onClick={() => onOpenTrace(msg.text, msg.agent_trace!)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Inspect 5-Agent Trace</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {msg.sender === "user" && (
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex gap-3 justify-start items-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>OmniEdu Multi-Agent Academic Pipeline Synthesizing...</span>
          </div>
        </div>
      )}
    </div>
  );
};
