import React, { useState } from "react";
import {
  X,
  User,
  GraduationCap,
  Building2,
  Bookmark,
  Flame,
  HelpCircle,
  LogOut,
  CheckCircle2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { StudentUser, AcademicTierId } from "../types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StudentUser;
  onUpdateUser: (updated: StudentUser) => void;
  onLogout: () => void;
  onSelectBookmark: (query: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onSelectBookmark,
}) => {
  const [activeTier, setActiveTier] = useState<AcademicTierId>(user.tier);
  const [stream, setStream] = useState(user.stream);
  const [institution, setInstitution] = useState(user.institution);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const tierLabels: Record<string, string> = {
      btech: "B.Tech (Engineering)",
      bba: "BBA (Business Administration)",
      intermediate: "Intermediate (Class 11 & 12)",
      class10: "10th Class (Secondary Education)",
      all: "All Academic Curricula",
    };

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          updates: {
            tier: activeTier,
            tierLabel: tierLabels[activeTier] || user.tierLabel,
            stream,
            institution,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUpdateUser(data.user);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl text-white font-bold text-lg flex items-center justify-center shadow-xs ${
                user.avatarColor || "bg-blue-600"
              }`}
            >
              {(user.name || "U").charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{user.name}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 border-b border-slate-100 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1">
              <HelpCircle className="w-3 h-3 text-blue-500" />
              <span>Questions</span>
            </div>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {user.stats?.questionsAsked || 0}
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Streak</span>
            </div>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {user.stats?.studyStreakDays || 1} Days
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1">
              <Bookmark className="w-3 h-3 text-emerald-500" />
              <span>Bookmarks</span>
            </div>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {user.bookmarks?.length || 0}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Active Academic Focus Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "btech", label: "B.Tech Engineering" },
                  { id: "bba", label: "BBA Business Admin" },
                  { id: "intermediate", label: "Intermediate (11 & 12)" },
                  { id: "class10", label: "10th Class Secondary" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTier(t.id as AcademicTierId)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      activeTier === t.id
                        ? "border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stream / Major
                </label>
                <input
                  type="text"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving ? <span>Saving...</span> : <span>Update Profile</span>}
              </button>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile updated!</span>
                </span>
              )}
            </div>
          </form>

          {/* Bookmarks Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span>Saved Bookmarks ({user.bookmarks?.length || 0})</span>
              </span>
            </div>

            {user.bookmarks && user.bookmarks.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {user.bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    onClick={() => {
                      onSelectBookmark(bm.query);
                      onClose();
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl cursor-pointer text-xs transition-colors group"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-blue-700 line-clamp-1">
                      {bm.query}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {bm.answerExcerpt}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span className="uppercase font-bold text-[9px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600">
                        {bm.tier}
                      </span>
                      <span>{new Date(bm.savedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No bookmarked answers yet. Bookmark answers from the chat!
              </p>
            )}
          </div>

          {/* Logout button */}
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
