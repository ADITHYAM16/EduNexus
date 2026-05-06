import React, { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { studentRoster } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { GraduationCap, Users, TrendingUp, Search, Eye, AlertCircle, Loader2 } from "lucide-react";

const YEARS    = ["I Year", "II Year", "III Year", "IV Year"];
const SECTIONS = ["A", "B", "C", "D"];
const SUBJECTS = ["Maths", "NLVRS", "FDS", "CN", "OS", "EVS"];

type AssessmentKey = "ciat1" | "ciat2" | "assignment1" | "assignment2";
const ASSESSMENTS: { key: AssessmentKey; label: string; short: string; max: number }[] = [
  { key: "ciat1",       label: "CIAT 1",       short: "C1", max: 100 },
  { key: "ciat2",       label: "CIAT 2",       short: "C2", max: 100 },
  { key: "assignment1", label: "Assignment 1", short: "A1", max: 10  },
  { key: "assignment2", label: "Assignment 2", short: "A2", max: 10  },
];

type RowMarks = Record<AssessmentKey, string>;
type MarksStore = Record<string, Record<string, RowMarks>>;

const emptyRow = (): RowMarks => ({ ciat1: "", ciat2: "", assignment1: "", assignment2: "" });

const gradeOf = (avg: number) => {
  if (avg >= 75) return { g: "A",    cls: "bg-green-100 text-green-700 border-green-400 dark:bg-green-900/40 dark:text-green-300" };
  if (avg >= 60) return { g: "B",    cls: "bg-blue-100 text-blue-700 border-blue-400 dark:bg-blue-900/40 dark:text-blue-300" };
  if (avg >= 50) return { g: "C",    cls: "bg-amber-800/10 text-amber-800 border-amber-700 dark:bg-amber-900/40 dark:text-amber-400" };
  return           { g: "FAIL", cls: "bg-red-100 text-red-700 border-red-400 dark:bg-red-900/40 dark:text-red-300" };
};

const getAvg = (row: RowMarks): number | null => {
  if (!row.ciat1 || !row.ciat2) return null;
  return Math.round((parseInt(row.ciat1) + parseInt(row.ciat2)) / 2);
};

const HodStudentProgress: React.FC = () => {
  const [year, setYear]       = useState("");
  const [section, setSection] = useState("");
  const [marks, setMarks]     = useState<MarksStore>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);

  const allStudents = studentRoster[`${year}|${section}`] || [];

  const students = useMemo(() =>
    search.trim() ? allStudents.filter(n => n.toLowerCase().includes(search.toLowerCase())) : allStudents,
    [allStudents, search]
  );

  const fetchMarks = useCallback(async () => {
    if (!year || !section) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("student_marks")
      .select("student_name,subject,ciat1,ciat2,assignment1,assignment2")
      .eq("year", year)
      .eq("section", section);

    if (error) {
      toast({ title: "Load Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const store: MarksStore = {};
    (data || []).forEach(row => {
      if (!store[row.subject]) store[row.subject] = {};
      store[row.subject][row.student_name] = {
        ciat1:       row.ciat1?.toString()       ?? "",
        ciat2:       row.ciat2?.toString()       ?? "",
        assignment1: row.assignment1?.toString() ?? "",
        assignment2: row.assignment2?.toString() ?? "",
      };
    });
    setMarks(store);
    setLoading(false);
  }, [year, section]);

  useEffect(() => {
    setMarks({});
    setSearch("");
    fetchMarks();
  }, [fetchMarks]);

  const filledInSubject = (subject: string) =>
    allStudents.filter(s => getAvg(marks[subject]?.[s] || emptyRow()) !== null).length;

  const hasData = SUBJECTS.some(sub => filledInSubject(sub) > 0);
  const isReady = year && section;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students Progress</h1>
          <p className="text-sm text-muted-foreground">View marks entered by staff — read only</p>
        </div>
        <Badge variant="outline" className="ml-auto gap-1 text-xs border-primary/30 text-primary px-3 py-1.5">
          <Eye className="w-3 h-3" /> View Only
        </Badge>
      </div>

      {/* Filters */}
      <Card className="mb-5 border-2 border-primary/20 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Academic Year</p>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select Year" /></SelectTrigger>
                <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Section</p>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>{SECTIONS.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {isReady && allStudents.length > 0 && (
              <Badge variant="outline" className="gap-1 px-3 py-1.5 border-primary/30 text-primary text-xs ml-auto">
                <Users className="w-3 h-3" /> {allStudents.length} Students
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {!isReady ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Select a year and section to view marks</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : allStudents.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No students found for {year} – Section {section}</p>
          </CardContent>
        </Card>
      ) : !hasData ? (
        <Card className="border-dashed border-2 border-warning/40">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-warning/50 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">Marks Not Yet Entered</p>
            <p className="text-xs text-muted-foreground mt-1">Staff has not submitted marks for {year} – Section {section} yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {SUBJECTS.map(sub => {
              const avgs = allStudents.map(s => getAvg(marks[sub]?.[s] || emptyRow())).filter(v => v !== null) as number[];
              const avg  = avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null;
              return (
                <Card key={sub} className="shadow-sm">
                  <CardContent className="p-3">
                    <p className="text-xs font-bold text-foreground">{sub}</p>
                    <p className="text-xl font-black text-primary mt-0.5">{avg !== null ? `${avg}` : "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{avgs.length}/{allStudents.length} entered</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Subject Tabs */}
          <Tabs value={activeSubject} onValueChange={setActiveSubject}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <TabsList className="flex-wrap h-auto gap-1 p-1">
                {SUBJECTS.map(sub => {
                  const filled = filledInSubject(sub);
                  const done   = filled === allStudents.length;
                  return (
                    <TabsTrigger key={sub} value={sub} className="text-xs px-3 py-1.5 gap-1.5">
                      {sub}
                      <span className={`text-[10px] font-bold px-1 rounded ${done ? "text-green-600" : "text-muted-foreground"}`}>
                        {filled}/{allStudents.length}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 w-48 text-xs" />
              </div>
            </div>

            {SUBJECTS.map(subject => (
              <TabsContent key={subject} value={subject} className="mt-0">
                <Card className="shadow-sm overflow-hidden">
                  <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{subject} — {year}, Section {section}</CardTitle>
                      <div className="flex gap-2">
                        {ASSESSMENTS.map(a => (
                          <span key={a.key} className="text-[10px] text-muted-foreground bg-background border border-border rounded px-2 py-0.5 font-medium">
                            {a.short} /{a.max}
                          </span>
                        ))}
                        <span className="text-[10px] text-muted-foreground bg-background border border-border rounded px-2 py-0.5 font-medium">Total /100</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border">
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-8">#</th>
                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground min-w-[200px]">Student Name</th>
                            {ASSESSMENTS.map(a => (
                              <th key={a.key} className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground min-w-[90px]">
                                <div>{a.label}</div>
                                <div className="text-[10px] font-normal opacity-60">Max {a.max}</div>
                              </th>
                            ))}
                            <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground min-w-[80px]">Total (Avg)</th>
                            <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-14">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student, idx) => {
                            const realIdx = allStudents.indexOf(student);
                            const row     = marks[subject]?.[student] || emptyRow();
                            const avg     = getAvg(row);
                            const g       = avg !== null ? gradeOf(avg) : null;
                            return (
                              <tr key={student} className={`border-b border-border hover:bg-primary/5 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                                <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{realIdx + 1}</td>
                                <td className="px-3 py-2.5">
                                  <span className="text-xs font-semibold text-foreground tracking-wide">{student}</span>
                                </td>
                                {ASSESSMENTS.map(a => (
                                  <td key={a.key} className="px-3 py-2.5 text-center">
                                    <span className={`text-sm font-bold ${row[a.key] ? "text-foreground" : "text-muted-foreground/30"}`}>
                                      {row[a.key] || "—"}
                                    </span>
                                  </td>
                                ))}
                                <td className="px-3 py-2.5 text-center">
                                  {avg !== null
                                    ? <span className="font-bold text-sm text-foreground">{avg}</span>
                                    : <span className="text-muted-foreground/30 text-xs">—</span>}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  {g
                                    ? <Badge className={`text-[10px] font-bold border px-1.5 py-0.5 ${g.cls}`}>{g.g}</Badge>
                                    : <span className="text-muted-foreground/30 text-xs">—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer stats */}
                    {filledInSubject(subject) > 0 && (() => {
                      const avgs = allStudents.map(s => getAvg(marks[subject]?.[s] || emptyRow())).filter(v => v !== null) as number[];
                      const avg  = Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length);
                      return (
                        <div className="px-4 py-3 bg-muted/20 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Class Avg: <strong className="text-foreground">{avg}/100</strong></span>
                          <span>Highest: <strong className="text-green-600">{Math.max(...avgs)}</strong></span>
                          <span>Lowest: <strong className="text-red-500">{Math.min(...avgs)}</strong></span>
                          <span>Pass (≥50): <strong className="text-foreground">{avgs.filter(v => v >= 50).length}/{avgs.length}</strong></span>
                          <span>A Grade: <strong className="text-green-600">{avgs.filter(v => v >= 75).length}</strong></span>
                          <span>FAIL: <strong className="text-red-500">{avgs.filter(v => v < 50).length}</strong></span>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
};

export default HodStudentProgress;
