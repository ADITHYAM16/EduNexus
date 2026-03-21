import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollege } from "@/contexts/CollegeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpen, Users, GraduationCap, Pencil, Check, X, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Student } from "@/data/collegeData";

const getStatus = (avg: number) =>
  avg >= 80 ? "Excellent" : avg >= 60 ? "Average" : "At Risk";

const statusVariant = (avg: number): "default" | "secondary" | "destructive" =>
  avg >= 80 ? "default" : avg >= 60 ? "secondary" : "destructive";

const clamp = (v: number) => Math.min(100, Math.max(0, v));

// ── inline editable cell — click text to edit ────────────────────────────────
const EditableCell: React.FC<{
  value: string;
  onSave: (v: string) => void;
  mono?: boolean;
}> = ({ value, onSave, mono }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = () => { onSave(draft.trim() || value); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-[100px]">
        <Input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="h-7 text-xs px-2"
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
        />
        <button onClick={save} className="p-1 rounded hover:bg-success/10 text-success"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={cancel} className="p-1 rounded hover:bg-destructive/10 text-destructive"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`flex items-center gap-1.5 group text-left w-full rounded px-1 -mx-1 hover:bg-muted/60 transition-colors ${mono ? "font-mono text-xs" : "text-sm font-medium"}`}
      title="Click to edit"
    >
      <span>{value}</span>
      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
};

// ── marks edit dialog ────────────────────────────────────────────────────────
const MarksDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  student: Student;
  subjectId: string;
  subjectName: string;
  deptId: string;
  yearId: string;
  sectionId: string;
}> = ({ open, onClose, student, subjectId, subjectName, deptId, yearId, sectionId }) => {
  const { updateStudentCiat } = useCollege();
  const [c1, setC1] = useState(String(student.ciat1?.[subjectId] ?? 0));
  const [c2, setC2] = useState(String(student.ciat2?.[subjectId] ?? 0));

  const c1n = clamp(parseInt(c1) || 0);
  const c2n = clamp(parseInt(c2) || 0);
  const avg = Math.round((c1n + c2n) / 2);

  const handleSave = () => {
    updateStudentCiat(deptId, yearId, sectionId, student.id, subjectId, c1n, c2n);
    toast({ title: "Marks Updated", description: `${student.name} — ${subjectName}: Avg ${avg}% (${getStatus(avg)})` });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Marks — {student.name}</DialogTitle>
          <p className="text-xs text-muted-foreground">{subjectName}</p>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-blue-600">CIAT 1 (0 – 100)</Label>
            <Input type="number" min={0} max={100} value={c1} onChange={e => setC1(e.target.value)} className="border-blue-200 focus:border-blue-400" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-green-600">CIAT 2 (0 – 100)</Label>
            <Input type="number" min={0} max={100} value={c2} onChange={e => setC2(e.target.value)} className="border-green-200 focus:border-green-400" />
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Average</span>
              <span className="text-lg font-bold text-foreground">{avg}%</span>
            </div>
            <Progress value={avg} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge variant={statusVariant(avg)} className="text-xs">{getStatus(avg)}</Badge>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>Save Marks</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── main page ────────────────────────────────────────────────────────────────
const StaffProgress: React.FC = () => {
  const { user } = useAuth();
  const { getStaffAssignments, departments, updateStudent, deleteStudent } = useCollege();
  const assignments = getStaffAssignments(user?.id || "");

  const [selectedIdx, setSelectedIdx] = useState("0");
  const [marksDialog, setMarksDialog] = useState<{ student: Student } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);

  const assignment = assignments[parseInt(selectedIdx)] || null;

  const section = assignment
    ? departments
        .find(d => d.id === assignment.dept.id)
        ?.years.find(y => y.id === assignment.year.id)
        ?.sections.find(s => s.id === assignment.section.id)
    : null;

  if (assignments.length === 0) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold text-foreground mb-1">Student Academic Progress</h1>
        <p className="text-sm text-muted-foreground mb-6">Track student performance for your assigned subjects</p>
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No subjects assigned to you yet.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const overallStats = assignments.reduce(
    (acc, a) => {
      const sec = departments
        .find(d => d.id === a.dept.id)
        ?.years.find(y => y.id === a.year.id)
        ?.sections.find(s => s.id === a.section.id);
      if (sec) {
        acc.totalStudents += sec.students.length;
        sec.students.forEach(stu => {
          const mark = stu.marks[a.subject.id] || 0;
          acc.totalMarks += mark;
          acc.markCount++;
          if (mark >= 60) acc.passing++;
        });
      }
      return acc;
    },
    { totalStudents: 0, totalMarks: 0, markCount: 0, passing: 0 }
  );
  const overallAvg = overallStats.markCount > 0
    ? Math.round(overallStats.totalMarks / overallStats.markCount) : 0;

  const sectionStudents = section?.students || [];
  const subjectAvgs = sectionStudents.map(s => {
    const c1 = s.ciat1?.[assignment!.subject.id] ?? s.marks[assignment!.subject.id] ?? 0;
    const c2 = s.ciat2?.[assignment!.subject.id] ?? s.marks[assignment!.subject.id] ?? 0;
    return Math.round((c1 + c2) / 2);
  });
  const sectionAvg = subjectAvgs.length > 0
    ? Math.round(subjectAvgs.reduce((a, b) => a + b, 0) / subjectAvgs.length) : 0;

  const handleDelete = (stu: Student) => {
    deleteStudent(assignment!.dept.id, assignment!.year.id, assignment!.section.id, stu.id);
    toast({ title: "Student Removed", description: `${stu.name} (${stu.rollNo}) has been deleted.`, variant: "destructive" });
    setDeleteConfirm(null);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Student Academic Progress</h1>
      <p className="text-sm text-muted-foreground mb-6">Track and edit student performance for your assigned subjects</p>

      <div className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Assignment</label>
        <Select value={selectedIdx} onValueChange={setSelectedIdx}>
          <SelectTrigger className="max-w-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            {assignments.map((a, i) => (
              <SelectItem key={i} value={String(i)}>
                {a.dept.name} → {a.year.name} → Sec {a.section.name} → {a.subject.code} - {a.subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {assignment && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{assignment.subject.name}</p>
                <p className="text-xs text-muted-foreground">{assignment.dept.name} • {assignment.year.name} • Sec {assignment.section.name}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{sectionStudents.length}</p>
                <p className="text-xs text-muted-foreground">
                  {subjectAvgs.filter(a => a >= 60).length} passing · {subjectAvgs.filter(a => a < 60).length} at risk
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{sectionAvg}%</p>
                <p className="text-xs text-muted-foreground">Section Average</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {section && assignment && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Student Performance — {assignment.subject.name}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (click name/roll to edit)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Roll No</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-center text-xs bg-blue-50 dark:bg-blue-950/30">CIAT 1</TableHead>
                    <TableHead className="text-center text-xs bg-green-50 dark:bg-green-950/30">CIAT 2</TableHead>
                    <TableHead className="text-center text-xs">Average</TableHead>
                    <TableHead className="text-center text-xs">Progress</TableHead>
                    <TableHead className="text-center text-xs">Status</TableHead>
                    <TableHead className="text-center text-xs">Edit Marks</TableHead>
                    <TableHead className="text-center text-xs">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionStudents.map(stu => {
                    const c1 = stu.ciat1?.[assignment.subject.id] ?? stu.marks[assignment.subject.id] ?? 0;
                    const c2 = stu.ciat2?.[assignment.subject.id] ?? stu.marks[assignment.subject.id] ?? 0;
                    const avg = Math.round((c1 + c2) / 2);
                    return (
                      <TableRow key={stu.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <EditableCell
                            mono
                            value={stu.rollNo}
                            onSave={v => {
                              updateStudent(assignment.dept.id, assignment.year.id, assignment.section.id, stu.id, { rollNo: v });
                              toast({ title: "Roll No Updated", description: `${stu.name} → ${v}` });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <EditableCell
                            value={stu.name}
                            onSave={v => {
                              updateStudent(assignment.dept.id, assignment.year.id, assignment.section.id, stu.id, { name: v });
                              toast({ title: "Name Updated", description: v });
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center bg-blue-50/50 dark:bg-blue-950/20">
                          <span className={`text-sm font-semibold ${c1 >= 80 ? "text-blue-700" : c1 >= 60 ? "text-blue-500" : "text-destructive"}`}>{c1}</span>
                        </TableCell>
                        <TableCell className="text-center bg-green-50/50 dark:bg-green-950/20">
                          <span className={`text-sm font-semibold ${c2 >= 80 ? "text-green-700" : c2 >= 60 ? "text-green-500" : "text-destructive"}`}>{c2}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-bold text-foreground">{avg}%</span>
                        </TableCell>
                        <TableCell className="w-28">
                          <Progress value={avg} className="h-2" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusVariant(avg)} className="text-xs">{getStatus(avg)}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm" variant="outline"
                            className="h-7 px-2 gap-1 text-xs hover:border-primary/40 hover:bg-primary/5"
                            onClick={() => setMarksDialog({ student: stu })}
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                            onClick={() => setDeleteConfirm(stu)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {marksDialog && assignment && (
        <MarksDialog
          open={!!marksDialog}
          onClose={() => setMarksDialog(null)}
          student={marksDialog.student}
          subjectId={assignment.subject.id}
          subjectName={assignment.subject.name}
          deptId={assignment.dept.id}
          yearId={assignment.year.id}
          sectionId={assignment.section.id}
        />
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={open => { if (!open) setDeleteConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.rollNo}) from this section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default StaffProgress;
