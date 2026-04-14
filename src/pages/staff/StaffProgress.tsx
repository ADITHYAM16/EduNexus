import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, GraduationCap, Pencil, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subject { id: string; name: string; code: string; assigned_staff_name: string; section_id: string; }
interface Section { id: string; name: string; year_id: string; }
interface Year { id: string; name: string; department_id: string; }
interface Department { id: string; name: string; }
interface UnitProgress { unit_number: number; topics_completed: number; topics_total: number; }

const UNITS = [1, 2, 3, 4, 5];

const StaffProgress: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [unitProgress, setUnitProgress] = useState<Record<string, UnitProgress[]>>({});
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [editUnits, setEditUnits] = useState<UnitProgress[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.name) return;
    setLoading(true);

    const [{ data: depts }, { data: yrs }, { data: secs }, { data: subs }] = await Promise.all([
      supabase.from("departments").select("id,name"),
      supabase.from("years").select("id,name,department_id"),
      supabase.from("sections").select("id,name,year_id"),
      supabase.from("subjects").select("id,name,code,assigned_staff_name,section_id")
        .eq("assigned_staff_name", user.name),
    ]);

    setDepartments(depts || []);
    setYears(yrs || []);
    setSections(secs || []);
    setSubjects(subs || []);

    if (subs && subs.length > 0) {
      const { data: progress } = await supabase
        .from("syllabus_progress")
        .select("subject_id,unit_number,topics_completed,topics_total")
        .in("subject_id", subs.map(s => s.id));

      const map: Record<string, UnitProgress[]> = {};
      subs.forEach(sub => {
        map[sub.id] = UNITS.map(u => {
          const found = progress?.find(r => r.subject_id === sub.id && r.unit_number === u);
          return { unit_number: u, topics_completed: found?.topics_completed ?? 0, topics_total: found?.topics_total ?? 10 };
        });
      });
      setUnitProgress(map);
    }
    setLoading(false);
  }, [user?.name]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getCompletion = (subjectId: string) => {
    const units = unitProgress[subjectId];
    if (!units) return 0;
    const total = units.reduce((a, u) => a + u.topics_total, 0);
    const done = units.reduce((a, u) => a + u.topics_completed, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const getSubjectLocation = (subject: Subject) => {
    const section = sections.find(s => s.id === subject.section_id);
    const year = years.find(y => y.id === section?.year_id);
    const dept = departments.find(d => d.id === year?.department_id);
    return `${dept?.name || ""} • ${year?.name || ""} • Section ${section?.name || ""}`;
  };

  const openEdit = (subject: Subject) => {
    setEditSubject(subject);
    setEditUnits(unitProgress[subject.id] || UNITS.map(u => ({ unit_number: u, topics_completed: 0, topics_total: 10 })));
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editSubject || !user?.id) return;
    setSaving(true);
    const upserts = editUnits.map(u => ({
      subject_id: editSubject.id,
      staff_id: user.id,
      unit_number: u.unit_number,
      topics_completed: Math.min(u.topics_completed, u.topics_total),
      topics_total: u.topics_total,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("syllabus_progress").upsert(upserts, { onConflict: "subject_id,unit_number" });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Progress Updated", description: `${editSubject.name} syllabus progress saved.` });
    setEditOpen(false);
    fetchData();
  };

  const overallAvg = subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + getCompletion(s.id), 0) / subjects.length)
    : 0;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Syllabus Progress</h1>
      <p className="text-sm text-muted-foreground mb-6">Update and track your subject syllabus completion</p>

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
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
                  <p className="text-xs text-muted-foreground">Assigned Subjects</p>
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
                  <p className="text-xs text-muted-foreground">Overall Completion</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subject Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(subject => {
              const completion = getCompletion(subject.id);
              const units = unitProgress[subject.id] || UNITS.map(u => ({ unit_number: u, topics_completed: 0, topics_total: 10 }));
              return (
                <Card key={subject.id} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold">{subject.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{subject.code}</p>
                        <p className="text-xs text-muted-foreground">{getSubjectLocation(subject)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={completion >= 80 ? "default" : completion >= 50 ? "secondary" : "destructive"} className="text-xs">
                          {completion}%
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 px-2 gap-1 text-xs" onClick={() => openEdit(subject)}>
                          <Pencil className="w-3 h-3" /> Update
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={completion} className="h-2 mb-3" />
                    <div className="flex gap-2 flex-wrap">
                      {units.map(unit => {
                        const pct = unit.topics_total > 0 ? Math.round((unit.topics_completed / unit.topics_total) * 100) : 0;
                        return (
                          <div key={unit.unit_number} className="text-center">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold min-w-[60px] ${
                              pct >= 80 ? "bg-green-100 text-green-700 border border-green-200" :
                              pct >= 50 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                              pct > 0 ? "bg-orange-100 text-orange-700 border border-orange-200" :
                              "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}>
                              {unit.topics_completed}/{unit.topics_total}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">U{unit.unit_number}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Edit Progress Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Syllabus — {editSubject?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editUnits.map((unit, i) => (
              <div key={unit.unit_number} className="border border-border rounded-lg p-3">
                <p className="text-sm font-semibold text-foreground mb-2">Unit {unit.unit_number}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Topics Completed</Label>
                    <Input type="number" min={0} max={unit.topics_total}
                      value={unit.topics_completed}
                      onChange={e => {
                        const val = Math.min(parseInt(e.target.value) || 0, unit.topics_total);
                        setEditUnits(prev => prev.map((u, idx) => idx === i ? { ...u, topics_completed: val } : u));
                      }} />
                  </div>
                  <div>
                    <Label className="text-xs">Total Topics</Label>
                    <Input type="number" min={1} max={20}
                      value={unit.topics_total}
                      onChange={e => {
                        const val = Math.max(1, parseInt(e.target.value) || 10);
                        setEditUnits(prev => prev.map((u, idx) => idx === i ? { ...u, topics_total: val } : u));
                      }} />
                  </div>
                </div>
                <Progress value={unit.topics_total > 0 ? Math.round((unit.topics_completed / unit.topics_total) * 100) : 0} className="h-1.5 mt-2" />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StaffProgress;
