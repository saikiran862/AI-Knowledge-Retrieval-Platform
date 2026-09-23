import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, SlidersHorizontal, Trash2, GraduationCap } from "lucide-react";
import { AcademicTierId } from "../types";

interface QueryInputProps {
  onSend: (text: string, topK: number, threshold: number, tier: AcademicTierId) => void;
  onClear: () => void;
  loading: boolean;
  activeTier: AcademicTierId;
  onSelectTier: (tier: AcademicTierId) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const QueryInput: React.FC<QueryInputProps> = ({
  onSend,
  onClear,
  loading,
  activeTier,
  onSelectTier,
  inputRef,
}) => {
  const [text, setText] = useState("");
  const [topK, setTopK] = useState(3);
  const [threshold, setThreshold] = useState(0.35);
  const [showFilters, setShowFilters] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");

  const internalInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceNotice("Listening to academic query... Speak clearly.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || "";
        if (transcript) {
          setText(transcript);
          setVoiceNotice(`Recognized: "${transcript}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
        setVoiceNotice(`Voice input error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setTimeout(() => setVoiceNotice(""), 3500);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSend(text.trim(), topK, threshold, activeTier);
    setText("");
  };

  const getPlaceholder = () => {
    switch (activeTier) {
      case "btech":
        return "Ask B.Tech question: Dijkstra's algorithm, Deadlock conditions, SQL normalization, Maxwell's equations...";
      case "bba":
        return "Ask BBA question: Fayol's 14 principles, Marketing 4Ps, SWOT analysis, Balance sheet ratios...";
      case "intermediate":
        return "Ask Intermediate question: Carnot cycle derivation, Snell's law, IUPAC rules, Quadratic roots...";
      case "class10":
        return "Ask 10th Class question: Ohm's law, Photosynthesis, Quadratic formula, French Revolution...";
      default:
        return "Ask any question from B.Tech, BBA, Intermediate (11 & 12), or 10th Class...";
    }
  };

  const tiers: Array<{ id: AcademicTierId; label: string }> = [
    { id: "all", label: "All Curricula" },
    { id: "btech", label: "B.Tech" },
    { id: "bba", label: "BBA" },
    { id: "intermediate", label: "Intermediate" },
    { id: "class10", label: "10th Class" },
  ];

  return (
    <div className="bg-white border-t border-slate-200 p-3 md:p-4 shrink-0 space-y-2">
      {/* Tier Selector Bar + Config Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mr-1">
            <GraduationCap className="w-3 h-3 text-blue-600" />
            <span>Academic Tier:</span>
          </span>
          {tiers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTier(t.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTier === t.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 hover:text-slate-800 text-[11px] font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>RAG Config (Top-{topK})</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
            title="Reset conversation"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Expanded RAG config */}
      {showFilters && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Top-K Chunks:</label>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs outline-none"
            >
              <option value={1}>Top-1 Chunk</option>
              <option value={3}>Top-3 Chunks (Default)</option>
              <option value={5}>Top-5 Chunks</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Cosine Threshold:</label>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24 accent-blue-600"
            />
            <span className="font-mono text-slate-600">{threshold.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Voice Status Alert */}
      {voiceNotice && (
        <div className="text-[11px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
          <span>{voiceNotice}</span>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef || internalInputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs focus:ring-2 focus:ring-blue-100"
            disabled={loading}
          />

          <button
            type="button"
            onClick={toggleRecording}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              isRecording
                ? "bg-rose-100 text-rose-600 animate-pulse"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
            title="Speech recognition (Web Speech API)"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
