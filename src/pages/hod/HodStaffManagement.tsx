import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockStaffList } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarCheck, Users, TrendingUp, Search, UserPlus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { mockStaffSubjectProgress } from "@/data/mockData";
import { useStaff } from "@/contexts/StaffContext";

type Staff = typeof mockStaffList[0];

const HodStaffManagement: React.FC = () => {
  const { staffList, addStaff, deleteStaff } = useStaff();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Staff | null>(null);
  const [search, setSearch] = useState("");
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", subject: "", attendance: 0 });

  const handleAddStaff = () => {
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.subject.trim()) return;
    const id = `staff-${Date.now()}`;
    addStaff({ ...newStaff, id });
    setNewStaff({ name: "", email: "", subject: "", attendance: 0 });
    setAddStaffOpen(false);
  };

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  const getOverallComplete = (staffId: string) => {
    const subjects = mockStaffSubjectProgress[staffId] || [];
    if (!subjects.length) return 0;
    const total = subjects.reduce((a, s) => a + s.units.length, 0);
    const done = subjects.reduce((a, s) => a + s.units.filter(Boolean).length, 0);
    return Math.round((done / total) * 100);
  };

  const topAttendanceStaff = [...staffList].sort((a, b) => b.attendance - a.attendance)[0];
  const topSyllabusStaff = [...staffList].sort((a, b) => getOverallComplete(b.id) - getOverallComplete(a.id))[0];

  const openEdit = (staff: Staff, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({ ...staff });
    setEditMode(true);
  };
  const handleSave = () => { setEditMode(false); setEditForm(null); };
  const handleClose = () => { setEditMode(false); setEditForm(null); };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Monitor, manage and edit all staff members</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card cursor-pointer hover:border-primary/40 hover:shadow-elevated hover:scale-[1.02] hover:bg-primary/5 transition-all duration-200 group">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Staff</p>
            <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{staffList.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card cursor-pointer hover:border-success/40 hover:shadow-elevated hover:scale-[1.02] hover:bg-success/5 transition-all duration-200 group">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
            <CalendarCheck className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Highest Attendance</p>
            <p className="text-lg font-bold text-success">{topAttendanceStaff?.attendance}%</p>
            <p className="text-xs text-muted-foreground truncate max-w-[110px]">{topAttendanceStaff?.name}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card cursor-pointer hover:border-secondary/40 hover:shadow-elevated hover:scale-[1.02] hover:bg-secondary/5 transition-all duration-200 group">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Highest Syllabus</p>
            <p className="text-lg font-bold text-secondary">{getOverallComplete(topSyllabusStaff?.id)}%</p>
            <p className="text-xs text-muted-foreground truncate max-w-[110px]">{topSyllabusStaff?.name}</p>
          </div>
        </div>
        <div onClick={() => setAddStaffOpen(true)} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card cursor-pointer hover:border-primary/40 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Add New Staff</p>
            <p className="text-sm font-semibold text-primary">+ Add Member</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or subject..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Staff Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Staff Member</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Subject</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Attendance</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((staff, i) => {
              const isExpanded = expandedId === staff.id;
              const subjects = mockStaffSubjectProgress[staff.id] || [];
              const overall = getOverallComplete(staff.id);
              return (
                <React.Fragment key={staff.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : staff.id)}
                    className={`cursor-pointer hover:bg-muted/30 transition-colors ${
                      i !== filtered.length - 1 || isExpanded ? "border-b border-border" : ""
                    } ${isExpanded ? "bg-muted/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{staff.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-foreground">{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{staff.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        staff.attendance >= 85 ? "bg-success/10 text-success" : staff.attendance >= 75 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                      }`}>{staff.attendance}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(staff.id); }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </td>
                  </tr>

                  {/* Inline Expanded Detail */}
                  {isExpanded && (
                    <tr className={i !== filtered.length - 1 ? "border-b border-border" : ""}>
                      <td colSpan={4} className="px-4 py-4 bg-muted/10">
                        <div className="border border-border rounded-xl p-4 bg-card shadow-card">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-base font-bold text-primary">{staff.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm">{staff.name}</p>
                                <p className="text-xs text-muted-foreground">Associate Professor</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              overall >= 80 ? "bg-success/10 text-success border-success/30"
                              : overall >= 60 ? "bg-warning/10 text-warning border-warning/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                            }`}>{overall}% Complete</span>
                          </div>

                          {/* Subject Unit Pills */}
                          <div className="space-y-3">
                            {subjects.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-2">No subject data available.</p>
                            ) : subjects.map((sub) => {
                              const done = sub.units.filter(Boolean).length;
                              return (
                                <div key={sub.subject} className="border border-border rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-foreground">{sub.subject}</span>
                                    <span className="text-xs text-muted-foreground">{done}/{sub.units.length} units</span>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {sub.units.map((completed, idx) => (
                                      <span key={idx} className={`px-3 py-1 rounded-md text-xs font-semibold ${
                                        completed
                                          ? "bg-success/15 text-success"
                                          : "bg-muted text-muted-foreground"
                                      }`}>
                                        U{idx + 1}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No staff found.</p>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editMode} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff — {editForm?.name}</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 pt-2">
              {[
                { key: "name", label: "Full Name", type: "text" },
                { key: "email", label: "Email", type: "email" },
                { key: "subject", label: "Subject", type: "text" },
                { key: "attendance", label: "Attendance (%)", type: "number" },
                { key: "syllabus", label: "Syllabus (%)", type: "number" },
                { key: "tasksCompleted", label: "Tasks Completed", type: "number" },
                { key: "tasksPending", label: "Tasks Pending", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type={type}
                    value={editForm[key as keyof Staff] as string | number}
                    onChange={(e) =>
                      setEditForm((f) => f ? ({
                        ...f,
                        [key]: type === "number" ? Number(e.target.value) : e.target.value,
                      }) : f)
                    }
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-semibold text-foreground">{staffList.find(s => s.id === deleteConfirmId)?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => { deleteStaff(deleteConfirmId!); setDeleteConfirmId(null); }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { key: "name", label: "Full Name", type: "text", placeholder: "e.g. Prof. John Doe" },
              { key: "email", label: "Email", type: "email", placeholder: "e.g. john@college.edu" },
              { key: "subject", label: "Subject", type: "text", placeholder: "e.g. Machine Learning" },
              { key: "attendance", label: "Attendance (%)", type: "number", placeholder: "e.g. 85" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input type={type} placeholder={placeholder}
                  value={newStaff[key as keyof typeof newStaff]}
                  onChange={e => setNewStaff(prev => ({ ...prev, [key]: type === "number" ? Number(e.target.value) : e.target.value }))} />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setAddStaffOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddStaff}>Add Staff</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodStaffManagement;
