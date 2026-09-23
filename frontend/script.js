/**
 * AI Knowledge Retrieval Platform - Frontend Client
 * Multi-Agent Query Resolution, Document Ingestion, Web Speech API
 */

const API_BASE = "/api";
let currentSessionId = "session_" + Math.random().toString(36).substring(2, 9);
let speechRecognition = null;
let isRecording = false;

// DOM Elements
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const uploadFeedback = document.getElementById("upload-feedback");
const documentsList = document.getElementById("documents-list");
const statChunks = document.getElementById("stat-chunks");
const statDocs = document.getElementById("stat-docs");
const kbStatusBadge = document.getElementById("kb-status-badge");
const refreshDocsBtn = document.getElementById("refresh-docs-btn");
const chatForm = document.getElementById("chat-form");
const queryInput = document.getElementById("query-input");
const chatMessages = document.getElementById("chat-messages");
const voiceBtn = document.getElementById("voice-btn");
const voiceStatus = document.getElementById("voice-status");
const topKSelect = document.getElementById("top-k-select");
const thresholdInput = document.getElementById("threshold-input");
const btnClearChat = document.getElementById("btn-clear-chat");
const btnRunEval = document.getElementById("btn-run-eval");

// ---------------- Initialize ----------------
document.addEventListener("DOMContentLoaded", () => {
  initWebSpeech();
  fetchStatus();
  fetchDocuments();
  setupEventListeners();
});

function setupEventListeners() {
  // Drag and Drop Upload
  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFileSelect);

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  });

  refreshDocsBtn.addEventListener("click", () => {
    fetchDocuments();
    fetchStatus();
  });

  chatForm.addEventListener("submit", handleChatSubmit);
  voiceBtn.addEventListener("click", toggleVoiceInput);

  btnClearChat.addEventListener("click", () => {
    chatMessages.innerHTML = "";
    currentSessionId = "session_" + Math.random().toString(36).substring(2, 9);
    addAssistantMessage("Chat history cleared. Session reset. How can I assist you?");
  });

  btnRunEval.addEventListener("click", handleRunEvaluation);

  // Sample Query Clicks
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("sample-btn")) {
      const q = e.target.getAttribute("data-query");
      queryInput.value = q;
      queryInput.focus();
    }
  });
}

// ---------------- Web Speech API (STT & TTS) ----------------
function initWebSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = "en-US";

    speechRecognition.onstart = () => {
      isRecording = true;
      voiceBtn.classList.add("recording");
      voiceStatus.textContent = "🎙️ Listening... Speak your question clearly.";
    };

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      queryInput.value = transcript;
      voiceStatus.textContent = `Recognized: "${transcript}"`;
    };

    speechRecognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      voiceStatus.textContent = `Voice error: ${event.error}`;
      stopRecording();
    };

    speechRecognition.onend = () => {
      stopRecording();
    };
  } else {
    voiceBtn.style.opacity = "0.5";
    voiceBtn.title = "Web Speech API not supported by this browser";
  }
}

function toggleVoiceInput() {
  if (!speechRecognition) {
    alert("Web Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
    return;
  }

  if (isRecording) {
    speechRecognition.stop();
  } else {
    speechRecognition.start();
  }
}

function stopRecording() {
  isRecording = false;
  voiceBtn.classList.remove("recording");
  setTimeout(() => {
    if (voiceStatus.textContent.startsWith("Recognized:")) return;
    voiceStatus.textContent = "";
  }, 4000);
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any active utterance

  // Clean text from Markdown asterisks for natural reading
  const clean = text.replace(/[*#_`]/g, "");
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// ---------------- Document Ingestion ----------------
function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    uploadFiles(e.target.files);
  }
}

async function uploadFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const formData = new FormData();
    formData.append("file", file);

    uploadFeedback.innerHTML = `<span style="color: var(--primary);">Uploading & processing ${file.name}...</span>`;

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      uploadFeedback.innerHTML = `<span style="color: var(--success);">✓ ${data.message}</span>`;
      fetchDocuments();
      fetchStatus();
    } catch (err) {
      uploadFeedback.innerHTML = `<span style="color: var(--danger);">✗ ${err.message}</span>`;
    }
  }
}

async function fetchDocuments() {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    const docs = await res.json();

    if (!Array.isArray(docs) || docs.length === 0) {
      documentsList.innerHTML = `<div class="empty-state" style="color: var(--text-muted); font-size: 0.85rem; padding: 12px;">No documents in knowledge base. Upload above to begin.</div>`;
      return;
    }

    documentsList.innerHTML = docs.map(d => `
      <div class="doc-card" id="doc-${d.document_id}">
        <div class="doc-info">
          <span class="doc-name" title="${d.file_name}">📄 ${d.file_name}</span>
          <span class="doc-meta">${d.file_type.toUpperCase()} • ${d.total_chunks} chunks</span>
        </div>
        <button class="btn-delete" title="Delete document" onclick="deleteDocument('${d.document_id}')">🗑</button>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load documents:", err);
  }
}

async function deleteDocument(docId) {
  if (!confirm("Are you sure you want to remove this document from the knowledge base?")) return;

  try {
    const res = await fetch(`${API_BASE}/documents/${docId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Delete failed");

    fetchDocuments();
    fetchStatus();
  } catch (err) {
    alert(`Error deleting document: ${err.message}`);
  }
}

async function fetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/vector-store/status`);
    const status = await res.json();

    statChunks.textContent = status.total_chunks;
    statDocs.textContent = status.total_documents;
    kbStatusBadge.textContent = `Knowledge Base: ${status.total_chunks} Chunks Ready`;
  } catch (err) {
    kbStatusBadge.textContent = "Knowledge Base: Offline";
  }
}

// ---------------- Chat & Multi-Agent Resolution ----------------
async function handleChatSubmit(e) {
  e.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;

  queryInput.value = "";
  addUserMessage(query);

  const loadingId = addLoadingMessage();

  try {
    const res = await fetch(`${API_BASE}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query_text: query,
        session_id: currentSessionId,
        top_k: parseInt(topKSelect.value, 10),
        threshold: parseFloat(thresholdInput.value)
      })
    });

    const data = await res.json();
    removeMessage(loadingId);

    if (!res.ok) throw new Error(data.detail || "Query failed");

    renderAssistantResponse(data);
  } catch (err) {
    removeMessage(loadingId);
    addAssistantMessage(`⚠️ Error resolving query: ${err.message}`);
  }
}

function addUserMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message user-message";
  msg.innerHTML = `<div>${escapeHtml(text)}</div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
  const id = "loading_" + Date.now();
  const msg = document.createElement("div");
  msg.id = id;
  msg.className = "message assistant-message";
  msg.innerHTML = `
    <div class="message-header">
      <span class="avatar">⚙️</span>
      <em>Query Understanding & Vector Retrieval in progress...</em>
    </div>
  `;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}

function removeMessage(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function renderAssistantResponse(data) {
  const msg = document.createElement("div");
  msg.className = "message assistant-message";

  let confidenceClass = "confidence-med";
  if (data.confidence === "High confidence") confidenceClass = "confidence-high";
  if (data.confidence === "Low confidence") confidenceClass = "confidence-low";

  // Format Citations HTML
  let citationsHtml = "";
  if (data.sources && data.sources.length > 0) {
    citationsHtml = `
      <div class="citations-box">
        <div class="citations-title">Source Citations (${data.sources.length})</div>
        <div class="citations-list">
          ${data.sources.map((s, idx) => `
            <div class="citation-item">
              <span class="citation-badge">#${idx + 1}</span>
              <strong>${escapeHtml(s.document_name)}</strong>
              ${s.page_number ? `<span style="color: var(--text-muted);">(Page ${s.page_number})</span>` : ""}
              <span style="color: var(--primary); font-size: 0.78rem;">Similarity: ${(s.similarity_score * 100).toFixed(1)}%</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // Clarification Options
  let clarificationHtml = "";
  if (data.needs_clarification && data.clarification_options) {
    clarificationHtml = `
      <div class="sample-queries" style="margin-top: 12px;">
        <span class="sample-title">Click to disambiguate your inquiry:</span>
        ${data.clarification_options.map(opt => `
          <button class="sample-btn" data-query="${escapeHtml(opt)}">${escapeHtml(opt)}</button>
        `).join("")}
      </div>
    `;
  }

  msg.innerHTML = `
    <div class="message-header">
      <span class="avatar">🤖</span>
      <strong>Knowledge Assistant</strong>
      <span class="confidence-badge ${confidenceClass}">${data.confidence}</span>
    </div>
    <div class="answer-body">${formatMarkdown(data.answer)}</div>
    ${citationsHtml}
    ${clarificationHtml}
    <div class="message-actions">
      <button class="btn-tts" onclick="speakText(${JSON.stringify(data.answer)})">
        🔊 Read Answer
      </button>
    </div>
  `;

  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAssistantMessage(text) {
  const msg = document.createElement("div");
  msg.className = "message assistant-message";
  msg.innerHTML = `
    <div class="message-header">
      <span class="avatar">🤖</span>
      <strong>Knowledge Assistant</strong>
    </div>
    <div class="answer-body">${escapeHtml(text)}</div>
  `;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleRunEvaluation() {
  btnRunEval.disabled = true;
  btnRunEval.textContent = "Running 10 benchmark queries...";

  try {
    const res = await fetch(`${API_BASE}/evaluate`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Evaluation failed");

    const s = data.summary;
    alert(
      `--- RETRIEVAL EVALUATION RESULTS ---\n` +
      `Total Queries: ${s.total_queries}\n` +
      `Top-1 Accuracy: ${s.top1_accuracy_pct}%\n` +
      `Top-3 Accuracy: ${s.top3_accuracy_pct}%\n` +
      `Top-5 Accuracy: ${s.top5_accuracy_pct}%\n` +
      `Out-of-Scope Gating: ${s.out_of_scope_rejection_pct}%\n\n` +
      `Results saved to: results/retrieval_results.csv`
    );
  } catch (err) {
    alert(`Evaluation Error: ${err.message}`);
  } finally {
    btnRunEval.disabled = false;
    btnRunEval.textContent = "⚡ Run Retrieval Evaluation";
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatMarkdown(text) {
  if (!text) return "";
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^\• (.*$)/gim, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
  return formatted;
}
