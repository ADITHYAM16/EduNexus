import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockStaffList } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpen, CalendarCheck, ClipboardList, Pencil } from "lucide-react";

type Staff = typeof mockStaffList[0];

const HodStaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState(mockStaffList);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Staff | null>(null);

  const openView = (staff: Staff) => {
    setSelected(staff);
    setEditMode(false);
  };

  const openEdit = (staff: Staff, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(staff);
    setEditForm({ ...staff });
    setEditMode(true);
  };

  const handleSave = () => {
    if (!editForm) return;
    setStaffList((list) => list.map((s) => (s.id === editForm.id ? editForm : s)));
    setSelected(editForm);
    setEditMode(false);
  };

  const handleClose = () => {
    setSelected(null);
    setEditMode(false);
    setEditForm(null);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Staff Management</h1>
      <p className="text-muted-foreground text-sm mb-8">Monitor and edit all staff members</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList.map((staff) => (
          <div
            key={staff.id}
            onClick={() => openView(staff)}
            className="bg-card border border-border rounded-xl p-5 shadow-card animate-fade-in cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{staff.name}</h3>
                <p className="text-xs text-muted-foreground">{staff.subject}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  staff.attendance >= 85 ? "bg-success/10 text-success" : staff.attendance >= 75 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                }`}>
                  {staff.attendance}% att.
                </span>
                <button
                  onClick={(e) => openEdit(staff, e)}
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Syllabus Progress</span>
                  <span className="font-medium text-foreground">{staff.syllabus}%</span>
                </div>
                <Progress value={staff.syllabus} className="h-2" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tasks: {staff.tasksCompleted} done, {staff.tasksPending} pending</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={!!selected && !editMode} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-lg">{selected?.name}</DialogTitle>
              <Button variant="outline" size="sm" onClick={() => { setEditForm({ ...selected! }); setEditMode(true); }} className="gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
            </div>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{selected.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> Subject</div>
                  <p className="text-sm font-medium text-foreground">{selected.subject}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarCheck className="w-3.5 h-3.5" /> Attendance</div>
                  <p className={`text-sm font-bold ${selected.attendance >= 85 ? "text-success" : selected.attendance >= 75 ? "text-warning" : "text-destructive"}`}>{selected.attendance}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> Syllabus</div>
                  <p className={`text-sm font-bold ${selected.syllabus >= 80 ? "text-success" : selected.syllabus >= 60 ? "text-warning" : "text-destructive"}`}>{selected.syllabus}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><ClipboardList className="w-3.5 h-3.5" /> Tasks</div>
                  <p className="text-sm font-medium text-foreground">{selected.tasksCompleted} done, {selected.tasksPending} pending</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Syllabus Progress</p>
                <Progress value={selected.syllabus} className="h-2.5" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </DashboardLayout>
  );
};

export default HodStaffManagement;
