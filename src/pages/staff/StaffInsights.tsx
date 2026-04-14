import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InsightCard from "@/components/InsightCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, Plus, Trash2, Check, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface Todo { id: string; text: string; done: boolean; }
interface SubjectProgress { name: string; code: string; completion: number; }

const StaffInsights: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [attendance, setAttendance] = useState(0);
  const [syllabus, setSyllabus] = useState(0);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user?.id || !user?.name) return;
    setStatsLoading(true);

    // Attendance
    const { data: attData } = await supabase
      .from("attendance").select("status").eq("staff_id", user.id);
    if (attData && attData.length > 0) {
      const present = attData.filter(r => r.status === "present").length;
      const late = attData.filter(r => r.status === "late").length;
      setAttendance(Math.round(((present + late * 0.5) / attData.length) * 100));
    }

    // Syllabus per subject
    const { data: subs } = await supabase
      .from("subjects").select("id,name,code")
      .eq("assigned_staff_name", user.name);

    if (subs && subs.length > 0) {
      const { data: prog } = await supabase
        .from("syllabus_progress").select("subject_id,topics_completed,topics_total")
        .in("subject_id", subs.map(s => s.id));

      const subProgs: SubjectProgress[] = subs.map(sub => {
        const units = prog?.filter(p => p.subject_id === sub.id) || [];
        const total = units.reduce((a, u) => a + u.topics_total, 0);
        const done = units.reduce((a, u) => a + u.topics_completed, 0);
        return { name: sub.name, code: sub.code, completion: total > 0 ? Math.round((done / total) * 100) : 0 };
      });
      setSubjectProgress(subProgs);
      const avgSyllabus = subProgs.length > 0
        ? Math.round(subProgs.reduce((a, s) => a + s.completion, 0) / subProgs.length) : 0;
      setSyllabus(avgSyllabus);
    }

    // Unread messages
    const { count } = await supabase
      .from("messages").select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id).eq("is_read", false);
    setUnreadMessages(count || 0);

    setStatsLoading(false);
  }, [user?.id, user?.name]);

  const fetchTodos = useCallback(async () => {
    if (!user?.id) return;
    setTodosLoading(true);
    const { data } = await supabase
      .from("todos").select("id,text,done")
      .eq("hod_id", user.id).order("created_at");
    setTodos(data || []);
    setTodosLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchStats(); fetchTodos(); }, [fetchStats, fetchTodos]);

  // AI Insights from real data
  const insights = [
    attendance >= 85
      ? { type: "success" as const, message: `Your attendance is excellent at ${attendance}%. Keep it up!` }
      : attendance >= 75
      ? { type: "warning" as const, message: `Attendance is ${attendance}%. Aim for above 85%.` }
      : attendance > 0
      ? { type: "warning" as const, message: `Attendance is low at ${attendance}%. Mark attendance regularly.` }
      : { type: "info" as const, message: "No attendance recorded yet. Mark from the Attendance page." },
    syllabus >= 80
      ? { type: "success" as const, message: `Syllabus completion is strong at ${syllabus}% across all subjects.` }
      : syllabus >= 50
      ? { type: "info" as const, message: `Syllabus is ${syllabus}% complete. Keep updating unit progress.` }
      : syllabus > 0
      ? { type: "warning" as const, message: `Syllabus completion is only ${syllabus}%. Update progress regularly.` }
      : { type: "info" as const, message: "No syllabus progress yet. Update from the Syllabus page." },
    unreadMessages > 0
      ? { type: "info" as const, message: `You have ${unreadMessages} unread message${unreadMessages > 1 ? "s" : ""} from HOD.` }
      : { type: "success" as const, message: "You're all caught up with messages!" },
  ];

  const addTodo = async () => {
    if (!newTask.trim() || !user?.id) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("todos").insert({ hod_id: user.id, text: newTask.trim(), done: false })
      .select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    setTodos(prev => [...prev, data]);
    setNewTask(""); setDialogOpen(false); setSaving(false);
  };

  const toggleTodo = async (id: string, done: boolean) => {
    await supabase.from("todos").update({ done: !done }).eq("id", id);
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t));
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">AI Teaching Assistant</h1>
      <p className="text-muted-foreground text-sm mb-8">AI-powered insights based on your real data</p>

      {/* Subject Progress Overview */}
      {!statsLoading && subjectProgress.length > 0 && (
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Subject Syllabus Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectProgress.map((sub, i) => (
                <div key={i} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">{sub.code}</p>
                    </div>
                    <Badge variant={sub.completion >= 80 ? "default" : sub.completion >= 50 ? "secondary" : "destructive"} className="text-xs">
                      {sub.completion}%
                    </Badge>
                  </div>
                  <Progress value={sub.completion} className="h-2 mb-1" />
                  {sub.completion < 50 && (
                    <div className="flex items-start gap-1 mt-2">
                      <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">Update unit progress to stay on track.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Performance Analysis</h2>
              <p className="text-xs text-muted-foreground">Based on your real data</p>
            </div>
          </div>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <InsightCard key={i} type={insight.type} message={insight.message} />
              ))}
            </div>
          )}
        </div>

        {/* To-Do List */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">My To-Do List</h2>
            <button onClick={() => setDialogOpen(true)}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {todosLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {todos.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No tasks yet</p>}
              {todos.map(todo => (
                <div key={todo.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${todo.done ? "bg-muted/30 border-border" : "bg-muted/10 border-border"}`}>
                  <button onClick={() => toggleTodo(todo.id, todo.done)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${todo.done ? "bg-success border-success" : "border-muted-foreground/40 hover:border-primary"}`}>
                    {todo.done && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`flex-1 text-sm ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{todo.text}</span>
                  <button onClick={() => deleteTodo(todo.id)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">{todos.filter(t => t.done).length}/{todos.length} completed</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <Input placeholder="Task description..." value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()} autoFocus />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addTodo} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StaffInsights;
