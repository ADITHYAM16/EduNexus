import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollege } from "@/contexts/CollegeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, BookOpen, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const HodProgress: React.FC = () => {
  const { departments } = useCollege();
  const [deptId, setDeptId] = useState(departments[0]?.id || "");
  const [yearId, setYearId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const [remindOpen, setRemindOpen] = useState(false);
  const [remindStaff, setRemindStaff] = useState<{ name: string; subject: string; avg: number } | null>(null);
  const [msg, setMsg] = useState("");

  const dept = departments.find(d => d.id === deptId);
  const year = dept?.years.find(y => y.id === yearId);
  const section = year?.sections.find(s => s.id === sectionId);

  // Compute per-subject averages for the selected section
  const subjectStats = section
    ? section.subjects.map(sub => {
        const marks = section.students.map(s => s.marks[sub.id] || 0);
        const avg = marks.length > 0 ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : 0;
        const passing = marks.filter(m => m >= 60).length;
        return { ...sub, avg, passing, total: marks.length };
      })
    : [];

  const overallAvg = subjectStats.length > 0
    ? Math.round(subjectStats.reduce((a, s) => a + s.avg, 0) / subjectStats.length)
    : 0;

  const openReminder = (staffName: string, subjectName: string, avg: number) => {
    setRemindStaff({ name: staffName, subject: subjectName, avg });
    setMsg(`Dear ${staffName},\n\nThe average score for ${subjectName} is currently at ${avg}%. Please review and update student progress.\n\nRegards,\nHOD`);
    setRemindOpen(true);
  };

  const sendReminder = () => {
    toast({ title: "Reminder Sent", description: `Reminder sent to ${remindStaff?.name}` });
    setRemindOpen(false);
    setMsg("");
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Academic Progress</h1>
      <p className="text-sm text-muted-foreground mb-6">Department-wide syllabus tracking synced with college data</p>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department</label>
          <Select value={deptId} onValueChange={v => { setDeptId(v); setYearId(""); setSectionId(""); }}>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Academic Year</label>
          <Select value={yearId} onValueChange={v => { setYearId(v); setSectionId(""); }} disabled={!deptId}>
            <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
            <SelectContent>{dept?.years.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Section</label>
          <Select value={sectionId} onValueChange={setSectionId} disabled={!yearId}>
            <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
            <SelectContent>{year?.sections.map(s => <SelectItem key={s.id} value={s.id}>Section {s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      {section && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{section.students.length}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{section.subjects.length}</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overallAvg}%</p>
                <p className="text-xs text-muted-foreground">Overall Average</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject-wise Progress with Reminder */}
      {section ? (
        <div className="space-y-3 mb-6">
          {subjectStats.map(sub => (
            <Card key={sub.id} className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{sub.name}</h3>
                    <p className="text-xs text-muted-foreground">{sub.code} • Staff: {sub.assignedStaffName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${
                      sub.avg >= 80 ? "text-success" : sub.avg >= 60 ? "text-warning" : "text-destructive"
                    }`}>{sub.avg}%</span>
                    <button
                      onClick={() => openReminder(sub.assignedStaffName, sub.name, sub.avg)}
                      className="p-2 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                      title="Send reminder"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <Progress value={sub.avg} className="h-2.5" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{sub.passing} of {sub.total} students passing (≥60%)</span>
                  <Badge variant={sub.avg >= 80 ? "default" : sub.avg >= 60 ? "secondary" : "destructive"} className="text-xs">
                    {sub.avg >= 80 ? "On Track" : sub.avg >= 60 ? "Needs Attention" : "At Risk"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Select a department, year, and section to view progress</p>
          </CardContent>
        </Card>
      )}

      {/* Reminder Dialog */}
      <Dialog open={remindOpen} onOpenChange={setRemindOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reminder to {remindStaff?.name}</DialogTitle>
          </DialogHeader>
          <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setRemindOpen(false)}>Cancel</Button>
            <Button onClick={sendReminder}>Send Reminder</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodProgress;
