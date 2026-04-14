import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStaff } from "@/contexts/StaffContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, UserPlus, Trash2, Pencil, Loader2, ShieldCheck, GraduationCap, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { StaffMember } from "@/contexts/StaffContext";

const ROLES = [
  { value: "ROLE_HOD", label: "HOD" },
  { value: "ROLE_STAFF", label: "Staff" },
  { value: "ROLE_ASST_PROF", label: "Asst. Professor" },
];

const roleLabel = (role: string) => ROLES.find(r => r.value === role)?.label || role;
const roleColor = (role: string) => {
  if (role === "ROLE_HOD") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  if (role === "ROLE_ASST_PROF") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
};

const emptyForm = { name: "", email: "", password_hash: "", role: "ROLE_STAFF", department: "", subject: "" };

const HodStaffManagement: React.FC = () => {
  const { staffList, loading, addStaff, updateStaff, deleteStaff } = useStaff();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.subject?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const totalHod = staffList.filter(s => s.role === "ROLE_HOD").length;
  const totalStaff = staffList.filter(s => s.role !== "ROLE_HOD").length;

  // ── Add Staff
  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password_hash.trim()) {
      toast({ title: "Required", description: "Name, email and password are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const result = await addStaff({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password_hash: form.password_hash,
      role: form.role,
      department: form.department.trim(),
      subject: form.subject.trim(),
    });
    setSaving(false);
    if (!result.success) { toast({ title: "Error", description: result.error, variant: "destructive" }); return; }
    toast({ title: "Staff Added", description: `${form.name.trim()} has been added.` });
    setForm(emptyForm);
    setAddOpen(false);
  };

  // ── Edit Staff
  const handleEdit = async () => {
    if (!editForm) return;
    setSaving(true);
    const updates: Partial<StaffMember> = {
      name: editForm.name.trim(),
      email: editForm.email.trim().toLowerCase(),
      role: editForm.role,
      department: editForm.department?.trim(),
      subject: editForm.subject?.trim(),
    };
    if (editForm.password_hash?.trim()) updates.password_hash = editForm.password_hash.trim();
    const result = await updateStaff(editForm.id, updates);
    setSaving(false);
    if (!result.success) { toast({ title: "Error", description: result.error, variant: "destructive" }); return; }
    toast({ title: "Staff Updated" });
    setEditOpen(false);
    setEditForm(null);
  };

  // ── Delete Staff
  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    const result = await deleteStaff(deleteId);
    setSaving(false);
    if (!result.success) { toast({ title: "Error", description: result.error, variant: "destructive" }); return; }
    toast({ title: "Staff Deleted" });
    setDeleteId(null);
  };

  const deleteName = staffList.find(s => s.id === deleteId)?.name;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Add, edit and manage all staff members</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" /> Add Staff
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Members</p>
            <p className="text-xl font-bold text-foreground">{staffList.length}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">HOD</p>
            <p className="text-xl font-bold text-foreground">{totalHod}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teaching Staff</p>
            <p className="text-xl font-bold text-foreground">{totalStaff}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, subject or department..." value={search}
          onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">{search ? "No results found" : "No staff members yet"}</p>
            <p className="text-xs text-muted-foreground">{search ? "Try a different search term" : "Click \"Add Staff\" to add the first member"}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-semibold">Name</TableHead>
                <TableHead className="text-xs font-semibold">Email</TableHead>
                <TableHead className="text-xs font-semibold">Role</TableHead>
                <TableHead className="text-xs font-semibold">Department</TableHead>
                <TableHead className="text-xs font-semibold">Subject</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(staff => (
                <TableRow key={staff.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{staff.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-foreground text-sm">{staff.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{staff.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor(staff.role)}`}>
                      {roleLabel(staff.role)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{staff.department || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {staff.subject ? <><BookOpen className="w-3 h-3" />{staff.subject}</> : "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditForm({ ...staff }); setEditOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(staff.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Full Name *</Label>
              <Input placeholder="e.g. Prof. John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div><Label>Email *</Label>
              <Input type="email" placeholder="e.g. john@college.edu" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div><Label>Password *</Label>
              <Input type="password" placeholder="Set login password" value={form.password_hash} onChange={e => setForm(p => ({ ...p, password_hash: e.target.value }))} />
            </div>
            <div><Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Department</Label>
              <Input placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
            </div>
            <div><Label>Subject</Label>
              <Input placeholder="e.g. Data Structures" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add Staff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Staff — {editForm?.name}</DialogTitle></DialogHeader>
          {editForm && (
            <div className="space-y-3 py-2">
              <div><Label>Full Name</Label>
                <Input value={editForm.name} onChange={e => setEditForm(p => p ? { ...p, name: e.target.value } : p)} />
              </div>
              <div><Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm(p => p ? { ...p, email: e.target.value } : p)} />
              </div>
              <div><Label>New Password <span className="text-muted-foreground text-xs">(leave blank to keep current)</span></Label>
                <Input type="password" placeholder="Enter new password" value={editForm.password_hash || ""} onChange={e => setEditForm(p => p ? { ...p, password_hash: e.target.value } : p)} />
              </div>
              <div><Label>Role</Label>
                <Select value={editForm.role} onValueChange={v => setEditForm(p => p ? { ...p, role: v } : p)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Department</Label>
                <Input value={editForm.department || ""} onChange={e => setEditForm(p => p ? { ...p, department: e.target.value } : p)} />
              </div>
              <div><Label>Subject</Label>
                <Input value={editForm.subject || ""} onChange={e => setEditForm(p => p ? { ...p, subject: e.target.value } : p)} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleEdit} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleteName}</span>? This cannot be undone.
          </p>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodStaffManagement;
