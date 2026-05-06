import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent, StudentInfo, TestResult, Remark } from "@/contexts/StudentContext";
import { mcqSubjects, MCQSubject } from "@/data/mcqData";
import { User, CheckCircle, ChevronRight, ChevronDown, LogOut, Moon, Sun, BookOpen, Calendar, TrendingUp } from "lucide-react";
import EduNexusLogo from "@/components/EduNexusLogo";

const gradientStyle = { background: "linear-gradient(135deg, #a855f7, #7c3aed)" };
const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition";

// ── DB Setup Banner ───────────────────────────────────────────────────────────
const DbSetupBanner: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-red-200 dark:border-red-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">⚠️</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Database Not Set Up</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Supabase tables are missing</p>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 text-xs space-y-1.5">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">To fix this:</p>
        <p className="text-gray-600 dark:text-gray-400">1. Open your <span className="text-purple-600 font-bold">Supabase Dashboard</span></p>
        <p className="text-gray-600 dark:text-gray-400">2. Go to <span className="text-purple-600 font-bold">SQL Editor → New Query</span></p>
        <p className="text-gray-600 dark:text-gray-400">3. Paste the file <span className="text-purple-600 font-bold">supabase_students_setup.sql</span></p>
        <p className="text-gray-600 dark:text-gray-400">4. Click <span className="text-purple-600 font-bold">Run</span> then refresh this page</p>
      </div>
      <p className="text-xs text-green-600 dark:text-green-400 mb-4">✅ Your score is saved locally and will sync after setup.</p>
      <button onClick={onDismiss} className="w-full py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90" style={gradientStyle}>
        Got it, continue
      </button>
    </div>
  </div>
);

// ── Onboarding ────────────────────────────────────────────────────────────────
const OnboardingForm: React.FC = () => {
  const { setStudent } = useStudent();
  const [rollNo, setRollNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo.trim()) { setError("Please enter your roll number."); return; }
    setLoading(true);
    setError("");

    const { data, error: dbErr } = await (await import("@/lib/supabase")).supabase
      .from("students")
      .select("*")
      .eq("roll_no", rollNo.trim().toUpperCase())
      .single();

    setLoading(false);
    if (dbErr || !data) {
      setError("Roll number not found. Please check and try again.");
      return;
    }
    setStudent({ name: data.name, rollNo: data.roll_no, department: data.department, section: data.section, year: data.year, email: data.email || "" } as StudentInfo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={gradientStyle}><User className="w-5 h-5 text-white" /></div>
          <div><h2 className="text-xl font-bold text-gray-900">Student Portal</h2><p className="text-xs text-gray-500">Enter your roll number to continue</p></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Roll Number *</label>
            <input
              type="text"
              value={rollNo}
              onChange={e => setRollNo(e.target.value)}
              required
              placeholder="e.g. 124UAD003"
              className={inputCls}
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            style={gradientStyle}
          >
            {loading ? "Verifying..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── MCQ Test ──────────────────────────────────────────────────────────────────
interface MCQTestProps { subject: MCQSubject; onComplete: (score: number) => void; onMalpractice: () => void; }
const MCQTest: React.FC<MCQTestProps> = ({ subject, onComplete, onMalpractice }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<(number | null)[]>(Array(subject.questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const malpracticeTriggered = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !malpracticeTriggered.current && !submitted) {
        malpracticeTriggered.current = true;
        onMalpractice();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [submitted, onMalpractice]);

  const q = subject.questions[current];
  const score = selected.filter((s, i) => s === subject.questions[i].answer).length;
  const handleSelect = (idx: number) => { if (submitted) return; setSelected(p => { const n = [...p]; n[current] = idx; return n; }); };
  const handleSubmit = () => { if (selected.some(s => s === null)) { alert("Please answer all questions."); return; } setSubmitted(true); onComplete(score); };

  if (submitted) {
    const pct = Math.round((score / subject.questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${pct >= 70 ? "bg-green-100 dark:bg-green-900" : "bg-orange-100 dark:bg-orange-900"}`}>
          <span className={`text-2xl font-bold ${pct >= 70 ? "text-green-600" : "text-orange-600"}`}>{pct}%</span>
        </div>
        <h3 className="text-lg font-bold mb-1 dark:text-white">{subject.name} Complete!</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Score: {score}/{subject.questions.length}</p>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-gray-400">Question {current + 1} / {subject.questions.length}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-6">
        <div className="h-1.5 rounded-full transition-all" style={{ ...gradientStyle, width: `${((current + 1) / subject.questions.length) * 100}%` }} />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isSel = selected[current] === i;
            return (
              <button key={i} onClick={() => handleSelect(i)} className="w-full text-left px-4 py-3 rounded-lg border text-sm transition-all dark:text-gray-200"
                style={isSel ? { borderColor: "#7c3aed", background: "#f5f3ff", color: "#4c1d95", fontWeight: 600 } : { borderColor: "#e5e7eb" }}>
                <span className="font-medium mr-2" style={isSel ? { color: "#7c3aed" } : {}}>{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3">
        {current > 0 && <button onClick={() => setCurrent(p => p - 1)} className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Previous</button>}
        {current < subject.questions.length - 1
          ? <button onClick={() => setCurrent(p => p + 1)} disabled={selected[current] === null} className={`flex-1 py-2.5 rounded-lg text-white text-sm font-semibold ${selected[current] === null ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"}`} style={gradientStyle}>Next</button>
          : <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90" style={gradientStyle}>Submit</button>}
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const StudentDashboard: React.FC<{
  student: StudentInfo; myResults: TestResult[]; myRemarks: Remark[];
  onStartTest: (key: string) => void; onLogout: () => void;
}> = ({ student, myResults, myRemarks, onStartTest, onLogout }) => {
  const [dropOpen, setDropOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
    return isDark;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between px-4 py-3 border rounded-xl mx-2 my-2 bg-white dark:bg-gray-900 shrink-0 border-purple-500 dark:border-purple-700">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="EduNexus" className="w-7 h-7 object-contain" style={{ mixBlendMode: "multiply" }} />
          <span className="text-sm font-bold text-gray-900 dark:text-white font-cinzel">EduNexus</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">Student Portal</span>
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle dark mode">
            {dark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-5 py-2.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-0.5">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Roll No: <span className="font-semibold text-gray-800 dark:text-gray-100">{student.rollNo}</span></span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Year: <span className="font-semibold text-gray-800 dark:text-gray-100">{student.year}</span></span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sec: <span className="font-semibold text-gray-800 dark:text-gray-100">{student.section}</span></span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Dept: <span className="font-semibold text-gray-800 dark:text-gray-100">{student.department}</span></span>
        </div>
        <div className="relative">
          <button onClick={() => setDropOpen(p => !p)} className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={gradientStyle}>{student.name.charAt(0).toUpperCase()}</div>
            <span className="text-xs sm:text-sm">{student.name.toUpperCase()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {dropOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-4">
        {/* MCQ Progress */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">MCQ Questions</p>
          <div className="space-y-3">
            {mcqSubjects.map((sub, idx) => {
              const subResults = myResults.filter(r => r.subjectKey === sub.key);
              const completed = subResults.length > 0;
              const best = completed ? Math.max(...subResults.map(r => r.score)) : 0;
              const pct = completed ? Math.round((best / 10) * 100) : 0;
              const colors = ["#7c3aed", "#2563eb", "#059669"];
              const color = colors[idx];
              return (
                <div key={sub.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{sub.name}</span>
                      {completed
                        ? <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/40 px-2 py-0.5 rounded-full flex-shrink-0">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        : <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">Not Attempted</span>
                      }
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-[6px]">
                      <div className="h-[6px] rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base sm:text-lg font-bold" style={{ color: completed ? color : "#9ca3af" }}>{best}/10</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Score</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Tests */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Available Tests</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mcqSubjects.map((sub, idx) => {
              const subResults = myResults.filter(r => r.subjectKey === sub.key);
              const hasAttempted = subResults.length > 0;
              const best = hasAttempted ? Math.max(...subResults.map(r => r.score)) : -1;
              const colors = ["from-purple-500 to-violet-600", "from-blue-500 to-cyan-600", "from-emerald-500 to-teal-600"];
              const icons = [
                <img key="java" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" className="w-full h-full object-contain" />,
                <img key="python" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" className="w-full h-full object-contain" />,
                "🗄️"
              ];
              return (
                <div key={sub.key} className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-xl flex-shrink-0 sm:mb-3 p-2`}>{icons[idx]}</div>
                  <div className="flex-1 sm:w-full">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:mb-1">{sub.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 sm:mb-3">10 questions · Multiple choice</p>
                    {hasAttempted && <div className="hidden sm:flex items-center gap-1.5 mb-3"><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-xs text-gray-500 dark:text-gray-400">Score: <span className="font-semibold text-gray-700 dark:text-gray-200">{best}/10</span></span></div>}
                  </div>
                  {hasAttempted ? (
                    <div className="flex-shrink-0 sm:w-full flex items-center justify-center gap-1 px-3 sm:px-0 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-medium cursor-not-allowed">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </div>
                  ) : (
                    <button onClick={() => onStartTest(sub.key)} className="flex-shrink-0 sm:w-full flex items-center justify-center gap-1 px-3 sm:px-0 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90" style={gradientStyle}>
                      Start <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── My Marks History ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" /> My Marks
            </p>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">{myResults.length} attempt{myResults.length !== 1 ? "s" : ""}</span>
          </div>

          {myResults.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">No tests attempted yet</p>
              <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-0.5">Complete a test to see your marks here</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500 dark:text-gray-400">Subject</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-gray-500 dark:text-gray-400">Marks</th>
                    <th className="text-center px-3 py-2.5 font-semibold text-gray-500 dark:text-gray-400">%</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" /> Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {[...myResults]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((r, i) => {
                      const pct = Math.round((r.score / r.total) * 100);
                      const color = pct >= 70 ? "text-green-600 dark:text-green-400" : pct >= 50 ? "text-orange-500" : "text-red-500";
                      const bg = pct >= 70 ? "bg-green-50 dark:bg-green-900/20" : pct >= 50 ? "bg-orange-50 dark:bg-orange-900/20" : "bg-red-50 dark:bg-red-900/20";
                      const subjectColors: Record<string, string> = { java: "#7c3aed", python: "#2563eb", dbms: "#059669" };
                      const subjectKey = r.subjectKey || "";
                      const dot = subjectColors[subjectKey] || "#6b7280";
                      return (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{r.subject}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`font-bold ${color}`}>{r.score}/{r.total}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${bg} ${color}`}>{pct}%</span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Remarks */}
        {myRemarks.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">⚠ Remarks</p>
            <div className="space-y-2">
              {myRemarks.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">{r.note}</p>
                  <p className="text-[11px] text-red-400 dark:text-red-500 mt-0.5">Subject: {r.subject} · {new Date(r.date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page Root ─────────────────────────────────────────────────────────────────
const StudentPage: React.FC = () => {
  const { student, results, saveResult, remarks, saveRemark, logout } = useStudent();
  const navigate = useNavigate();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [dbResults, setDbResults] = useState<TestResult[]>([]);
  const [dbRemarks, setDbRemarks] = useState<Remark[]>([]);
  const [showDbBanner, setShowDbBanner] = useState(false);

  const loadFromSupabase = async (rollNo: string) => {
    const { supabase } = await import("@/lib/supabase");
    const { data: r } = await supabase
      .from("student_test_results")
      .select("*")
      .eq("roll_no", rollNo)
      .order("date", { ascending: false });
    const { data: rem } = await supabase
      .from("student_remarks")
      .select("*")
      .eq("roll_no", rollNo);
    if (r) setDbResults(r.map((x: any) => ({ id: x.id, subject: x.subject, subjectKey: x.subject_key, score: x.score, total: x.total, date: x.date, studentName: x.student_name, rollNo: x.roll_no, department: x.department, section: x.section, year: x.year })));
    if (rem) setDbRemarks(rem.map((x: any) => ({ id: x.id, date: x.date, note: x.note, subject: x.subject, studentName: x.student_name, rollNo: x.roll_no })));
    localStorage.removeItem("local_test_results");
    localStorage.removeItem("local_remarks");
  };

  useEffect(() => {
    if (student) loadFromSupabase(student.rollNo);
  }, [student]);

  if (!student) return <OnboardingForm />;

  // Use ONLY Supabase data — never merge with local context state (causes duplicates)
  const myResults = dbResults;
  const myRemarks = dbRemarks;

  const handleTestComplete = async (subjectKey: string, subjectName: string, score: number) => {
    try {
      await saveResult({
        subject: subjectName,
        subjectKey,
        score,
        total: 10,
        date: new Date().toISOString(),
        studentName: student.name,
        rollNo: student.rollNo,
        department: student.department,
        section: student.section,
        year: student.year,
      } as TestResult);
      // Reload from Supabase to show the new result immediately
      await loadFromSupabase(student.rollNo);
    } catch (error: any) {
      if (error.message === "DATABASE_NOT_SETUP") {
        setShowDbBanner(true);
      }
    } finally {
      setActiveTest(null);
    }
  };

  const handleMalpractice = async (subjectKey: string, subjectName: string) => {
    await saveRemark({
      date: new Date().toISOString(),
      note: "Malpractice detected: Tab switch during test",
      subject: subjectName,
      studentName: student.name,
      rollNo: student.rollNo,
    });
    setActiveTest(null);
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const activeSubject = mcqSubjects.find(s => s.key === activeTest);

  if (activeSubject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="flex items-center justify-between px-4 py-3 border rounded-xl mx-2 my-2 bg-white dark:bg-gray-900 shrink-0 border-purple-500 dark:border-purple-700">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="EduNexus" className="w-7 h-7 object-contain" style={{ mixBlendMode: "multiply" }} />
            <span className="text-sm font-bold text-gray-900 dark:text-white font-cinzel">EduNexus</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">Student Portal</span>
        </header>
        <div className="p-3 sm:p-6">
          <MCQTest
            subject={activeSubject}
            onComplete={score => handleTestComplete(activeSubject.key, activeSubject.name, score)}
            onMalpractice={() => handleMalpractice(activeSubject.key, activeSubject.name)}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {showDbBanner && <DbSetupBanner onDismiss={() => setShowDbBanner(false)} />}
      <StudentDashboard student={student} myResults={myResults} myRemarks={myRemarks} onStartTest={setActiveTest} onLogout={handleLogout} />
    </>
  );
};

export default StudentPage;
