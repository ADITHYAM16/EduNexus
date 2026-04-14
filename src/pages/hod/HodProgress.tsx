import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, GraduationCap, User, ArrowLeft, Loader2, Building2 } from "lucide-react";

interface Subject { id: string; name: string; code: string; assigned_staff_name: string; section_id: string; }
interface Section { id: string; name: string; year_id: string; }
interface Year { id: string; name: string; department_id: string; }
interface Department { id: string; name: string; }
interface UnitProgress { unit_number: number; topics_completed: number; topics_total: number; }

const UNITS = [1, 2, 3, 4, 5];

const HodProgress: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [unitProgress, setUnitProgress] = useState<Record<string, UnitProgress[]>>({});
  const [loading, setLoading] = useState(true);

  const [deptId, setDeptId] = useState("");
  const [yearId, setYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const fetchStructure = useCallback(async () => {
    setLoading(true);
    const { data: depts } = await supabase.from("departments").select("id,name").order("name");
    const { data: yrs } = await supabase.from("years").select("id,name,department_id");
    const { data: secs } = await supabase.from("sections").select("id,name,year_id");
    const { data: subs } = await supabase.from("subjects").select("id,name,code,assigned_staff_name,section_id").order("code");
    setDepartments(depts || []);
    setYears(yrs || []);
    setSections(secs || []);
    setSubjects(subs || []);
    setLoading(false);
  }, []);

  const fetchProgress = useCallback(async (subjectIds: string[]) => {
    if (!subjectIds.length) return;
    const { data } = await supabase
      .from("syllabus_progress")
      .select("subject_id,unit_number,topics_completed,topics_total")
      .in("subject_id", subjectIds);
    const map: Record<string, UnitProgress[]> = {};
    subjectIds.forEach(id => {
      map[id] = UNITS.map(u => {
        const found = data?.find(r => r.subject_id === id && r.unit_number === u);
        return { unit_number: u, topics_completed: found?.topics_completed ?? 0, topics_total: found?.topics_total ?? 10 };
      });
    });
    setUnitProgress(prev => ({ ...prev, ...map }));
  }, []);

  useEffect(() => { fetchStructure(); }, [fetchStructure]);

  useEffect(() => {
    if (!sectionId) return;
    const sectionSubjects = subjects.filter(s => s.section_id === sectionId);
    if (sectionSubjects.length > 0) fetchProgress(sectionSubjects.map(s => s.id));
  }, [sectionId, subjects, fetchProgress]);

  // Correct chained filtering
  const filteredYears = years.filter(y => y.department_id === deptId);
  const filteredYearIds = filteredYears.map(y => y.id);
  const filteredSections = sections.filter(s => filteredYearIds.includes(s.year_id) && s.year_id === yearId);
  const filteredSubjects = subjects.filter(s => s.section_id === sectionId);

  const getCompletion = (subjectId: string) => {
    const units = unitProgress[subjectId];
    if (!units) return 0;
    const total = units.reduce((a, u) => a + u.topics_total, 0);
    const done = units.reduce((a, u) => a + u.topics_completed, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const selectedSubject = filteredSubjects.find(s => s.id === selectedSubjectId);
  const selectedUnits = unitProgress[selectedSubjectId] || UNITS.map(u => ({ unit_number: u, topics_completed: 0, topics_total: 10 }));

  // Sort years in correct order
  const YEAR_ORDER = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sortedYears = [...filteredYears].sort((a, b) => YEAR_ORDER.indexOf(a.name) - YEAR_ORDER.indexOf(b.name));

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-1">
        {selectedSubject && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedSubjectId("")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <h1 className="text-2xl font-bold text-foreground">Syllabus Progress</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {selectedSubject ? "Unit-wise syllabus completion" : "Department-wide syllabus tracking"}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : departments.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No departments found. Create departments first.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {!selectedSubject && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department</label>
                <Select value={deptId} onValueChange={v => { setDeptId(v); setYearId(""); setSectionId(""); setSelectedSubjectId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Academic Year</label>
                <Select value={yearId} onValueChange={v => { setYearId(v); setSectionId(""); setSelectedSubjectId(""); }} disabled={!deptId}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>
                    {sortedYears.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Section</label>
                <Select value={sectionId} onValueChange={v => { setSectionId(v); setSelectedSubjectId(""); }} disabled={!yearId}>
                  <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                  <SelectContent>
                    {filteredSections.length === 0
                      ? <SelectItem value="none" disabled>No sections found</SelectItem>
                      : filteredSections.map(s => <SelectItem key={s.id} value={s.id}>Section {s.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {sectionId && !selectedSubject && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Card className="shadow-card">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{filteredSubjects.length}</p>
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
                      {filteredSubjects.length > 0
                        ? Math.round(filteredSubjects.reduce((a, s) => a + getCompletion(s.id), 0) / filteredSubjects.length)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Completion</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedSubject ? (
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedSubject.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedSubject.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{getCompletion(selectedSubject.id)}%</p>
                      <p className="text-xs text-muted-foreground">Overall Completion</p>
                    </div>
                  </div>
                  <Progress value={getCompletion(selectedSubject.id)} className="h-3" />
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Handling Staff</p>
                    <p className="text-xs text-muted-foreground">{selectedSubject.assigned_staff_name}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base">Unit-wise Progress</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {selectedUnits.map(unit => {
                      const pct = unit.topics_total > 0 ? Math.round((unit.topics_completed / unit.topics_total) * 100) : 0;
                      return (
                        <div key={unit.unit_number} className="text-center">
                          <div className={`px-4 py-2 rounded-full text-xs font-bold mb-1 min-w-[80px] ${
                            pct >= 80 ? "bg-green-100 text-green-700 border border-green-200" :
                            pct >= 50 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                            pct > 0 ? "bg-orange-100 text-orange-700 border border-orange-200" :
                            "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}>
                            {unit.topics_completed}/{unit.topics_total}
                          </div>
                          <p className="text-xs font-medium text-foreground">Unit {unit.unit_number}</p>
                          <p className="text-xs text-muted-foreground">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : sectionId ? (
            filteredSubjects.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-16 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No subjects in this section yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map(subject => {
                  const completion = getCompletion(subject.id);
                  return (
                    <Card key={subject.id} className="shadow-card cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedSubjectId(subject.id)}>
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
                          <p className="text-xs text-muted-foreground">{subject.assigned_staff_name}</p>
                        </div>
                        <Progress value={completion} className="h-2" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (
            <Card className="shadow-card">
              <CardContent className="py-16 text-center">
                <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a department, year and section to view subjects</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default HodProgress;
