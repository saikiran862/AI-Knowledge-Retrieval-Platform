import React, { useState } from "react";
import {
  Layers,
  Cpu,
  Database,
  GitBranch,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowDown,
  ArrowRight,
  BookOpen,
  Code2,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import { AcademicTierId } from "../types";

export const ArchitectureView: React.FC = () => {
  const [activeTierDetail, setActiveTierDetail] = useState<AcademicTierId>("btech");
  const [selectedLayer, setSelectedLayer] = useState<number>(1);

  const tiers = [
    {
      id: "btech" as AcademicTierId,
      name: "B.Tech Engineering",
      color: "border-blue-300 bg-blue-50/50 text-blue-900",
      accent: "bg-blue-600",
      disciplines: ["Data Structures & Algorithms", "Operating Systems", "DBMS & SQL", "Computer Networks", "Digital Logic", "Engineering Mathematics"],
      pipelineAction: "Synthesizes asymptotic proofs, C++/Java algorithms, schematic logic, and engineering derivations.",
    },
    {
      id: "bba" as AcademicTierId,
      name: "BBA Business Admin",
      color: "border-emerald-300 bg-emerald-50/50 text-emerald-900",
      accent: "bg-emerald-600",
      disciplines: ["Principles of Management", "Marketing 4Ps & STP", "Financial Accounting & Ratios", "Business Law", "HRM", "Managerial Economics"],
      pipelineAction: "Structures strategic managerial frameworks (Fayol, SWOT, Porter), journal entries, and legal case analyses.",
    },
    {
      id: "intermediate" as AcademicTierId,
      name: "Intermediate (11 & 12)",
      color: "border-violet-300 bg-violet-50/50 text-violet-900",
      accent: "bg-violet-600",
      disciplines: ["Calculus & Vectors", "Physics Mechanics & Optics", "Physical & Organic Chemistry", "Botany & Zoology", "Microeconomics"],
      pipelineAction: "Executes rigorous step-by-step mathematical proofs, IUPAC reactions, and thermodynamics derivations.",
    },
    {
      id: "class10" as AcademicTierId,
      name: "10th Class Secondary",
      color: "border-amber-300 bg-amber-50/50 text-amber-900",
      accent: "bg-amber-600",
      disciplines: ["Real Numbers & Polynomials", "Chemical Reactions & Acids", "Electricity & Light Optics", "Life Processes & Genetics", "Social Studies History/Civics"],
      pipelineAction: "Translates foundational board concepts into crisp definitions, ray diagrams, balanced equations, and exam tips.",
    },
  ];

  const layers = [
    {
      num: 1,
      title: "Agent 1: Academic Query Understanding & Tier Disambiguation",
      icon: Cpu,
      color: "blue",
      badge: "Semantic Parser",
      description:
        "Analyzes natural language questions, maps pronouns to conversation turns, detects question intent (procedural, comparative, conceptual), and classifies target academic tier and subject.",
      components: [
        "Pronoun & Contextual Coreference Resolver",
        "Curriculum Keyword & Syllabi Mapping Engine",
        "Ambiguity Detection (Triggers ClarificationAgent if prompt is non-specific)",
        "Out-of-Scope Boundary Enforcer (Rejects non-academic queries)",
      ],
    },
    {
      num: 2,
      title: "Agent 2: FAISS Semantic Vector Retrieval & Syllabus Knowledge Graph",
      icon: Database,
      color: "indigo",
      badge: "Vector Store",
      description:
        "Calculates 384-dimensional cosine similarity embeddings against pre-seeded textbook corpora for B.Tech, BBA, Intermediate, and 10th Class, plus user-uploaded notes.",
      components: [
        "Recursive Text Chunking (350 tokens, 40 overlap)",
        "MiniLM-L6-v2 In-Memory FAISS Vector Index",
        "Tier-Weighted Similarity Scoring (Top-K = 3 to 5)",
        "Document Registry & Metadata Catalog",
      ],
    },
    {
      num: 3,
      title: "Agent 3: Response Generation & Pedagogical Synthesis",
      icon: Sparkles,
      color: "violet",
      badge: "Gemini 3.8 Flash",
      description:
        "Generates structured, step-by-step academic explanations with explicit formulas, code blocks, or business frameworks grounded in curriculum evidence.",
      components: [
        "Gemini 3.8 Flash via @google/genai SDK",
        "Predefined Deterministic Academic Synthesis Fallback (for high-yield topics)",
        "Strict Grounding Guardrails (Eliminates ungrounded hallucinations)",
        "Exam-Oriented Markdown Template (Formulas, Proofs, Viva Tips)",
      ],
    },
    {
      num: 4,
      title: "Agent 4: Verification, Citation & Grounding Auditing",
      icon: ShieldCheck,
      color: "emerald",
      badge: "Quality Assurance",
      description:
        "Validates that every claim is verified by a source document, computes confidence scores, and generates precise page & chunk citations.",
      components: [
        "Exact Source File & Page Number Matching",
        "Cosine Confidence Metric (High / Medium / Low)",
        "Citation Snippet Excerpt Verification",
        "Speech Synthesis Utterance Pipeline",
      ],
    },
    {
      num: 5,
      title: "Agent 5: Student State & Personalization Store",
      icon: Bookmark,
      color: "amber",
      badge: "Auth & Memory",
      description:
        "Manages student profiles, stream tracking, active bookmarks, session history, and multi-tier practice quiz performance.",
      components: [
        "Role-Based Student Profiles (B.Tech, BBA, Inter, 10th)",
        "Bookmark & Revision Vault",
        "Study Streak & Question Analytics",
        "Practice Quiz & Viva Score Assessment",
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-xs font-bold">
                System Architecture
              </span>
              <span className="text-xs text-slate-400 font-mono">v3.0 Multi-Agent Pipeline</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              OmniEdu Multi-Tier Academic Intelligence Architecture
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              A clear, neat, and correct architectural map showing how user queries across{" "}
              <strong>B.Tech</strong>, <strong>BBA</strong>, <strong>Intermediate (11 & 12)</strong>, and{" "}
              <strong>10th Class</strong> are understood, retrieved from vector embeddings, synthesized with
              pedagogical rigor, and verified with source citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xs font-semibold text-slate-500">Curriculum Tiers</div>
              <div className="text-lg font-bold text-slate-900">4 Supported</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xs font-semibold text-slate-500">Agents in Chain</div>
              <div className="text-lg font-bold text-blue-600">5 Pipeline Agents</div>
            </div>
          </div>
        </div>

        {/* 4 Academic Tiers Selector */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Academic Knowledge Bases & Supported Curricula:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tiers.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTierDetail(t.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  activeTierDetail === t.id
                    ? `${t.color} ring-2 ring-blue-500 shadow-xs`
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${t.accent}`} />
                  <span className="font-bold text-sm">{t.name}</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600 mb-3">
                  {t.disciplines.slice(0, 3).map((d, idx) => (
                    <div key={idx} className="truncate">• {d}</div>
                  ))}
                  <div className="text-[10px] text-slate-400 italic">+{t.disciplines.length - 3} more subjects</div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug pt-2 border-t border-slate-200/60">
                  {t.pipelineAction}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Visual Pipeline Flow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>End-to-End Multi-Agent Resolution Pipeline</span>
          </h3>
          <span className="text-xs text-slate-500">Click any layer below to inspect modules</span>
        </div>

        <div className="space-y-3">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer === layer.num;
            return (
              <div
                key={layer.num}
                onClick={() => setSelectedLayer(layer.num)}
                className={`cursor-pointer rounded-2xl border transition-all p-5 ${
                  isSelected
                    ? "bg-white border-blue-500 ring-2 ring-blue-100 shadow-md"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      L{layer.num}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{layer.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {layer.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{layer.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 shrink-0">
                    <span>{isSelected ? "Active Layer" : "Click to expand"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {layer.components.map((comp, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">{comp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Architectural Principles & Technical Safeguards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3">
            <GitBranch className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 mb-1">Contextual Disambiguation</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            When a student enters ambiguous phrases like "What is the policy?" or "Explain the theorem", the
            ClarificationAgent branches immediately to offer structured educational choices before querying the vector store.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 mb-1">Strict Grounding & Citations</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every response includes verified document citations with similarity match percentages, source file
            names, page numbers, and exact excerpts to eliminate hallucination.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center font-bold mb-3">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 mb-1">Four-Tier Curriculum Scope</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Comprehensive curriculum trees covering B.Tech (Engineering), BBA (Business), Intermediate (11 & 12
            MPC/BiPC/MEC), and 10th Class (Board Secondary) with formulas and viva tips.
          </p>
        </div>
      </div>
    </div>
  );
};
