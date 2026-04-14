import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useStaff } from "@/contexts/StaffContext";
import { Users, CalendarCheck, Award, MessageSquare, ClipboardList, Loader2 } from "lucide-react";

interface Todo { id: string; text: string; done: boolean; }

const HodDashboard: React.FC = () => {
  const { user } = useAuth();
  const { staffList } = useStaff();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [topPerformer, setTopPerformer] = useState<{ name: string; pct: number } | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const staffIds = staffList.filter(s => s.role !== "ROLE_HOD").map(s => s.id);

    // Todos
    const { data: todoData } = await supabase
      .from("todos").select("id,text,done")
      .eq("hod_id", user.id).eq("done", false).order("created_at");
    setTodos(todoData || []);

    // Messages count
    const { count } = await supabase
      .from("messages").select("id", { count: "exact", head: true })
      .eq("sender_id", user.id);
    setMessageCount(count || 0);

    if (staffIds.length > 0) {
      // Attendance per staff
      const { data: attData } = await supabase
        .from("attendance").select("staff_id,status")
        .in("staff_id", staffIds);

      if (attData && attData.length > 0) {
        const perStaff: Record<string, { total: number; present: number }> = {};
        attData.forEach(r => {
          if (!perStaff[r.staff_id]) perStaff[r.staff_id] = { total: 0, present: 0 };
          perStaff[r.staff_id].total++;
          if (r.status === "present") perStaff[r.staff_id].present++;
          else if (r.status === "late") perStaff[r.staff_id].present += 0.5;
        });

        const pcts = Object.entries(perStaff).map(([id, s]) => ({
          id, pct: Math.round((s.present / s.total) * 100)
        }));

        const avg = Math.round(pcts.reduce((a, b) => a + b.pct, 0) / pcts.length);
        setAvgAttendance(avg);

        const top = pcts.reduce((a, b) => a.pct > b.pct ? a : b);
        const topStaff = staffList.find(s => s.id === top.id);
        if (topStaff) setTopPerformer({ name: topStaff.name.replace("Prof. ", "").replace("Dr. ", ""), pct: top.pct });
      }
    }

    setLoading(false);
  }, [user?.id, staffList]);

  useEffect(() => { if (staffList.length > 0) fetchData(); }, [fetchData, staffList]);

  const teachingStaff = staffList.filter(s => s.role !== "ROLE_HOD").length;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Department Overview</h1>
      <p className="text-muted-foreground text-sm mb-8">{user?.department || "Department Dashboard"}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Staff" value={teachingStaff} icon={Users} variant="primary" linkTo="/hod/staff" />
        <StatCard title="Avg Attendance" value={loading ? "..." : `${avgAttendance}%`} icon={CalendarCheck} variant="success" linkTo="/hod/attendance" />
        <StatCard title="Top Performer" value={loading ? "..." : topPerformer?.name || "No data"} icon={Award} variant="success" subtitle={topPerformer ? `${topPerformer.pct}% attendance` : "Mark attendance first"} linkTo="/hod/attendance" />
        <StatCard title="Messages Sent" value={loading ? "..." : messageCount} icon={MessageSquare} variant="primary" subtitle="Total sent" linkTo="/hod/communication" />
      </div>

      {/* Pending Tasks */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" /> Pending Tasks
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : todos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">All tasks completed! 🎉</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((item, i) => (
              <li key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border text-sm text-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                {item.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HodDashboard;
