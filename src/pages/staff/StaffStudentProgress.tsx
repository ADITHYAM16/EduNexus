import React, { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { studentRoster } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { GraduationCap, Save, Users, TrendingUp, Search, Loader2, CheckCircle2, RotateCcw } from "lucide-react";

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
// marks[subject][studentName] = RowMarks
type MarksStore = Record<string, Record<string, RowMarks>>;
// savedRows[subject][studentName] = true if saved to DB
type SavedMap = Record<string, Record<string, boolean>>;
// savingRows[subject][studentName] = true if currently saving
type SavingMap = Record<string, Record<string, boolean>>;

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

const StaffStudentProgress: React.FC = () => {
  const [year, setYear]         = useState("");
  const [section, setSection]   = useState("");
  const [marks, setMarks]       = useState<MarksStore>({});
  const [saved, setSaved]       = useState<SavedMap>({});
  const [saving, setSaving]     = useState<SavingMap>({});
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);

  const [savingAll, setSavingAll] = useState(false);

  const rosterKey   = `${year}|${section}`;
  const allStudents = studentRoster[rosterKey] || [];

  const students = useMemo(() =>
    search.trim() ? allStudents.filter(n => n.toLowerCase().includes(search.toLowerCase())) : allStudents,
    [allStudents, search]
  );

  // Load existing marks from Supabase when year+section changes
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

    const newMarks: MarksStore = {};
    const newSaved: SavedMap  = {};
    (data || []).forEach(row => {
      if (!newMarks[row.subject]) newMarks[row.subject] = {};
      if (!newSaved[row.subject]) newSaved[row.subject] = {};
      newMarks[row.subject][row.student_name] = {
        ciat1:       row.ciat1?.toString()       ?? "",
        ciat2:       row.ciat2?.toString()       ?? "",
        assignment1: row.assignment1?.toString() ?? "",
        assignment2: row.assignment2?.toString() ?? "",
      };
      newSaved[row.subject][row.student_name] = true;
    });
    setMarks(newMarks);
    setSaved(newSaved);
    setLoading(false);
  }, [year, section]);

  useEffect(() => {
    setMarks({});
    setSaved({});
    setSearch("");
    fetchMarks();
  }, [fetchMarks]);

  const setMark = (subject: string, student: string, key: AssessmentKey, val: string) => {
    const max = ASSESSMENTS.find(a => a.key === key)!.max;
    const n = parseInt(val);
    if (val !== "" && (isNaN(n) || n < 0 || n > max)) return;
    // Mark as unsaved when edited
    setSaved(prev => ({ ...prev, [subject]: { ...(prev[subject] || {}), [student]: false } }));
    setMarks(prev => ({
      ...prev,
      [subject]: { ...(prev[subject] || {}), [student]: { ...(prev[subject]?.[student] || emptyRow()), [key]: val } },
    }));
  };

  // Save a single student's marks for the active subject
  const saveRow = async (subject: string, student: string) => {
    const row = marks[subject]?.[student] || emptyRow();
    setSaving(prev => ({ ...prev, [subject]: { ...(prev[subject] || {}), [student]: true } }));

    const { error } = await supabase.from("student_marks").upsert({
      student_name: student,
      year,
      section,
      subject,
      ciat1:       row.ciat1       !== "" ? parseInt(row.ciat1)       : null,
      ciat2:       row.ciat2       !== "" ? parseInt(row.ciat2)       : null,
      assignment1: row.assignment1 !== "" ? parseInt(row.assignment1) : null,
      assignment2: row.assignment2 !== "" ? parseInt(row.assignment2) : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "student_name,year,section,subject" });

    setSaving(prev => ({ ...prev, [subject]: { ...(prev[subject] || {}), [student]: false } }));

    if (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return;
    }
    setSaved(prev => ({ ...prev, [subject]: { ...(prev[subject] || {}), [student]: true } }));
    toast({ title: "Saved", description: `${student} — ${subject} marks saved.` });
  };

  // Save all students for the active subject
  const saveAll = async () => {
    setSavingAll(true);
    const upserts = allStudents.map(student => {
      const row = marks[activeSubject]?.[student] || emptyRow();
      return {
        student_name: student, year, section, subject: activeSubject,
        ciat1:       row.ciat1       !== "" ? parseInt(row.ciat1)       : null,
        ciat2:       row.ciat2       !== "" ? parseInt(row.ciat2)       : null,
        assignment1: row.assignment1 !== "" ? parseInt(row.assignment1) : null,
        assignment2: row.assignment2 !== "" ? parseInt(row.assignment2) : null,
        updated_at: new Date().toISOString(),
      };
    });
    const { error } = await supabase.from("student_marks").upsert(upserts, { onConflict: "student_name,year,section,subject" });
    setSavingAll(false);
    if (error) { toast({ title: "Save All Failed", description: error.message, variant: "destructive" }); return; }
    setSaved(prev => ({
      ...prev,
      [activeSubject]: Object.fromEntries(allStudents.map(s => [s, true])),
    }));
    toast({ title: "All Marks Saved", description: `${activeSubject} — all ${allStudents.length} students saved.` });
  };

  const resetAll = () => {
    setMarks(prev => ({ ...prev, [activeSubject]: {} }));
    setSaved(prev => ({ ...prev, [activeSubject]: {} }));
    toast({ title: "Reset", description: `${activeSubject} marks cleared locally.` });
  };

  const filledInSubject = (subject: string) =>
    allStudents.filter(s => {
      const r = marks[subject]?.[s];
      return r?.ciat1 !== "" && r?.ciat1 !== undefined && r?.ciat2 !== "" && r?.ciat2 !== undefined;
    }).length;

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
          <p className="text-sm text-muted-foreground">Enter & save CIAT and Assignment marks per student</p>
        </div>
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
            <p className="text-sm font-medium text-muted-foreground">Select a year and section to begin</p>
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
      ) : (
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
                      <span className="text-[10px] text-muted-foreground bg-background border border-border rounded px-2 py-0.5 font-medium">
                        Total /100
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-8">#</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground min-w-[180px]">Student Name</th>
                          {ASSESSMENTS.map(a => (
                            <th key={a.key} className="px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground min-w-[90px]">
                              <div>{a.label}</div>
                              <div className="text-[10px] font-normal opacity-60">Max {a.max}</div>
                            </th>
                          ))}
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground min-w-[80px]">Total</th>
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-14">Grade</th>
                          <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-20">Save</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, idx) => {
                          const realIdx  = allStudents.indexOf(student);
                          const row      = marks[subject]?.[student] || emptyRow();
                          const avg      = getAvg(row);
                          const g        = avg !== null ? gradeOf(avg) : null;
                          const isSaving = saving[subject]?.[student] === true;
                          const isSaved  = saved[subject]?.[student] === true;
                          const isDirty  = !isSaved && (row.ciat1 !== "" || row.ciat2 !== "" || row.assignment1 !== "" || row.assignment2 !== "");

                          return (
                            <tr key={student} className={`border-b border-border transition-colors hover:bg-primary/5 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                              <td className="px-4 py-2 text-xs text-muted-foreground font-medium">{realIdx + 1}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-foreground tracking-wide">{student}</span>
                                  {isSaved && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />}
                                </div>
                              </td>
                              {ASSESSMENTS.map(a => (
                                <td key={a.key} className="px-2 py-1.5 text-center">
                                  <Input
                                    type="number" min={0} max={a.max} placeholder="—"
                                    value={row[a.key]}
                                    onChange={e => setMark(subject, student, a.key, e.target.value)}
                                    className="h-8 text-center text-xs font-semibold w-full max-w-[80px] mx-auto"
                                  />
                                </td>
                              ))}
                              <td className="px-3 py-2 text-center">
                                {avg !== null
                                  ? <span className="font-bold text-sm text-foreground">{avg}</span>
                                  : <span className="text-muted-foreground/30 text-xs">—</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {g
                                  ? <Badge className={`text-[10px] font-bold border px-1.5 py-0.5 ${g.cls}`}>{g.g}</Badge>
                                  : <span className="text-muted-foreground/30 text-xs">—</span>}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Button
                                  size="sm"
                                  variant={isSaved && !isDirty ? "outline" : "default"}
                                  className="h-7 px-2 text-[11px] gap-1 min-w-[60px]"
                                  onClick={() => saveRow(subject, student)}
                                  disabled={isSaving}
                                >
                                  {isSaving
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : isSaved && !isDirty
                                      ? <><CheckCircle2 className="w-3 h-3 text-green-500" /> Saved</>
                                      : <><Save className="w-3 h-3" /> Save</>}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Save All / Reset All */}
                  <div className="px-4 py-3 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {filledInSubject(subject)}/{allStudents.length} students have CIAT marks entered
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={resetAll}>
                        <RotateCcw className="w-3.5 h-3.5" /> Reset All
                      </Button>
                      <Button size="sm" className="gap-1.5 text-xs h-8" onClick={saveAll} disabled={savingAll}>
                        {savingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save All
                      </Button>
                    </div>
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
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default StaffStudentProgress;
