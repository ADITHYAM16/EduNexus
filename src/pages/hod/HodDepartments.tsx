import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Building2, BookOpen, Users, GraduationCap, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subject { id: string; name: string; code: string; assigned_staff_name: string; }
interface Section { id: string; name: string; subjects: Subject[]; }
interface Year { id: string; name: string; sections: Section[]; }
interface Department { id: string; name: string; years: Year[]; }

const YEAR_NAMES = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const HodDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createDeptOpen, setCreateDeptOpen] = useState(false);
  const [editDeptOpen, setEditDeptOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editSubjectOpen, setEditSubjectOpen] = useState(false);

  // Staff list from DB
  const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);

  // Form states
  const [deptName, setDeptName] = useState("");
  const [editDept, setEditDept] = useState<{ id: string; name: string } | null>(null);
  const [sectionForm, setSectionForm] = useState({ deptId: "", yearId: "", name: "" });
  const [subjectForm, setSubjectForm] = useState({ sectionId: "", name: "", code: "", assigned_staff_name: "" });
  const [editSubject, setEditSubject] = useState<Subject & { sectionId: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Fetch all data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: depts } = await supabase.from("departments").select("id, name").order("created_at");
    if (!depts) { setLoading(false); return; }

    const full: Department[] = await Promise.all(
      depts.map(async (dept) => {
        const { data: years } = await supabase.from("years").select("id, name").eq("department_id", dept.id).order("name");
        const fullYears: Year[] = await Promise.all(
          (years || []).map(async (year) => {
            const { data: sections } = await supabase.from("sections").select("id, name").eq("year_id", year.id).order("name");
            const fullSections: Section[] = await Promise.all(
              (sections || []).map(async (section) => {
                const { data: subjects } = await supabase.from("subjects").select("id, name, code, assigned_staff_name").eq("section_id", section.id).order("code");
                return { ...section, subjects: subjects || [] };
              })
            );
            return { ...year, sections: fullSections };
          })
        );
        return { ...dept, years: fullYears };
      })
    );
    setDepartments(full);
    setLoading(false);
  }, []);

  // Fetch staff list
  const fetchStaff = useCallback(async () => {
    const { data } = await supabase
      .from("staff")
      .select("id, name")
      .neq("role", "ROLE_HOD")
      .order("name");
    setStaffList(data || []);
  }, []);

  useEffect(() => { fetchAll(); fetchStaff(); }, [fetchAll, fetchStaff]);

  // ── Create Department + auto-create 4 years
  const handleCreateDept = async () => {
    if (!deptName.trim()) return;
    setSaving(true);
    const { data: dept, error } = await supabase.from("departments").insert({ name: deptName.trim() }).select().single();
    if (error || !dept) { toast({ title: "Error", description: error?.message, variant: "destructive" }); setSaving(false); return; }

    await Promise.all(YEAR_NAMES.map(y => supabase.from("years").insert({ department_id: dept.id, name: y })));
    toast({ title: "Department Created", description: `${deptName.trim()} created with 4 years.` });
    setDeptName(""); setCreateDeptOpen(false); setSaving(false);
    fetchAll();
  };

  // ── Rename Department
  const handleRenameDept = async () => {
    if (!editDept?.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("departments").update({ name: editDept.name.trim() }).eq("id", editDept.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: "Department Renamed" });
    setEditDeptOpen(false); setEditDept(null); setSaving(false);
    fetchAll();
  };

  // ── Delete Department
  const handleDeleteDept = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its data?`)) return;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Department Deleted" });
    fetchAll();
  };

  // ── Add Section
  const handleAddSection = async () => {
    if (!sectionForm.yearId || !sectionForm.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("sections").insert({ year_id: sectionForm.yearId, name: sectionForm.name.trim() });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: "Section Added", description: `Section ${sectionForm.name.trim()} added.` });
    setSectionForm({ deptId: "", yearId: "", name: "" }); setAddSectionOpen(false); setSaving(false);
    fetchAll();
  };

  // ── Delete Section
  const handleDeleteSection = async (id: string, name: string) => {
    if (!confirm(`Delete Section ${name}?`)) return;
    const { error } = await supabase.from("sections").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Section Deleted" });
    fetchAll();
  };

  // ── Add Subject
  const handleAddSubject = async () => {
    if (!subjectForm.sectionId || !subjectForm.name.trim() || !subjectForm.code.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("subjects").insert({
      section_id: subjectForm.sectionId,
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim(),
      assigned_staff_name: subjectForm.assigned_staff_name.trim() || "Unassigned",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: "Subject Added", description: `${subjectForm.name.trim()} added.` });
    setSubjectForm({ sectionId: "", name: "", code: "", assigned_staff_name: "" }); setAddSubjectOpen(false); setSaving(false);
    fetchAll();
  };

  // ── Edit Subject
  const handleEditSubject = async () => {
    if (!editSubject) return;
    setSaving(true);
    const { error } = await supabase.from("subjects").update({
      name: editSubject.name.trim(),
      code: editSubject.code.trim(),
      assigned_staff_name: editSubject.assigned_staff_name.trim() || "Unassigned",
    }).eq("id", editSubject.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: "Subject Updated" });
    setEditSubjectOpen(false); setEditSubject(null); setSaving(false);
    fetchAll();
  };

  // ── Delete Subject
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Delete subject "${name}"?`)) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Subject Deleted" });
    fetchAll();
  };

  const selectedDeptForSection = departments.find(d => d.id === sectionForm.deptId);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Management</h1>
          <p className="text-sm text-muted-foreground">Manually manage departments, years, sections and subjects</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setCreateDeptOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Department
          </Button>
          <Button variant="outline" onClick={() => setAddSectionOpen(true)} className="gap-2" disabled={departments.length === 0}>
            <Plus className="w-4 h-4" /> Add Section
          </Button>
          <Button variant="outline" onClick={() => setAddSubjectOpen(true)} className="gap-2" disabled={departments.length === 0}>
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">No Departments Yet</h2>
          <p className="text-sm text-muted-foreground mb-4">Click "New Department" to get started.</p>
          <Button onClick={() => setCreateDeptOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> New Department</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {departments.map(dept => (
            <Card key={dept.id} className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                  {dept.name}
                  <button onClick={() => { setEditDept({ id: dept.id, name: dept.name }); setEditDeptOpen(true); }}
                    className="ml-1 text-muted-foreground hover:text-primary transition-colors" title="Rename">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteDept(dept.id, dept.name)}
                    className="ml-1 text-destructive hover:text-destructive/80 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {dept.years.map(year => (
                    <div key={year.id} className="border border-border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        {year.name}
                      </h3>
                      {year.sections.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No sections — click "Add Section" to add one.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {year.sections.map(section => (
                            <div key={section.id} className="bg-muted/40 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                  Section {section.name}
                                </span>
                                <button onClick={() => handleDeleteSection(section.id, section.name)}
                                  className="text-destructive hover:text-destructive/80 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {section.subjects.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">No subjects yet.</p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-xs py-1 px-2">Code</TableHead>
                                      <TableHead className="text-xs py-1 px-2">Subject</TableHead>
                                      <TableHead className="text-xs py-1 px-2">Staff</TableHead>
                                      <TableHead className="text-xs py-1 px-2"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {section.subjects.map(sub => (
                                      <TableRow key={sub.id}>
                                        <TableCell className="text-xs py-1 px-2 font-mono">{sub.code}</TableCell>
                                        <TableCell className="text-xs py-1 px-2">{sub.name}</TableCell>
                                        <TableCell className="text-xs py-1 px-2 text-muted-foreground">{sub.assigned_staff_name}</TableCell>
                                        <TableCell className="text-xs py-1 px-2">
                                          <div className="flex gap-1">
                                            <button onClick={() => { setEditSubject({ ...sub, sectionId: section.id }); setEditSubjectOpen(true); }}
                                              className="text-muted-foreground hover:text-primary transition-colors">
                                              <Pencil className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => handleDeleteSubject(sub.id, sub.name)}
                                              className="text-destructive hover:text-destructive/80 transition-colors">
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Department */}
      <Dialog open={createDeptOpen} onOpenChange={setCreateDeptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create New Department</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Department Name</Label>
              <Input placeholder="e.g. Information Technology" value={deptName} onChange={e => setDeptName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreateDept()} />
            </div>
            <p className="text-xs text-muted-foreground">4 academic years (1st–4th) will be created automatically.</p>
            <Button className="w-full" onClick={handleCreateDept} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Department
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Department */}
      <Dialog open={editDeptOpen} onOpenChange={setEditDeptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Rename Department</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Department Name</Label>
              <Input value={editDept?.name || ""} onChange={e => setEditDept(prev => prev ? { ...prev, name: e.target.value } : prev)}
                onKeyDown={e => e.key === "Enter" && handleRenameDept()} />
            </div>
            <Button className="w-full" onClick={handleRenameDept} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Section */}
      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Section</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Department</Label>
              <Select value={sectionForm.deptId} onValueChange={v => setSectionForm({ ...sectionForm, deptId: v, yearId: "" })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year</Label>
              <Select value={sectionForm.yearId} onValueChange={v => setSectionForm({ ...sectionForm, yearId: v })} disabled={!sectionForm.deptId}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{selectedDeptForSection?.years.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section Name</Label>
              <Input placeholder="e.g. A, B, C" value={sectionForm.name} onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleAddSection} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subject */}
      <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Select Section</Label>
              <Select value={subjectForm.sectionId} onValueChange={v => setSubjectForm({ ...subjectForm, sectionId: v })}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    dept.years.map(year => (
                      year.sections.map(sec => (
                        <SelectItem key={sec.id} value={sec.id}>
                          {dept.name} → {year.name} → Section {sec.name}
                        </SelectItem>
                      ))
                    ))
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject Name</Label>
              <Input placeholder="e.g. Artificial Intelligence" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Subject Code</Label>
              <Input placeholder="e.g. CS501" value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} />
            </div>
            <div>
              <Label>Assign Staff</Label>
              <Select value={subjectForm.assigned_staff_name} onValueChange={v => setSubjectForm({ ...subjectForm, assigned_staff_name: v })}>
                <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  {staffList.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAddSubject} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add Subject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subject */}
      <Dialog open={editSubjectOpen} onOpenChange={setEditSubjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Subject</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Subject Name</Label>
              <Input value={editSubject?.name || ""} onChange={e => setEditSubject(prev => prev ? { ...prev, name: e.target.value } : prev)} />
            </div>
            <div>
              <Label>Subject Code</Label>
              <Input value={editSubject?.code || ""} onChange={e => setEditSubject(prev => prev ? { ...prev, code: e.target.value } : prev)} />
            </div>
            <div>
              <Label>Assign Staff</Label>
              <Select value={editSubject?.assigned_staff_name || ""} onValueChange={v => setEditSubject(prev => prev ? { ...prev, assigned_staff_name: v } : prev)}>
                <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  {staffList.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleEditSubject} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodDepartments;
