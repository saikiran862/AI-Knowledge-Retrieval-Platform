import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  ChevronRight,
  Sparkles,
  Search,
  Code2,
  Atom,
  Briefcase,
  Layers,
  ArrowRight,
} from "lucide-react";
import { CurriculumTier, AcademicTierId } from "../types";

interface CurriculumViewProps {
  onAskQuestion: (query: string, tier: string) => void;
  selectedTier?: AcademicTierId;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  onAskQuestion,
  selectedTier = "all",
}) => {
  const [curriculum, setCurriculum] = useState<CurriculumTier[]>([]);
  const [activeTierId, setActiveTierId] = useState<string>(
    selectedTier === "all" ? "btech" : selectedTier
  );
  const [activeSubjectIdx, setActiveSubjectIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadCurriculum = async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch("/api/curriculum");
          if (res.ok) {
            const data = await res.json();
            if (active && Array.isArray(data) && data.length > 0) {
              setCurriculum(data);
              setLoading(false);
              return;
            }
          }
        } catch {
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          }
        }
      }
      if (active) setLoading(false);
    };

    loadCurriculum();
    return () => {
      active = false;
    };
  }, []);

  const getTierIcon = (id: string) => {
    switch (id) {
      case "btech":
        return <Code2 className="w-4 h-4" />;
      case "bba":
        return <Briefcase className="w-4 h-4" />;
      case "intermediate":
        return <Atom className="w-4 h-4" />;
      case "class10":
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span>Loading academic curricula...</span>
        </div>
      </div>
    );
  }

  const activeTier = curriculum.find((t) => t.id === activeTierId) || curriculum[0];
  const activeSubject = activeTier?.subjects?.[activeSubjectIdx] || activeTier?.subjects?.[0];

  const filteredTopics = (activeSubject?.topics || []).filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-xs font-bold flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Curriculum & Syllabus Explorer</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Standard Academic Syllabi & Knowledge Graph
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any academic tier and subject below. Click "Ask AI Tutor" on any topic to generate
              rigorous proofs, code implementations, and exam notes.
            </p>
          </div>

          {/* Search topic input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, laws, formulas..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Tier Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-6 border-t border-slate-100">
          {curriculum.map((tier) => {
            const isActive = tier.id === activeTierId;
            return (
              <button
                key={tier.id}
                onClick={() => {
                  setActiveTierId(tier.id);
                  setActiveSubjectIdx(0);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  isActive
                    ? "border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600 font-bold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {getTierIcon(tier.id)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate">{tier.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{tier.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split: Subjects on left, Topics & details on right */}
      {activeTier && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Subjects column */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Subjects in {activeTier.name} ({activeTier.subjects?.length || 0})
            </div>
            <div className="space-y-1.5">
              {(activeTier.subjects || []).map((sub, idx) => {
                const isSelected = idx === activeSubjectIdx;
                return (
                  <button
                    key={sub.code}
                    onClick={() => setActiveSubjectIdx(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-white border-blue-600 shadow-xs ring-1 ring-blue-600 text-slate-900"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mr-1.5">
                        {sub.code}
                      </span>
                      <span className="text-xs font-semibold">{sub.name}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {sub.topics?.length || 0} key curriculum topics
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-300"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topics column */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Core Units & High-Yield Topics: {activeSubject?.name}
              </div>
              <span className="text-xs text-slate-500">
                {filteredTopics?.length} topics found
              </span>
            </div>

            <div className="space-y-3">
              {filteredTopics && filteredTopics.length > 0 ? (
                filteredTopics.map((topic, tIdx) => (
                  <div
                    key={tIdx}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{topic.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          onAskQuestion(
                            `Explain ${topic.title} in detail with equations, derivations, and exam notes`,
                            activeTier.id
                          )
                        }
                        className="self-start px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ask AI Tutor</span>
                      </button>
                    </div>

                    {/* Key formulas / concepts if available */}
                    {topic.keyFormulas && topic.keyFormulas.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          High-Yield Formulas & Complexities:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {topic.keyFormulas.map((f, fIdx) => (
                            <span
                              key={fIdx}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono font-medium text-slate-800"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {topic.keyConcepts && topic.keyConcepts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {topic.keyConcepts.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-medium"
                          >
                            • {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
                  No topics matching "{searchQuery}". Try a different keyword.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
