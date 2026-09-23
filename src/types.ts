/**
 * Shared TypeScript types for Knowledge Retrieval Platform
 */

export type AcademicTierId = "all" | "btech" | "bba" | "intermediate" | "class10";

export interface StudentBookmark {
  id: string;
  query: string;
  answerExcerpt: string;
  tier: string;
  savedAt: string;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  tier: AcademicTierId;
  tierLabel: string;
  stream: string;
  institution: string;
  avatarColor: string;
  createdAt: string;
  bookmarks: StudentBookmark[];
  stats: {
    questionsAsked: number;
    quizzesCompleted: number;
    studyStreakDays: number;
  };
}

export interface CurriculumTopic {
  title: string;
  description: string;
  keyFormulas?: string[];
  keyConcepts?: string[];
}

export interface CurriculumSubject {
  name: string;
  code: string;
  topics: CurriculumTopic[];
}

export interface CurriculumTier {
  id: string;
  name: string;
  tagline: string;
  color: string;
  subjects: CurriculumSubject[];
}

export interface PracticeQuestion {
  id: string;
  tier: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
  difficulty?: string;
}

export interface DocumentItem {
  document_id: string;
  file_name: string;
  file_type: string;
  upload_date: string;
  total_chunks: number;
  status: string;
  file_size_bytes: number;
}

export interface Citation {
  document_name: string;
  page_number?: number;
  chunk_id: string;
  similarity_score: number;
  excerpt: string;
}

export interface AgentTraceStep {
  agent_name: string;
  action: string;
  output_summary: string;
  details?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  confidence?: "High confidence" | "Medium confidence" | "Low confidence";
  raw_confidence_score?: number;
  citations?: Citation[];
  needs_clarification?: boolean;
  clarification_options?: string[];
  agent_trace?: AgentTraceStep[];
  timestamp: string;
  academic_classification?: {
    tier: string;
    tier_name: string;
    subject: string;
    topic: string;
  };
}

export interface VectorStoreStatus {
  total_chunks: number;
  total_documents: number;
  embedding_model: string;
  embedding_dimension: number;
  index_type: string;
  status: string;
  index_file_exists?: boolean;
}

export interface EvaluationSummary {
  total_queries: number;
  in_scope_queries: number;
  out_of_scope_queries: number;
  top1_accuracy_pct: number;
  top3_accuracy_pct: number;
  top5_accuracy_pct: number;
  out_of_scope_rejection_pct: number;
  detailed_results: Array<{
    query: string;
    domain: string;
    expected: string;
    top1_score: number;
    top3_best: number;
    top5_best: number;
    top1_result: boolean;
    top3_result: boolean;
    top5_result: boolean;
  }>;
}
