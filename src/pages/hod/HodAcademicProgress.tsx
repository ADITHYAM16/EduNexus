import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollege } from "@/contexts/CollegeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Users, BookOpen, Download, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

const months = ["Month 1", "Month 2", "Month 3", "Month 4"];

const HodAcademicProgress: React.FC = () => {
  const { departments, addStudent } = useCollege();
  const [deptId, setDeptId] = useState(departments[0]?.id || "");
  const [yearId, setYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const dept = departments.find(d => d.id === deptId);
  const year = dept?.years.find(y => y.id === yearId);
  const section = year?.sections.find(s => s.id === sectionId);

  const handleAddStudent = () => {
    if (!deptId || !yearId || !sectionId || !newName.trim() || !newRoll.trim()) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    addStudent(deptId, yearId, sectionId, { name: newName.trim(), rollNo: newRoll.trim(), email: newEmail.trim() });
    setNewName(""); setNewRoll(""); setNewEmail("");
    setAddOpen(false);
    toast({ title: "Student Added", description: `${newName.trim()} has been added successfully` });
  };

  const handleExport = () => {
    if (!section || !dept || !year) {
      toast({ title: "Error", description: "Select department, year, and section first", variant: "destructive" });
      return;
    }
    const rows: any[] = [];
    section.students.forEach(stu => {
      const baseRow: any = { "Roll No": stu.rollNo, "Name": stu.name, "Email": stu.email };
      section.subjects.forEach(sub => {
        months.forEach((m, mi) => {
          const mark = stu.marks[sub.id] || 0;
          // Simulate monthly variation
          baseRow[`${sub.code} - ${m}`] = Math.max(0, Math.min(100, mark + Math.floor((mi - 1.5) * 3)));
        });
      });
      const allMarks = section.subjects.map(sub => stu.marks[sub.id] || 0);
      baseRow["Average"] = allMarks.length > 0 ? Math.round(allMarks.reduce((a, b) => a + b, 0) / allMarks.length) : 0;
      baseRow["Status"] = baseRow["Average"] >= 80 ? "Excellent" : baseRow["Average"] >= 60 ? "Average" : "At Risk";
      rows.push(baseRow);
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${dept.name} - ${year.name} - Sec ${section.name}`);
    XLSX.writeFile(wb, `Academic_Progress_${dept.name}_${year.name}_Section_${section.name}.xlsx`);
    toast({ title: "Exported", description: "Excel file downloaded successfully" });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Academic Progress</h1>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={!sectionId}>
                <UserPlus className="w-4 h-4 mr-1" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Student Name *" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input placeholder="Roll Number *" value={newRoll} onChange={e => setNewRoll(e.target.value)} />
                <Input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <Button className="w-full" onClick={handleAddStudent}>Add Student</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={handleExport} disabled={!section}>
            <Download className="w-4 h-4 mr-1" /> Export Excel
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">View student performance — 4 month breakdown</p>

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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {section.students.length > 0
                    ? Math.round(section.students.reduce((a, stu) => {
                        const vals = Object.values(stu.marks);
                        return a + (vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0);
                      }, 0) / section.students.length)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Table with 4-month columns */}
      {section ? (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{dept?.name} — {year?.name} — Section {section.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    {section.subjects.map(sub =>
                      months.map((m, mi) => (
                        <TableHead key={`${sub.id}-${mi}`} className="text-center text-xs">{sub.code}<br />{m}</TableHead>
                      ))
                    )}
                    <TableHead className="text-center">Avg</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.students.map(stu => {
                    const allMarks = section.subjects.map(sub => stu.marks[sub.id] || 0);
                    const avg = allMarks.length > 0 ? Math.round(allMarks.reduce((a, b) => a + b, 0) / allMarks.length) : 0;
                    return (
                      <TableRow key={stu.id}>
                        <TableCell className="font-mono text-xs">{stu.rollNo}</TableCell>
                        <TableCell className="font-medium text-sm whitespace-nowrap">{stu.name}</TableCell>
                        {section.subjects.map(sub =>
                          months.map((_, mi) => {
                            const mark = stu.marks[sub.id] || 0;
                            const monthMark = Math.max(0, Math.min(100, mark + Math.floor((mi - 1.5) * 3)));
                            return (
                              <TableCell key={`${sub.id}-${mi}`} className="text-center text-xs">
                                <span className={monthMark >= 80 ? "text-primary font-medium" : monthMark >= 60 ? "text-foreground" : "text-destructive font-medium"}>
                                  {monthMark}
                                </span>
                              </TableCell>
                            );
                          })
                        )}
                        <TableCell className="text-center font-bold text-sm">{avg}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={avg >= 80 ? "default" : avg >= 60 ? "secondary" : "destructive"} className="text-xs">
                            {avg >= 80 ? "Excellent" : avg >= 60 ? "Average" : "At Risk"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Select a department, year, and section to view student progress</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default HodAcademicProgress;
