import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollege } from "@/contexts/CollegeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Users, GraduationCap } from "lucide-react";

const StaffProgress: React.FC = () => {
  const { user } = useAuth();
  const { getStaffAssignments, departments } = useCollege();
  const assignments = getStaffAssignments(user?.id || "");

  const [selectedIdx, setSelectedIdx] = useState("0");
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
        <p className="text-sm text-muted-foreground mb-6">Track syllabus completion for your assigned subjects</p>
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No subjects assigned to you yet.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Calculate overall stats across all assignments
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

  const overallAvg = overallStats.markCount > 0 ? Math.round(overallStats.totalMarks / overallStats.markCount) : 0;

  // Current section stats
  const sectionStudents = section?.students || [];
  const subjectMarks = sectionStudents.map(s => s.marks[assignment!.subject.id] || 0);
  const sectionAvg = subjectMarks.length > 0 ? Math.round(subjectMarks.reduce((a, b) => a + b, 0) / subjectMarks.length) : 0;
  const passingCount = subjectMarks.filter(m => m >= 60).length;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Student Academic Progress</h1>
      <p className="text-sm text-muted-foreground mb-6">Track student performance for your assigned subjects</p>

      {/* Assignment Selector */}
      <div className="mb-6">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Assignment</label>
        <Select value={selectedIdx} onValueChange={setSelectedIdx}>
          <SelectTrigger className="max-w-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assignments.map((a, i) => (
              <SelectItem key={i} value={String(i)}>
                {a.dept.name} → {a.year.name} → Sec {a.section.name} → {a.subject.code} - {a.subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Progress */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Overall Performance (All Assignments)</h2>
            <span className="text-2xl font-bold text-foreground">{overallAvg}%</span>
          </div>
          <Progress value={overallAvg} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {overallStats.passing} of {overallStats.markCount} students passing (≥60%) across {assignments.length} subject(s)
          </p>
        </CardContent>
      </Card>

      {/* Info Cards for selected assignment */}
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
                <p className="text-xs text-muted-foreground">Students</p>
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

      {/* Student Performance Table */}
      {section && assignment && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Student Performance — {assignment.subject.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Marks</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectionStudents.map(stu => {
                  const mark = stu.marks[assignment.subject.id] || 0;
                  return (
                    <TableRow key={stu.id}>
                      <TableCell className="font-mono text-xs">{stu.rollNo}</TableCell>
                      <TableCell className="font-medium text-sm">{stu.name}</TableCell>
                      <TableCell className="text-center text-sm font-semibold">{mark}</TableCell>
                      <TableCell className="w-32">
                        <Progress value={mark} className="h-2" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={mark >= 80 ? "default" : mark >= 60 ? "secondary" : "destructive"} className="text-xs">
                          {mark >= 80 ? "Excellent" : mark >= 60 ? "Average" : "At Risk"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default StaffProgress;
