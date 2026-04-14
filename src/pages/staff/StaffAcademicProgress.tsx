import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, CheckCircle2, Circle, Clock, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subject { id: string; name: string; code: string; section_id: string; }
interface Section { id: string; name: string; year_id: string; }
interface Year { id: string; name: string; }
interface UnitProg { unit_number: number; topics_completed: number; topics_total: number; }

const TOPICS = 10;
const UNITS = [1, 2, 3, 4, 5];

const StaffAcademicProgress: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [unitProgress, setUnitProgress] = useState<Record<string, UnitProg[]>>({});
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.name) return;
    setLoading(true);

    const { data: subs } = await supabase
      .from("subjects").select("id,name,code,section_id")
      .eq("assigned_staff_name", user.name);

    const { data: secs } = await supabase.from("sections").select("id,name,year_id");
    const { data: yrs } = await supabase.from("years").select("id,name");

    setSubjects(subs || []);
    setSections(secs || []);
    setYears(yrs || []);

    if (subs && subs.length > 0) {
      const { data: prog } = await supabase
        .from("syllabus_progress").select("subject_id,unit_number,topics_completed,topics_total")
        .in("subject_id", subs.map(s => s.id));

      const map: Record<string, UnitProg[]> = {};
      subs.forEach(sub => {
        map[sub.id] = UNITS.map(u => {
          const found = prog?.find(r => r.subject_id === sub.id && r.unit_number === u);
          return { unit_number: u, topics_completed: found?.topics_completed ?? 0, topics_total: found?.topics_total ?? TOPICS };
        });
      });
      setUnitProgress(map);
    }
    setLoading(false);
  }, [user?.name]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveUnit = async (subjectId: string, unitNumber: number, topicsDone: number) => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase.from("syllabus_progress").upsert({
      subject_id: subjectId,
      staff_id: user.id,
      unit_number: unitNumber,
      topics_completed: topicsDone,
      topics_total: TOPICS,
      updated_at: new Date().toISOString(),
    }, { onConflict: "subject_id,unit_number" });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    setUnitProgress(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || UNITS.map(u => ({ unit_number: u, topics_completed: 0, topics_total: TOPICS }))).map(u =>
        u.unit_number === unitNumber ? { ...u, topics_completed: topicsDone } : u
      )
    }));
  };

  const getSubjectLocation = (sub: Subject) => {
    const sec = sections.find(s => s.id === sub.section_id);
    const yr = years.find(y => y.id === sec?.year_id);
    return `${yr?.name || ""} · Sec ${sec?.name || ""}`;
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const units = unitProgress[selectedSubjectId] || UNITS.map(u => ({ unit_number: u, topics_completed: 0, topics_total: TOPICS }));
  const overall = Math.round((units.reduce((a, u) => a + u.topics_completed, 0) / (UNITS.length * TOPICS)) * 100);
  const doneCount = units.filter(u => u.topics_completed === TOPICS).length;
  const ongoingCount = units.filter(u => u.topics_completed > 0 && u.topics_completed < TOPICS).length;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Syllabus Progress</h1>
      <p className="text-sm text-muted-foreground mb-6">Track unit-wise syllabus completion</p>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : subjects.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No subjects assigned to you yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Ask your HOD to assign subjects with your name.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Subject</label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="max-w-lg">
                <SelectValue placeholder="-- Select a subject --" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.code} — {s.name} · {getSubjectLocation(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Card className="shadow-card">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedSubject.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedSubject.code}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-card">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{getSubjectLocation(selectedSubject)}</p>
                      <p className="text-xs text-muted-foreground">Location</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Unit Cards */}
                <div className="lg:col-span-2 space-y-4">
                  {units.map(unit => {
                    const done = unit.topics_completed;
                    const st = done === TOPICS ? "done" : done > 0 ? "ongoing" : "pending";
                    const meta = {
                      done:    { label: "Completed",   color: "text-success",          bg: "bg-success/10",   Icon: CheckCircle2 },
                      ongoing: { label: "In Progress", color: "text-amber-500",        bg: "bg-amber-500/10", Icon: Clock },
                      pending: { label: "Not Started", color: "text-muted-foreground", bg: "bg-muted/40",     Icon: Circle },
                    }[st];
                    return (
                      <Card key={unit.unit_number} className="shadow-card">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <BookOpen className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">Unit {unit.unit_number}</span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border-0 ${meta.color} ${meta.bg}`}>
                                {meta.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {saving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                              <span className={`text-xs font-bold tabular-nums ${done === TOPICS ? "text-success" : done > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                                {done}/{TOPICS} topics
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap mb-3">
                            {Array.from({ length: TOPICS }, (_, t) => {
                              const filled = t < done;
                              return (
                                <button key={t}
                                  onClick={() => saveUnit(selectedSubject.id, unit.unit_number, filled ? t : t + 1)}
                                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-150 border-2 select-none ${
                                    filled
                                      ? done === TOPICS
                                        ? "bg-success border-success text-white shadow-sm"
                                        : "bg-primary border-primary text-white shadow-sm"
                                      : "bg-background border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
                                  }`}
                                >
                                  {t + 1}
                                </button>
                              );
                            })}
                          </div>

                          <Progress value={(done / TOPICS) * 100}
                            className={`h-1.5 ${done === TOPICS ? "[&>div]:bg-success" : done > 0 ? "[&>div]:bg-primary" : ""}`} />
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {done === 0 ? "Click topics above to mark progress" : done === TOPICS ? "All topics completed!" : `${done} of ${TOPICS} topics covered`}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-4">
                  <Card className="shadow-card">
                    <CardContent className="p-5 flex flex-col items-center gap-3">
                      <p className="text-sm font-semibold text-foreground self-start">Overall Completion</p>
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                            strokeDasharray={`${overall} ${100 - overall}`} strokeLinecap="round"
                            className={overall === 100 ? "text-success" : overall > 0 ? "text-primary" : "text-muted-foreground/20"} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-foreground">{overall}%</span>
                          <span className="text-[10px] text-muted-foreground">complete</span>
                        </div>
                      </div>
                      <Progress value={overall} className="h-2 w-full" />
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /><span className="text-sm text-foreground">Completed</span></div>
                        <span className="text-sm font-bold text-success">{doneCount}/{UNITS.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /><span className="text-sm text-foreground">In Progress</span></div>
                        <span className="text-sm font-bold text-amber-500">{ongoingCount}/{UNITS.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Circle className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">Not Started</span></div>
                        <span className="text-sm font-bold text-muted-foreground">{UNITS.length - doneCount - ongoingCount}/{UNITS.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default StaffAcademicProgress;
