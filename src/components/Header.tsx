import React from "react";
import {
  GraduationCap,
  Layers,
  Database,
  Award,
  BookOpen,
  Activity,
  User,
  LogIn,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { VectorStoreStatus, StudentUser } from "../types";

export type NavPage = "tutor" | "curriculum" | "practice" | "architecture" | "knowledge";

interface HeaderProps {
  status: VectorStoreStatus | null;
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  currentUser: StudentUser | null;
  onOpenAuth: (mode?: "login" | "register") => void;
  onOpenProfile: () => void;
  onOpenEval: () => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activePage,
  onNavigate,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenEval,
  onRefresh,
}) => {
  const navItems: Array<{ id: NavPage; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: "tutor", label: "AI Tutor Workspace", icon: Sparkles },
    { id: "curriculum", label: "Curriculum Explorer", icon: BookOpen },
    { id: "practice", label: "Practice & Viva", icon: Award },
    { id: "architecture", label: "System Architecture", icon: Layers },
    { id: "knowledge", label: "Knowledge Vault", icon: Database },
  ];

  return (
    <header
      id="main-header"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs"
    >
      {/* Top Banner Bar */}
      <div className="px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                OmniEdu AI
              </h1>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Multi-Tier Academic Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Complete Curriculum AI Resolution for B.Tech • BBA • Intermediate (11 & 12) • 10th Class
            </p>
          </div>
        </div>

        {/* Right utility elements */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Vector store status */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs text-slate-600">
            <span
              className={`w-2 h-2 rounded-full ${
                status && status.total_chunks > 0 ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">
              {status ? `${status.total_chunks} Chunks (${status.total_documents} Docs)` : "Connecting..."}
            </span>
          </div>

          <button
            id="btn-eval-benchmark"
            onClick={onOpenEval}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors"
            title="Benchmark Evaluation Accuracy"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Benchmark</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh vector status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Student Auth status */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
            >
              <div
                className={`w-6 h-6 rounded-lg text-white font-bold text-xs flex items-center justify-center ${
                  currentUser.avatarColor || "bg-blue-600"
                }`}
              >
                {(currentUser.name || "U").charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-[11px] leading-tight line-clamp-1">
                  {currentUser.name}
                </div>
                <div className="text-[9px] text-slate-500 leading-none uppercase font-semibold">
                  {currentUser.tier}
                </div>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth("login")}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Web Pages Bar */}
      <div className="px-4 md:px-6 flex items-center gap-1 overflow-x-auto bg-slate-50/70 border-b border-slate-200/60 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`py-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
