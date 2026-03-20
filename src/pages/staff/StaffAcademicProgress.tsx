import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollege } from "@/contexts/CollegeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Pencil, Check, GraduationCap, Users } from "lucide-react";

const UNITS = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];

const StaffAcademicProgress: React.FC = () => {
  const { user } = useAuth();
  const { getStaffAssignments } = useCollege();
  const assignments = getStaffAssignments(user?.id || "");

  const [selectedIdx, setSelectedIdx] = useState<string>("");
  const [unitProgress, setUnitProgress] = useState<Record<string, number[]>>({});
  const [editingUnit, setEditingUnit] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const assignment = assignments[parseInt(selectedIdx)] || null;
  const key = assignment ? `${assignment.subject.id}-${assignment.section.id}` : "";
  const progress = unitProgress[key] || UNITS.map(() => 0);

  const setProgress = (units: number[]) => {
    setUnitProgress(prev => ({ ...prev, [key]: units }));
  };

  const handleEdit = (i: number) => {
    setEditingUnit(i);
    setEditValue(String(progress[i]));
  };

  const handleSave = (i: number) => {
    const val = Math.min(10, Math.max(0, parseInt(editValue) || 0));
    const updated = [...progress];
    updated[i] = val;
    setProgress(updated);
    setEditingUnit(null);
  };

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

  const overall = Math.round((progress.reduce((a, b) => a + b, 0) / (UNITS.length * 10)) * 100);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Syllabus Progress</h1>
      <p className="text-sm text-muted-foreground mb-6">Track unit-wise syllabus completion</p>

      {/* Class Selector */}
      <div className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Class</label>
        <Select value={selectedIdx} onValueChange={(v) => { setSelectedIdx(v); setEditingUnit(null); }}>
          <SelectTrigger className="max-w-lg">
            <SelectValue placeholder="-- Select a class --" />
          </SelectTrigger>
          <SelectContent>
            {assignments.map((a, i) => (
              <SelectItem key={i} value={String(i)}>
                {a.subject.code} - {a.subject.name} ({a.year.name}, Sec {a.section.name})
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

          {/* Overall */}
          <Card className="shadow-card mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Overall Syllabus Completion</p>
                <span className="text-2xl font-bold text-foreground">{overall}%</span>
              </div>
              <Progress value={overall} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {assignment.subject.name} — {assignment.year.name}, Section {assignment.section.name}
              </p>
            </CardContent>
          </Card>

          {/* Unit Cards */}
          <div className="space-y-4">
            {UNITS.map((unit, i) => (
              <Card key={unit} className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingUnit === i ? (
                        <>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-20 h-8 text-center text-sm"
                            autoFocus
                            onKeyDown={e => e.key === "Enter" && handleSave(i)}
                          />
                          <Button size="sm" className="h-8 px-2" onClick={() => handleSave(i)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className={`text-sm font-bold ${progress[i] >= 8 ? "text-success" : progress[i] >= 5 ? "text-warning" : "text-destructive"}`}>
                            {progress[i]}/10 topics
                          </span>
                          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleEdit(i)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <Progress value={(progress[i] / 10) * 100} className="h-2.5" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {progress[i] === 0 ? "Not started" : progress[i] === 10 ? "Completed" : `${progress[i]} of 10 topics covered`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default StaffAcademicProgress;
