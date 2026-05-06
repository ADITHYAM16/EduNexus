import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Search, X, ChevronRight, AlertTriangle, CheckCircle, Loader2, RotateCcw } from "lucide-react";

interface TestResult {
  id?: string;
  subject: string;
  subject_key: string;
  score: number;
  total: number;
  date: string;
  student_name: string;
  roll_no: string;
  department: string;
  section: string;
  year: string;
}

interface Remark {
  id?: string;
  date: string;
  note: string;
  subject: string;
  student_name: string;
  roll_no: string;
}

interface StudentProfile {
  name: string;
  rollNo: string;
  department: string;
  section: string;
  year: string;
  results: TestResult[];
  remarks: Remark[];
}

const SECTIONS = ["A", "B", "C"];
const SUBJECT_COLORS: Record<string, string> = {
  java: "#7c3aed",
  python: "#2563eb",
  dbms: "#059669",
};
const gradientStyle = { background: "linear-gradient(135deg, #a855f7, #7c3aed)" };

const StaffWeeklyTest: React.FC = () => {
  const { user } = useAuth();

  // If staff has an assigned section, lock to it; otherwise allow all
  const assignedSection = user?.section || null;
  const [section, setSection] = useState(assignedSection || "B");
  const [search, setSearch] = useState("");
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [allRemarks, setAllRemarks] = useState<Remark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudentProfile | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleReset = async (rollNo: string) => {
    if (!confirm(`Reset ALL test results for ${rollNo}? The student will need to retake all tests.`)) return;
    setResetting(true);
    await supabase.from("student_test_results").delete().eq("roll_no", rollNo);
    await supabase.from("student_remarks").delete().eq("roll_no", rollNo);
    setResetting(false);
    setSelected(null);
    fetchData();
  };

  // Fetch from Supabase only
  const fetchData = async () => {
    setLoading(true);

    const { data: supaResults, error: resErr } = await supabase
      .from("student_test_results")
      .select("*")
      .order("date", { ascending: false });

    const { data: supaRemarks, error: remErr } = await supabase
      .from("student_remarks")
      .select("*")
      .order("date", { ascending: false });

    setAllResults(resErr ? [] : (supaResults || []));
    setAllRemarks(remErr ? [] : (supaRemarks || []));
    if (resErr) console.error("Error fetching test results:", resErr.message);
    if (remErr) console.error("Error fetching remarks:", remErr.message);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription for new test results
    const resultsSub = supabase
      .channel("student_test_results_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "student_test_results" }, () => fetchData())
      .subscribe();

    const remarksSub = supabase
      .channel("student_remarks_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "student_remarks" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(resultsSub);
      supabase.removeChannel(remarksSub);
    };
  }, [user?.department]);

  // Group results into student profiles filtered by section only
  const students = useMemo(() => {
    const filtered = allResults.filter(r => r.section === section);
    const map = new Map<string, StudentProfile>();
    filtered.forEach(r => {
      if (!map.has(r.roll_no)) {
        map.set(r.roll_no, {
          name: r.student_name,
          rollNo: r.roll_no,
          department: r.department,
          section: r.section,
          year: r.year,
          results: [],
          remarks: allRemarks.filter(rem => rem.roll_no === r.roll_no),
        });
      }
      map.get(r.roll_no)!.results.push(r);
    });
    return Array.from(map.values());
  }, [allResults, allRemarks, section, user?.department]);

  // Search filter — name, roll no, section
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Test Results</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {user?.department} — Section {section}
              {assignedSection && <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">Assigned Section</span>}
            </p>
          </div>
          <button onClick={fetchData} className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "↻"} Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Section tabs — locked if staff has assigned section */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => !assignedSection && setSection(s)}
                disabled={!!assignedSection && s !== assignedSection}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  section === s
                    ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-400 shadow-sm"
                    : assignedSection && s !== assignedSection
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, roll no, section..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Student List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No students found for Section {section}</p>
            <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Students appear here once they complete a test</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>Student</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(student => {
                const hasMalpractice = student.remarks.length > 0;
                return (
                  <div key={student.rollNo} className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{student.name}</p>
                      {hasMalpractice && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                    </div>
                    <button
                      onClick={() => setSelected(student)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 flex-shrink-0"
                      style={gradientStyle}
                    >
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Profile Modal (Centered) ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={gradientStyle}>
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 dark:text-white">{selected.name}</p>
                  {selected.remarks.length > 0 && (
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> Malpractice
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selected.rollNo} · {selected.department}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selected.year} · Section {selected.section}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Reset Button */}
            <div className="px-5 pt-4">
              <button
                onClick={() => handleReset(selected.rollNo)}
                disabled={resetting}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {resetting ? "Resetting..." : "Reset Test — Allow Student to Retake"}
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1">

              {/* Best Scores per Subject */}
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Test Results
                </p>
                {selected.results.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500">No tests attempted yet.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(
                      selected.results.reduce((acc, r) => {
                        if (!acc[r.subject_key] || r.score > acc[r.subject_key].score) acc[r.subject_key] = r;
                        return acc;
                      }, {} as Record<string, TestResult>)
                    ).map(([key, r]) => {
                      const pct = Math.round((r.score / r.total) * 100);
                      const color = SUBJECT_COLORS[key] || "#6b7280";
                      return (
                        <div key={key} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{r.subject}</span>
                            <span className="text-sm font-bold" style={{ color }}>{r.score}/{r.total} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                            Last attempt: {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* All Attempts History */}
              {selected.results.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span className="w-4 h-4 text-purple-500">📋</span> Marks History
                  </p>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left px-3 py-2.5 font-semibold text-gray-500 dark:text-gray-400">Subject</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-gray-500 dark:text-gray-400">Marks</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-gray-500 dark:text-gray-400">%</th>
                          <th className="text-right px-3 py-2.5 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {[...selected.results]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((r, i) => {
                            const pct = Math.round((r.score / r.total) * 100);
                            const color = pct >= 70 ? "text-green-600" : pct >= 50 ? "text-orange-500" : "text-red-500";
                            const bg = pct >= 70 ? "bg-green-50 dark:bg-green-900/20" : pct >= 50 ? "bg-orange-50 dark:bg-orange-900/20" : "bg-red-50 dark:bg-red-900/20";
                            const dot = SUBJECT_COLORS[r.subject_key] || "#6b7280";
                            return (
                              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                                    <span className="text-gray-700 dark:text-gray-300">{r.subject}</span>
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
                </div>
              )}

              {/* Remarks */}
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Remarks
                </p>
                {selected.remarks.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">No remarks on record.</p>
                ) : (
                  <div className="space-y-2">
                    {selected.remarks.map((r, i) => (
                      <div key={i} className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400">{r.note}</p>
                        <p className="text-[11px] text-red-400 dark:text-red-500 mt-0.5">
                          Subject: {r.subject} · {new Date(r.date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffWeeklyTest;
