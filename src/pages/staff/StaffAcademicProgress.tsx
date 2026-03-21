import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollege } from "@/contexts/CollegeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Circle, Clock, GraduationCap, Users } from "lucide-react";

const UNITS = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];
const TOPICS = 10;

const unitStatus = (done: number) =>
  done === TOPICS ? "done" : done > 0 ? "ongoing" : "pending";

const statusMeta = {
  done:    { label: "Completed",   color: "text-success",          bg: "bg-success/10",  icon: CheckCircle2 },
  ongoing: { label: "In Progress", color: "text-amber-500",        bg: "bg-amber-500/10", icon: Clock },
  pending: { label: "Not Started", color: "text-muted-foreground", bg: "bg-muted/40",    icon: Circle },
};

const StaffAcademicProgress: React.FC = () => {
  const { user } = useAuth();
  const { getStaffAssignments } = useCollege();
  const assignments = getStaffAssignments(user?.id || "");

  const [selectedIdx, setSelectedIdx] = useState<string>("");
  // stores number of topics done (0–10) per unit per key
  const [unitProgress, setUnitProgress] = useState<Record<string, number[]>>({});

  const assignment = assignments[parseInt(selectedIdx)] || null;
  const key = assignment ? `${assignment.subject.id}-${assignment.section.id}` : "";
  const progress = unitProgress[key] || UNITS.map(() => 0);

  const setTopics = (unitIdx: number, topicsDone: number) => {
    setUnitProgress(prev => {
      const cur = prev[key] || UNITS.map(() => 0);
      const updated = [...cur];
      updated[unitIdx] = topicsDone;
      return { ...prev, [key]: updated };
    });
  };

  const overall = Math.round((progress.reduce((a, b) => a + b, 0) / (UNITS.length * TOPICS)) * 100);
  const doneCount = progress.filter(p => p === TOPICS).length;
  const ongoingCount = progress.filter(p => p > 0 && p < TOPICS).length;

  if (assignments.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-foreground mb-1">Syllabus Progress</h1>
        <p className="text-sm text-muted-foreground mb-6">Track unit-wise syllabus completion</p>
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No subjects assigned to you yet.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Syllabus Progress</h1>
      <p className="text-sm text-muted-foreground mb-6">Track unit-wise syllabus completion</p>

      {/* Subject Selector */}
      <div className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Subject</label>
        <Select value={selectedIdx} onValueChange={v => setSelectedIdx(v)}>
          <SelectTrigger className="max-w-lg">
            <SelectValue placeholder="-- Select a subject --" />
          </SelectTrigger>
          <SelectContent>
            {assignments.map((a, i) => (
              <SelectItem key={i} value={String(i)}>
                {a.subject.code} — {a.subject.name} · {a.year.name}, Sec {a.section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {assignment && (
        <>
          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{assignment.subject.name}</p>
                  <p className="text-xs text-muted-foreground">{assignment.subject.code}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{assignment.year.name}</p>
                  <p className="text-xs text-muted-foreground">Section {assignment.section.name}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{assignment.section.students?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Unit Cards ── */}
            <div className="lg:col-span-2 space-y-4">
              {UNITS.map((unit, i) => {
                const done = progress[i];
                const st = unitStatus(done);
                const meta = statusMeta[st];
                const Icon = meta.icon;
                return (
                  <Card key={unit} className="shadow-card">
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">{unit}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border-0 ${meta.color} ${meta.bg}`}>
                            {meta.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                          <span className={`text-xs font-bold tabular-nums ${done === TOPICS ? "text-success" : done > 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                            {done}/{TOPICS} topics
                          </span>
                        </div>
                      </div>

                      {/* 10 topic pills — click to toggle */}
                      <div className="flex gap-2 flex-wrap mb-3">
                        {Array.from({ length: TOPICS }, (_, t) => {
                          const filled = t < done;
                          return (
                            <button
                              key={t}
                              onClick={() => setTopics(i, filled ? t : t + 1)}
                              title={`Topic ${t + 1}: click to ${filled ? "unmark" : "mark"} done`}
                              className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-150 border-2 select-none
                                ${filled
                                  ? done === TOPICS
                                    ? "bg-success border-success text-white shadow-sm scale-95"
                                    : "bg-primary border-primary text-white shadow-sm"
                                  : "bg-background border-border text-muted-foreground hover:border-primary/60 hover:bg-primary/8 hover:text-primary"
                                }`}
                            >
                              {t + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* Progress bar */}
                      <Progress
                        value={(done / TOPICS) * 100}
                        className={`h-1.5 ${done === TOPICS ? "[&>div]:bg-success" : done > 0 ? "[&>div]:bg-primary" : ""}`}
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {done === 0 ? "Click topics above to mark progress" : done === TOPICS ? "All topics completed!" : `${done} of ${TOPICS} topics covered`}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ── Summary Sidebar ── */}
            <div className="space-y-4">
              {/* Overall ring */}
              <Card className="shadow-card">
                <CardContent className="p-5 flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-foreground self-start">Overall Completion</p>
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="currentColor" strokeWidth="3"
                        strokeDasharray={`${overall} ${100 - overall}`}
                        strokeLinecap="round"
                        className={overall === 100 ? "text-success" : overall > 0 ? "text-primary" : "text-muted-foreground/20"}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">{overall}%</span>
                      <span className="text-[10px] text-muted-foreground">complete</span>
                    </div>
                  </div>
                  <Progress value={overall} className="h-2 w-full" />
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">Completed</span>
                    </div>
                    <span className="text-sm font-bold text-success">{doneCount} / {UNITS.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-foreground">In Progress</span>
                    </div>
                    <span className="text-sm font-bold text-amber-500">{ongoingCount} / {UNITS.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Not Started</span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">
                      {UNITS.length - doneCount - ongoingCount} / {UNITS.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default StaffAcademicProgress;
