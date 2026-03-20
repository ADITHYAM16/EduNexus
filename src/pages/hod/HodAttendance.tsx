import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockStaffList } from "@/data/mockData";
import { AlertTriangle, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const HodAttendance: React.FC = () => {
  const [warnStaff, setWarnStaff] = useState<typeof mockStaffList[0] | null>(null);
  const [message, setMessage] = useState("");

  const handleSendWarning = () => {
    if (!message.trim()) return;
    toast({ title: "Warning Sent", description: `Message sent to ${warnStaff?.name}` });
    setMessage("");
    setWarnStaff(null);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Attendance Monitoring</h1>
      <p className="text-muted-foreground text-sm mb-8">Track staff attendance across the department</p>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-4">Staff Attendance Report</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left py-3 pr-4 font-medium">Staff</th>
                <th className="text-left py-3 pr-4 font-medium">Subject</th>
                <th className="text-center py-3 pr-4 font-medium">Attendance %</th>
                <th className="text-center py-3 pr-4 font-medium">Status</th>
                <th className="text-center py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockStaffList.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{s.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.subject}</td>
                  <td className="py-3 pr-4 text-center font-mono text-foreground">{s.attendance}%</td>
                  <td className="py-3 pr-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      s.attendance >= 85 ? "bg-success/10 text-success" : s.attendance >= 75 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    }`}>
                      {s.attendance >= 85 ? "Good" : s.attendance >= 75 ? "Average" : "Low"}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setWarnStaff(s); setMessage(`Dear ${s.name},\n\nYour attendance is currently at ${s.attendance}%. Please ensure regular attendance.\n\nRegards,\nHOD`); }}
                      className="gap-1.5 text-warning border-warning/30 hover:bg-warning/10 hover:text-warning"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Warn
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!warnStaff} onOpenChange={() => setWarnStaff(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Send Warning to {warnStaff?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <Button onClick={handleSendWarning} className="w-full gap-2">
              <Send className="w-4 h-4" /> Send Warning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodAttendance;
