import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollege } from "@/contexts/CollegeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Users, BookOpen, GraduationCap, User, ArrowLeft } from "lucide-react";

const UNITS = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"];

const HodProgress: React.FC = () => {
  const { departments } = useCollege();
  const [deptId, setDeptId] = useState(departments[0]?.id || "");
  const [yearId, setYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [unitProgress] = useState<Record<string, number[]>>(() => {
    // Mock unit progress data (0-10 for each unit)
    const progress: Record<string, number[]> = {};
    departments.forEach(dept => {
      dept.years.forEach(year => {
        year.sections.forEach(section => {
          section.subjects.forEach(subject => {
            progress[subject.id] = UNITS.map(() => Math.floor(Math.random() * 11));
          });
        });
      });
    });
    return progress;
  });

  const dept = departments.find(d => d.id === deptId);
  const year = dept?.years.find(y => y.id === yearId);
  const section = year?.sections.find(s => s.id === sectionId);
  const selectedSubject = section?.subjects.find(s => s.id === selectedSubjectId);

  const getOverallCompletion = (subjectId: string) => {
    const progress = unitProgress[subjectId] || UNITS.map(() => 0);
    return Math.round((progress.reduce((a, b) => a + b, 0) / (UNITS.length * 10)) * 100);
  };

  const resetSelection = () => {
    setSelectedSubjectId("");
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          {selectedSubject && (
            <Button variant="ghost" size="sm" onClick={resetSelection}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          <h1 className="text-2xl font-bold text-foreground">Syllabus Progress</h1>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {selectedSubject ? "Unit-wise syllabus completion tracking" : "Department-wide syllabus tracking synced with college data"}
      </p>

      {/* Filters */}
      {!selectedSubject && (
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
      )}

      {/* Summary Cards */}
      {section && !selectedSubject && (
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
                <p className="text-2xl font-bold text-foreground">
                  {section.subjects.length > 0
                    ? Math.round(section.subjects.reduce((a, sub) => a + getOverallCompletion(sub.id), 0) / section.subjects.length)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Completion</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject Details View */}
      {selectedSubject ? (
        <div className="space-y-6">
          {/* Subject Info */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedSubject.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedSubject.code} • {dept?.name} • {year?.name} • Section {section?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{getOverallCompletion(selectedSubject.id)}%</p>
                  <p className="text-xs text-muted-foreground">Overall Completion</p>
                </div>
              </div>
              <Progress value={getOverallCompletion(selectedSubject.id)} className="h-3" />
            </CardContent>
          </Card>

          {/* Staff Info */}
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Handling Staff</p>
                <p className="text-xs text-muted-foreground">{selectedSubject.assignedStaffName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Unit Progress Pills - Small Oval Shape */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Unit-wise Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 justify-center">
                {UNITS.map((unit, i) => {
                  const progress = unitProgress[selectedSubject.id]?.[i] || 0;
                  const percentage = (progress / 10) * 100;
                  return (
                    <div key={unit} className="text-center">
                      <div className={`px-4 py-2 rounded-full text-xs font-bold mb-1 min-w-[80px] ${
                        progress >= 8 ? "bg-green-100 text-green-700 border border-green-200" :
                        progress >= 5 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                        progress > 0 ? "bg-orange-100 text-orange-700 border border-orange-200" :
                        "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}>
                        {progress}/10
                      </div>
                      <p className="text-xs font-medium text-foreground">{unit}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(percentage)}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : section ? (
        /* Subject List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.subjects.map(subject => {
            const completion = getOverallCompletion(subject.id);
            return (
              <Card 
                key={subject.id} 
                className="shadow-card cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedSubjectId(subject.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant={completion >= 80 ? "default" : completion >= 50 ? "secondary" : "destructive"} className="text-xs">
                      {completion}%
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{subject.code}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{subject.assignedStaffName}</p>
                  </div>
                  <Progress value={completion} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Select a department, year, and section to view subjects</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default HodProgress;
