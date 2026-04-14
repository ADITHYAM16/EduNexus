import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useStaff } from "@/contexts/StaffContext";
import InsightCard from "@/components/InsightCard";
import StatCard from "@/components/StatCard";
import { Brain, BarChart3, Users, Plus, Trash2, CheckCircle2, Circle, Loader2, TrendingUp, CalendarCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Todo { id: string; text: string; done: boolean; }
interface AttendanceSummary { staff_id: string; percentage: number; }

const HodAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { staffList } = useStaff();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Real stats from DB
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [avgSyllabus, setAvgSyllabus] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Fetch Todos
  const fetchTodos = useCallback(async () => {
    if (!user?.id) return;
    setTodosLoading(true);
    const { data } = await supabase
      .from("todos")
      .select("id,text,done")
      .eq("hod_id", user.id)
      .order("created_at");
    setTodos(data || []);
    setTodosLoading(false);
  }, [user?.id]);

  // ── Fetch Real Stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const staffIds = staffList.filter(s => s.role !== "ROLE_HOD").map(s => s.id);

    if (staffIds.length > 0) {
      // Attendance average
      const { data: attData } = await supabase
        .from("attendance")
        .select("staff_id,status")
        .in("staff_id", staffIds);

      if (attData && attData.length > 0) {
        const perStaff: Record<string, { total: number; present: number }> = {};
        attData.forEach(r => {
          if (!perStaff[r.staff_id]) perStaff[r.staff_id] = { total: 0, present: 0 };
          perStaff[r.staff_id].total++;
          if (r.status === "present") perStaff[r.staff_id].present++;
          if (r.status === "late") perStaff[r.staff_id].present += 0.5;
        });
        const pcts = Object.values(perStaff).map(s => Math.round((s.present / s.total) * 100));
        setAvgAttendance(Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length));
      }

      // Syllabus average
      const { data: subData } = await supabase.from("subjects").select("id");
      if (subData && subData.length > 0) {
        const { data: progData } = await supabase
          .from("syllabus_progress")
          .select("topics_completed,topics_total")
          .in("subject_id", subData.map(s => s.id));
        if (progData && progData.length > 0) {
          const total = progData.reduce((a, p) => a + p.topics_total, 0);
          const done = progData.reduce((a, p) => a + p.topics_completed, 0);
          setAvgSyllabus(total > 0 ? Math.round((done / total) * 100) : 0);
        }
      }
    }

    // Messages sent
    if (user?.id) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", user.id);
      setTotalMessages(count || 0);
    }

    setStatsLoading(false);
  }, [staffList, user?.id]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);
  useEffect(() => { if (staffList.length > 0) fetchStats(); }, [fetchStats, staffList]);

  // ── AI Insights generated from real data
  const generateInsights = () => {
    const insights: { type: "success" | "warning" | "info"; message: string }[] = [];
    const totalStaff = staffList.filter(s => s.role !== "ROLE_HOD").length;

    if (avgAttendance >= 85) insights.push({ type: "success", message: `Department attendance is excellent at ${avgAttendance}% — above the 85% benchmark.` });
    else if (avgAttendance >= 75) insights.push({ type: "warning", message: `Department attendance is at ${avgAttendance}%. Consider reviewing staff with low attendance.` });
    else if (avgAttendance > 0) insights.push({ type: "warning", message: `Department attendance is low at ${avgAttendance}%. Immediate action recommended.` });
    else insights.push({ type: "info", message: "No attendance data recorded yet. Staff should mark attendance from their portal." });

    if (avgSyllabus >= 80) insights.push({ type: "success", message: `Syllabus completion is strong at ${avgSyllabus}% across all subjects.` });
    else if (avgSyllabus >= 50) insights.push({ type: "info", message: `Syllabus completion is at ${avgSyllabus}%. Monitor progress to ensure timely completion.` });
    else if (avgSyllabus > 0) insights.push({ type: "warning", message: `Syllabus completion is only ${avgSyllabus}%. Staff should update their progress regularly.` });
    else insights.push({ type: "info", message: "No syllabus progress recorded yet. Staff should update unit progress from their portal." });

    if (totalStaff > 0) insights.push({ type: "info", message: `Department has ${totalStaff} active teaching staff members.` });
    if (totalMessages > 0) insights.push({ type: "success", message: `${totalMessages} messages sent to staff this session. Communication is active.` });

    return insights;
  };

  // ── Todo handlers
  const addTodo = async () => {
    if (!newTodo.trim() || !user?.id) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("todos")
      .insert({ hod_id: user.id, text: newTodo.trim(), done: false })
      .select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    setTodos(prev => [...prev, data]);
    setNewTodo(""); setShowAdd(false); setSaving(false);
  };

  const toggleTodo = async (id: string, done: boolean) => {
    await supabase.from("todos").update({ done: !done }).eq("id", id);
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t));
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const insights = generateInsights();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">AI-Powered Department Analytics</h1>
      <p className="text-muted-foreground text-sm mb-8">Strategic insights and predictive analytics for department excellence</p>

      {/* Stats from DB */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Staff" value={statsLoading ? "..." : staffList.filter(s => s.role !== "ROLE_HOD").length} icon={Users} variant="success" />
        <StatCard title="Avg Attendance" value={statsLoading ? "..." : `${avgAttendance}%`} icon={CalendarCheck} variant="primary" />
        <StatCard title="Syllabus Done" value={statsLoading ? "..." : `${avgSyllabus}%`} icon={TrendingUp} variant="warning" />
        <StatCard title="Messages Sent" value={statsLoading ? "..." : totalMessages} icon={BarChart3} variant="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* To-Do List */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">📋 Strategic To-Do List</h2>
            <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </Button>
          </div>

          {todosLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : todos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No tasks yet. Create one!</p>
          ) : (
            <div className="space-y-2">
              {todos.map(todo => (
                <div key={todo.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${todo.done ? "bg-muted/30 border-border/50" : "bg-background border-border"}`}>
                  <button onClick={() => toggleTodo(todo.id, todo.done)} className="shrink-0">
                    {todo.done
                      ? <CheckCircle2 className="w-5 h-5 text-success" />
                      : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    }
                  </button>
                  <span className={`flex-1 text-sm ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {todo.text}
                  </span>
                  <button onClick={() => deleteTodo(todo.id)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 text-xs text-muted-foreground">
            {todos.filter(t => t.done).length}/{todos.length} completed
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Department Performance Insights
          </h2>
          {statsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {insights.map((insight, i) => (
                <InsightCard key={i} type={insight.type} message={insight.message} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Enter task description..."
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTodo()}
              autoFocus
            />
            <Button onClick={addTodo} className="w-full" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodAnalytics;
