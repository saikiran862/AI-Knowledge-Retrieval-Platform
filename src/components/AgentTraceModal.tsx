import React from "react";
import { X, GitBranch, ShieldCheck, Search, Cpu, MessageSquare } from "lucide-react";
import { AgentTraceStep } from "../types";

interface AgentTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryText: string;
  trace: AgentTraceStep[];
}

export const AgentTraceModal: React.FC<AgentTraceModalProps> = ({
  isOpen,
  onClose,
  queryText,
  trace,
}) => {
  if (!isOpen) return null;

  const getAgentIcon = (name: string) => {
    switch (name) {
      case "QueryUnderstandingAgent":
        return <GitBranch className="w-4 h-4 text-blue-600" />;
      case "ClarificationAgent":
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case "RetrievalAgent":
        return <Search className="w-4 h-4 text-indigo-600" />;
      case "ResponseGenerationAgent":
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case "ConversationMemoryAgent":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <GitBranch className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-600" />
              Multi-Agent Orchestration Trace
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
              Query: "{queryText}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trace Steps Timeline */}
        <div className="p-6 overflow-y-auto space-y-4">
          {trace.map((step, idx) => (
            <div key={idx} className="flex gap-4 items-start relative">
              {idx < trace.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
              )}
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                {getAgentIcon(step.agent_name)}
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">{step.agent_name}</span>
                  <span className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">
                    {step.action}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">{step.output_summary}</p>

                {step.details && (
                  <pre className="mt-2 p-2 bg-slate-900 text-slate-100 rounded-md text-[10px] overflow-x-auto font-mono">
                    {JSON.stringify(step.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
