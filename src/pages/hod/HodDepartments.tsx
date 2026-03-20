import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollege } from "@/contexts/CollegeContext";
import { mockStaffList } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Building2, BookOpen, Users, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const HodDepartments: React.FC = () => {
  const { departments, addDepartment, addSection, addSubject } = useCollege();
  const [createDeptOpen, setCreateDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ deptId: "", yearId: "", name: "" });
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ deptId: "", yearId: "", sectionId: "", name: "", code: "", staffId: "" });

  const handleCreateDept = () => {
    if (!deptName.trim()) return;
    addDepartment(deptName.trim());
    toast({ title: "Department Created", description: `${deptName.trim()} has been created with 4 academic years.` });
    setDeptName("");
    setCreateDeptOpen(false);
  };

  const handleAddSection = () => {
    if (!sectionForm.deptId || !sectionForm.yearId || !sectionForm.name.trim()) return;
    addSection(sectionForm.deptId, sectionForm.yearId, sectionForm.name.trim());
    toast({ title: "Section Added", description: `Section ${sectionForm.name.trim()} added successfully.` });
    setSectionForm({ deptId: "", yearId: "", name: "" });
    setAddSectionOpen(false);
  };

  const handleAddSubject = () => {
    if (!subjectForm.deptId || !subjectForm.yearId || !subjectForm.sectionId || !subjectForm.name.trim() || !subjectForm.code.trim()) return;
    const staff = mockStaffList.find(s => s.id === subjectForm.staffId);
    addSubject(subjectForm.deptId, subjectForm.yearId, subjectForm.sectionId, {
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim(),
      assignedStaffId: subjectForm.staffId || "",
      assignedStaffName: staff?.name || "Unassigned",
    });
    toast({ title: "Subject Added", description: `${subjectForm.name.trim()} added successfully.` });
    setSubjectForm({ deptId: "", yearId: "", sectionId: "", name: "", code: "", staffId: "" });
    setAddSubjectOpen(false);
  };

  const selectedDeptForSection = departments.find(d => d.id === sectionForm.deptId);
  const selectedDeptForSubject = departments.find(d => d.id === subjectForm.deptId);
  const selectedYearForSubject = selectedDeptForSubject?.years.find(y => y.id === subjectForm.yearId);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage departments, sections, and subjects</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setCreateDeptOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create Department
          </Button>
          <Button variant="outline" onClick={() => setAddSectionOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Section
          </Button>
          <Button variant="outline" onClick={() => setAddSubjectOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>
      </div>

      {/* Department Cards */}
      <div className="space-y-6">
        {departments.map(dept => (
          <Card key={dept.id} className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" />
                {dept.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {dept.years.map(year => (
                  <div key={year.id} className="border border-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-secondary" />
                      {year.name}
                    </h3>
                    {year.sections.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No sections added yet</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {year.sections.map(section => (
                          <div key={section.id} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                Section {section.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{section.students.length} students</span>
                            </div>
                            {section.subjects.length > 0 ? (
                              <div className="space-y-1">
                                {section.subjects.map(sub => (
                                  <div key={sub.id} className="flex items-center justify-between text-xs">
                                    <span className="text-foreground flex items-center gap-1">
                                      <BookOpen className="w-3 h-3 text-primary" />
                                      {sub.code} - {sub.name}
                                    </span>
                                    <span className="text-muted-foreground truncate ml-2">{sub.assignedStaffName}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No subjects</p>
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

      {/* Create Department Dialog */}
      <Dialog open={createDeptOpen} onOpenChange={setCreateDeptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create New Department</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Department Name</Label>
              <Input placeholder="e.g. Information Technology" value={deptName} onChange={e => setDeptName(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">4 academic years (1st–4th) will be created automatically.</p>
            <Button className="w-full" onClick={handleCreateDept}>Create Department</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
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
            <Button className="w-full" onClick={handleAddSection}>Add Section</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Department</Label>
              <Select value={subjectForm.deptId} onValueChange={v => setSubjectForm({ ...subjectForm, deptId: v, yearId: "", sectionId: "" })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year</Label>
              <Select value={subjectForm.yearId} onValueChange={v => setSubjectForm({ ...subjectForm, yearId: v, sectionId: "" })} disabled={!subjectForm.deptId}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{selectedDeptForSubject?.years.map(y => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select value={subjectForm.sectionId} onValueChange={v => setSubjectForm({ ...subjectForm, sectionId: v })} disabled={!subjectForm.yearId}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>{selectedYearForSubject?.sections.map(s => <SelectItem key={s.id} value={s.id}>Section {s.name}</SelectItem>)}</SelectContent>
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
              <Select value={subjectForm.staffId} onValueChange={v => setSubjectForm({ ...subjectForm, staffId: v })}>
                <SelectTrigger><SelectValue placeholder="Select staff (optional)" /></SelectTrigger>
                <SelectContent>{mockStaffList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAddSubject}>Add Subject</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodDepartments;
