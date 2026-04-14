import React, { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { User, Mail, Building2, BookOpen, CalendarCheck, Award, Pencil, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_HOD: "Head of Department",
  ROLE_ASST_PROF: "Assistant Professor",
  ROLE_STAFF: "Staff",
};

const HodProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    role: (user?.role || "ROLE_HOD") as UserRole,
    specialization: "Artificial Intelligence",
    joiningDate: "June 2018",
  });
  const [saved, setSaved] = useState({ ...form });

  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const next = { ...form };
    await supabase.from("staff").update({ name: next.name, email: next.email, department: next.department }).eq("id", user?.id);
    setSaved(next);
    updateUser({ name: next.name, email: next.email, department: next.department, role: next.role });
    toast({ title: "Profile Updated" });
    setEditing(false);
  };

  const profileFields = [
    { label: "Full Name", value: saved.name, icon: User },
    { label: "Email", value: saved.email, icon: Mail },
    { label: "Department", value: saved.department, icon: Building2 },
    { label: "Role", value: ROLE_LABELS[saved.role], icon: Award },
    { label: "Specialization", value: saved.specialization, icon: BookOpen },
    { label: "Joining Date", value: saved.joiningDate, icon: CalendarCheck },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">My Profile</h1>
      <p className="text-muted-foreground text-sm mb-8">View and edit your profile information</p>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="relative w-20 h-20 shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
              {photo
                ? <img src={photo} alt="profile" className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-primary-foreground" />}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/80 transition-colors"
            >
              <Camera className="w-3 h-3 text-primary-foreground" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-foreground">{saved.name}</h2>
            <p className="text-sm text-muted-foreground">{saved.department}</p>
            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              Head of Department
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
            <Pencil className="w-4 h-4" /> Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profileFields.map((field) => (
            <div key={field.label} className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <field.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium text-foreground">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {[
              { key: "name", label: "Full Name" },
              { key: "email", label: "Email" },
              { key: "department", label: "Department" },
              { key: "specialization", label: "Specialization" },
              { key: "joiningDate", label: "Joining Date" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_HOD">Head of Department</SelectItem>
                  <SelectItem value="ROLE_ASST_PROF">Assistant Professor AI&DS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setForm({ ...saved }); setEditing(false); }}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodProfile;
