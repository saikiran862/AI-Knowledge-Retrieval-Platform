import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileBox,
} from "lucide-react";
import { DocumentItem } from "../types";

interface DocumentManagerProps {
  documents: DocumentItem[];
  onUploadSuccess: () => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onUploadSuccess,
  onDeleteDocument,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setFeedback(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      const uploadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const rawContent = reader.result as string;
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: file.name,
                content: rawContent,
                file_type: file.name.split(".").pop()?.toLowerCase(),
              }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Upload failed");

            setFeedback({ type: "success", text: `✓ ${file.name} indexed successfully.` });
            resolve();
          } catch (err: any) {
            setFeedback({ type: "error", text: `✗ ${err.message}` });
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("File read error"));
      });

      reader.readAsText(file);
      try {
        await uploadPromise;
      } catch {
        // continue with other files
      }
    }

    setUploading(false);
    onUploadSuccess();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFormatIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "csv":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case "pdf":
        return <FileBox className="w-4 h-4 text-rose-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Drop Zone */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Knowledge Base Ingestion</h2>
        <p className="text-xs text-slate-500 mb-3">
          Supported: PDF, DOCX, TXT, CSV (Automatic cleaning, chunking & FAISS indexing)
        </p>

        <div
          id="drop-zone-container"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40"
          }`}
        >
          <input
            id="hidden-file-input"
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-800">
            {uploading ? "Ingesting & Embedding..." : "Click or drag documents to upload"}
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            Max 25MB • Up to 500 tokens/chunk with 50-token overlap
          </span>
        </div>

        {feedback && (
          <div
            className={`mt-2.5 p-2 rounded-md text-xs flex items-center gap-1.5 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Active Documents ({documents.length})
          </h2>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            FAISS Indexed
          </span>
        </div>

        <div className="overflow-y-auto max-h-[320px] flex flex-col gap-2 pr-1">
          {documents.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No documents in knowledge base yet.
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.document_id}
                id={`doc-item-${doc.document_id}`}
                className="group flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="p-1.5 bg-white border border-slate-200 rounded-md">
                    {getFormatIcon(doc.file_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate" title={doc.file_name}>
                      {doc.file_name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="uppercase font-mono">{doc.file_type}</span>
                      <span>•</span>
                      <span>{doc.total_chunks} chunks</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteDocument(doc.document_id)}
                  className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Remove document and purge chunks from vector index"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
