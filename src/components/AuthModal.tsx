import React, { useState } from "react";
import { X, Lock, Mail, User, GraduationCap, Building2, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import { StudentUser, AcademicTierId } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: StudentUser) => void;
  initialMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [tier, setTier] = useState<AcademicTierId>("btech");
  const [stream, setStream] = useState("Computer Science & Engineering");
  const [institution, setInstitution] = useState("National Institute of Technology");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const demoAccounts = [
    {
      label: "B.Tech Student",
      name: "Arjun Verma (CSE)",
      email: "btech.student@omni.edu",
      password: "pass123",
      color: "border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800",
    },
    {
      label: "BBA Student",
      name: "Ananya Sharma (Management)",
      email: "bba.student@omni.edu",
      password: "pass123",
      color: "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800",
    },
    {
      label: "Intermediate Class 12",
      name: "Rohan Patel (MPC)",
      email: "inter.student@omni.edu",
      password: "pass123",
      color: "border-violet-200 bg-violet-50/70 hover:bg-violet-100 text-violet-800",
    },
    {
      label: "10th Class Secondary",
      name: "Pooja Reddy (CBSE)",
      email: "class10.student@omni.edu",
      password: "pass123",
      color: "border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800",
    },
  ];

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.detail || "Authentication failed");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          onAuthSuccess(data.user);
          onClose();
        } else {
          setErrorMessage(data.detail || "Invalid email or password.");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            tier: tier === "all" ? "btech" : tier,
            stream,
            institution,
          }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          onAuthSuccess(data.user);
          onClose();
        } else {
          setErrorMessage(data.detail || "Registration failed.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to connect to authentication service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="auth-modal-dialog"
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {mode === "login" ? "Student & Academic Login" : "Register Student Account"}
              </h3>
              <p className="text-xs text-slate-500">
                OmniEdu AI • B.Tech, BBA, Intermediate & 10th Class
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
              mode === "login"
                ? "border-blue-600 text-blue-600 bg-blue-50/20"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage("");
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
              mode === "register"
                ? "border-blue-600 text-blue-600 bg-blue-50/20"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Create New Profile
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Demo Accounts */}
          {mode === "login" && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Instant 1-Click Demo Profiles:
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Pre-loaded academic state</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoAccounts.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDemoLogin(d.email, d.password)}
                    disabled={loading}
                    className={`p-2 rounded-lg border text-left text-xs font-medium transition-all ${d.color} flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">{d.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </div>
                    <span className="text-[10px] opacity-80 mt-0.5">{d.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Arjun Verma"
                      className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Educational Tier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "btech", label: "B.Tech Engineering", sub: "CSE, ECE, Mech, Civil" },
                      { id: "bba", label: "BBA Business Admin", sub: "Marketing, Finance, Law" },
                      { id: "intermediate", label: "Intermediate (11 & 12)", sub: "MPC, BiPC, MEC" },
                      { id: "class10", label: "10th Class Secondary", sub: "Science, Math, Social" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTier(t.id as AcademicTierId)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          tier === t.id
                            ? "border-blue-600 bg-blue-50/50 text-blue-900 font-semibold ring-1 ring-blue-600"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-bold text-[11px]">{t.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{t.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Stream / Specialization
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      College / Institution
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. NIT Delhi"
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{mode === "login" ? "Sign In" : "Complete Registration"}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
