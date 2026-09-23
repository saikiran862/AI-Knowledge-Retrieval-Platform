import React, { useState, useEffect, useRef } from "react";
import { Header, NavPage } from "./components/Header";
import { DocumentManager } from "./components/DocumentManager";
import { ChatPanel } from "./components/ChatPanel";
import { QueryInput } from "./components/QueryInput";
import { AgentTraceModal } from "./components/AgentTraceModal";
import { EvaluationModal } from "./components/EvaluationModal";
import { AuthModal } from "./components/AuthModal";
import { UserProfileModal } from "./components/UserProfileModal";
import { ArchitectureView } from "./components/ArchitectureView";
import { CurriculumView } from "./components/CurriculumView";
import { PracticeView } from "./components/PracticeView";
import {
  DocumentItem,
  ChatMessage,
  VectorStoreStatus,
  EvaluationSummary,
  AgentTraceStep,
  StudentUser,
  AcademicTierId,
} from "./types";

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  { document_id: "DOC_CLASS10_CURRICULUM_TXT", file_name: "class10_curriculum.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 3, status: "processed", file_size_bytes: 5532 },
  { document_id: "DOC_INTERMEDIATE_CURRICULUM_TXT", file_name: "intermediate_curriculum.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 3, status: "processed", file_size_bytes: 5778 },
  { document_id: "DOC_BTECH_CURRICULUM_TXT", file_name: "btech_curriculum.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 3, status: "processed", file_size_bytes: 7532 },
  { document_id: "DOC_BBA_CURRICULUM_TXT", file_name: "bba_curriculum.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 3, status: "processed", file_size_bytes: 5879 },
  { document_id: "DOC_ATTENDANCE_POLICY_TXT", file_name: "attendance_policy.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 1, status: "processed", file_size_bytes: 1744 },
  { document_id: "DOC_EXAMINATION_RULES_TXT", file_name: "examination_rules.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 1, status: "processed", file_size_bytes: 1630 },
  { document_id: "DOC_REVALUATION_PROCESS_TXT", file_name: "revaluation_process.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 1, status: "processed", file_size_bytes: 1577 },
  { document_id: "DOC_STUDENT_SERVICES_TXT", file_name: "student_services.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 1, status: "processed", file_size_bytes: 1416 },
  { document_id: "DOC_EMPLOYEE_HANDBOOK_TXT", file_name: "employee_handbook.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 1, status: "processed", file_size_bytes: 1536 },
  { document_id: "DOC_LEAVE_POLICY_TXT", file_name: "leave_policy.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 1, status: "processed", file_size_bytes: 1843 },
  { document_id: "DOC_WORK_FROM_HOME_POLICY_TXT", file_name: "work_from_home_policy.txt", file_type: "txt", upload_date: new Date().toISOString(), total_chunks: 1, status: "processed", file_size_bytes: 1495 },
  { document_id: "DOC_EMPLOYEE_BENEFITS_CSV", file_name: "employee_benefits.csv", file_type: "csv", upload_date: new Date().toISOString(), total_chunks: 1, status: "processed", file_size_bytes: 1210 },
];

const DEFAULT_STATUS: VectorStoreStatus = {
  total_chunks: 20,
  total_documents: 12,
  embedding_model: "all-MiniLM-L6-v2",
  embedding_dimension: 384,
  index_type: "FAISS IndexFlatIP (Cosine Similarity)",
  index_file_exists: true,
  status: "active",
};

export default function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>(DEFAULT_DOCUMENTS);
  const [status, setStatus] = useState<VectorStoreStatus | null>(DEFAULT_STATUS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => "sess_" + Math.random().toString(36).substring(2, 9));

  // Navigation & Student Auth state
  const [activePage, setActivePage] = useState<NavPage>("tutor");
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [activeTier, setActiveTier] = useState<AcademicTierId>("all");

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [traceModalOpen, setTraceModalOpen] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<{ query: string; steps: AgentTraceStep[] }>({
    query: "",
    steps: [],
  });
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalSummary, setEvalSummary] = useState<EvaluationSummary | null>(null);

  const queryInputRef = useRef<HTMLInputElement>(null);

  // Initial data loading with resilient retry
  useEffect(() => {
    fetchDocuments();
    fetchStatus();

    // Auto-login with default demo B.Tech student for quick preview
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "btech.student@omni.edu", password: "pass123" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setActiveTier(data.user.tier);
        }
      })
      .catch(() => {});
  }, []);

  const fetchDocuments = async (retries = 3) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDocuments(data);
          }
          return;
        }
      } catch {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        }
      }
    }
  };

  const fetchStatus = async (retries = 3) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch("/api/vector-store/status");
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === "object") {
            setStatus(data);
          }
          return;
        }
      } catch {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        }
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Purge this document and its chunk embeddings from the FAISS vector index?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDocuments();
        fetchStatus();
      }
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset and re-index all baseline Education, HR, and Academic Curriculum documents?")) return;
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        fetchDocuments();
        fetchStatus();
        setMessages([]);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  const handleSendQuery = async (
    queryText: string,
    topK = 3,
    threshold = 0.35,
    overrideTier?: AcademicTierId
  ) => {
    if (!queryText.trim() || loading) return;

    const tierToUse = overrideTier || activeTier;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text: queryText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query_text: queryText,
          session_id: sessionId,
          top_k: topK,
          threshold,
          tier: tierToUse === "all" ? undefined : tierToUse,
          user_id: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Query failed");

      const assistantMsg: ChatMessage = {
        id: data.query_id || "a_" + Date.now(),
        sender: "assistant",
        text: data.answer,
        confidence: data.confidence,
        raw_confidence_score: data.raw_confidence_score,
        citations: data.sources || [],
        needs_clarification: data.needs_clarification,
        clarification_options: data.clarification_options || [],
        agent_trace: data.agent_trace || [],
        timestamp: new Date().toISOString(),
        academic_classification: data.academic_classification,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (currentUser) {
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                stats: {
                  ...prev.stats,
                  questionsAsked: prev.stats.questionsAsked + 1,
                },
              }
            : null
        );
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: "err_" + Date.now(),
        sender: "assistant",
        text: `Error resolving academic query: ${err.message}`,
        confidence: "Low confidence",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkAnswer = async (query: string, answer: string, tier: string) => {
    if (!currentUser) {
      setAuthMode("login");
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/auth/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          query,
          answer_excerpt: answer.slice(0, 160),
          tier,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Bookmark failed:", err);
    }
  };

  const handleAskFromSubpage = (query: string, tier?: string) => {
    setActivePage("tutor");
    if (tier && ["btech", "bba", "intermediate", "class10"].includes(tier)) {
      setActiveTier(tier as AcademicTierId);
    }
    setTimeout(() => {
      handleSendQuery(query, 3, 0.35, tier as AcademicTierId);
    }, 50);
  };

  const handleRunEvaluation = async () => {
    setEvalLoading(true);
    try {
      const res = await fetch("/api/evaluate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEvalSummary(data.summary);
      } else {
        alert(`Evaluation error: ${data.detail || "Failed"}`);
      }
    } catch (err: any) {
      alert(`Evaluation error: ${err.message}`);
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Universal Header with Multi-Page Navigation and Auth */}
      <Header
        status={status}
        activePage={activePage}
        onNavigate={setActivePage}
        currentUser={currentUser}
        onOpenAuth={(mode = "login") => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenEval={() => {
          setEvalModalOpen(true);
          if (!evalSummary) handleRunEvaluation();
        }}
        onRefresh={() => {
          fetchDocuments();
          fetchStatus();
        }}
      />

      {/* Dynamic View Router */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page 1: AI Tutor Workspace */}
        {activePage === "tutor" && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 md:p-4 gap-3 md:gap-4 max-w-7xl w-full mx-auto">
            {/* Left Sidebar: Document Management & Curriculum Reference */}
            <aside className="w-full md:w-[360px] flex flex-col shrink-0 overflow-y-auto max-h-[35vh] md:max-h-full">
              <DocumentManager
                documents={documents}
                onUploadSuccess={() => {
                  fetchDocuments();
                  fetchStatus();
                }}
                onDeleteDocument={handleDeleteDocument}
              />
            </aside>

            {/* Right Main Panel: Interactive Academic Query Interface */}
            <main className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden min-h-0">
              <ChatPanel
                messages={messages}
                loading={loading}
                activeTier={activeTier}
                onSelectClarification={(opt) => handleSendQuery(opt)}
                onOpenTrace={(query, trace) => {
                  setSelectedTrace({ query, steps: trace });
                  setTraceModalOpen(true);
                }}
                onSelectSampleQuery={(q, tier) => {
                  if (tier) setActiveTier(tier);
                  handleSendQuery(q, 3, 0.35, tier);
                }}
                onBookmarkAnswer={handleBookmarkAnswer}
              />

              <QueryInput
                onSend={handleSendQuery}
                onClear={() => setMessages([])}
                loading={loading}
                activeTier={activeTier}
                onSelectTier={setActiveTier}
                inputRef={queryInputRef}
              />
            </main>
          </div>
        )}

        {/* Page 2: Curriculum Explorer */}
        {activePage === "curriculum" && (
          <CurriculumView
            onAskQuestion={handleAskFromSubpage}
            selectedTier={activeTier}
          />
        )}

        {/* Page 3: Practice & Viva Exam Simulator */}
        {activePage === "practice" && (
          <PracticeView
            onAskTutor={handleAskFromSubpage}
            selectedTier={activeTier}
          />
        )}

        {/* Page 4: System Architecture & Multi-Agent Flow */}
        {activePage === "architecture" && <ArchitectureView />}

        {/* Page 5: Knowledge Vault & Document Management */}
        {activePage === "knowledge" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Academic Knowledge Base & Vector Store
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload textbooks, syllabi, and study notes in PDF, TXT, CSV, or MD formats to expand
                  curriculum retrieval.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              >
                Reset All Curricula
              </button>
            </div>

            <DocumentManager
              documents={documents}
              onUploadSuccess={() => {
                fetchDocuments();
                fetchStatus();
              }}
              onDeleteDocument={handleDeleteDocument}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActiveTier(user.tier);
        }}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={currentUser}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            setActiveTier(updated.tier);
          }}
          onLogout={() => {
            setCurrentUser(null);
            setActiveTier("all");
          }}
          onSelectBookmark={(query) => {
            handleAskFromSubpage(query);
          }}
        />
      )}

      <AgentTraceModal
        isOpen={traceModalOpen}
        onClose={() => setTraceModalOpen(false)}
        queryText={selectedTrace.query}
        trace={selectedTrace.steps}
      />

      <EvaluationModal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        loading={evalLoading}
        summary={evalSummary}
        onRunEvaluation={handleRunEvaluation}
      />
    </div>
  );
}
