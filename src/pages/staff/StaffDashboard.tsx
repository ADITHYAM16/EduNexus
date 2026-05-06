import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import InsightCard from "@/components/InsightCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarCheck, BookOpen, Brain, MessageSquare, Loader2, GraduationCap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TestResult } from "@/contexts/StudentContext";

interface Message { id: string; subject: string; body: string; created_at: string; }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState(0);
  const [syllabus, setSyllabus] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chartData, setChartData] = useState<{ week: string; percentage: number }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Student test results visible to staff
  const studentResults: TestResult[] = (() => {
    try { return JSON.parse(localStorage.getItem("student_test_results") || "[]"); } catch { return []; }
  })();
  const sectionResults = studentResults.filter(r => r.department === user?.department);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    // Attendance
    const { data: attData } = await supabase
      .from("attendance").select("date,status")
      .eq("staff_id", user.id).order("date", { ascending: false });

    if (attData && attData.length > 0) {
      const total = attData.length;
      const present = attData.filter(r => r.status === "present").length;
      const late = attData.filter(r => r.status === "late").length;
      setAttendance(Math.round(((present + late * 0.5) / total) * 100));

      // Monthly chart
      const monthly = MONTHS.map((month, i) => {
        const mr = attData.filter(r => new Date(r.date).getMonth() === i);
        const t = mr.length;
        const p = mr.filter(r => r.status === "present").length;
        const l = mr.filter(r => r.status === "late").length;
        return { week: month, percentage: t > 0 ? Math.round(((p + l * 0.5) / t) * 100) : 0 };
      });
      setChartData(monthly);
    }

    // Syllabus progress
    const { data: subData } = await supabase
      .from("subjects").select("id")
      .eq("assigned_staff_name", user.name);

    if (subData && subData.length > 0) {
      const { data: progData } = await supabase
        .from("syllabus_progress").select("topics_completed,topics_total")
        .in("subject_id", subData.map(s => s.id));
      if (progData && progData.length > 0) {
        const total = progData.reduce((a, p) => a + p.topics_total, 0);
        const done = progData.reduce((a, p) => a + p.topics_completed, 0);
        setSyllabus(total > 0 ? Math.round((done / total) * 100) : 0);
      }
    }

    // Messages
    const { data: msgData } = await supabase
      .from("messages").select("id,subject,body,created_at,is_read")
      .eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(3);
    setMessages(msgData || []);
    setUnreadCount((msgData || []).filter((m: any) => !m.is_read).length);

    setLoading(false);
  }, [user?.id, user?.name]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // AI Insights from real data
  const insights = [
    attendance >= 85
      ? { type: "success" as const, message: `Your attendance is excellent at ${attendance}%. Keep it up!` }
      : attendance >= 75
      ? { type: "warning" as const, message: `Your attendance is ${attendance}%. Try to improve to stay above 85%.` }
      : attendance > 0
      ? { type: "warning" as const, message: `Your attendance is low at ${attendance}%. Please mark attendance regularly.` }
      : { type: "info" as const, message: "No attendance recorded yet. Mark your attendance from the Attendance page." },
    syllabus >= 80
      ? { type: "success" as const, message: `Syllabus completion is strong at ${syllabus}%. Great progress!` }
      : syllabus >= 50
      ? { type: "info" as const, message: `Syllabus is ${syllabus}% complete. Keep updating your unit progress.` }
      : syllabus > 0
      ? { type: "warning" as const, message: `Syllabus completion is only ${syllabus}%. Update your progress from Syllabus page.` }
      : { type: "info" as const, message: "No syllabus progress yet. Update your unit progress from the Syllabus page." },
    unreadCount > 0
      ? { type: "info" as const, message: `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""} from HOD.` }
      : { type: "success" as const, message: "You're all caught up with messages!" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ").pop()}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Attendance" value={loading ? "..." : `${attendance}%`} icon={CalendarCheck} variant="primary" linkTo="/staff/attendance" />
        <StatCard title="Syllabus Done" value={loading ? "..." : `${syllabus}%`} icon={BookOpen} variant="warning" linkTo="/staff/academic" />
        <StatCard title="Messages" value={loading ? "..." : messages.length} icon={MessageSquare} subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All read"} linkTo="/staff/messages" />
        <StatCard title="AI Insights" value={insights.length} icon={Brain} variant="success" subtitle="View insights" linkTo="/staff/insights" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Attendance Trend</h2>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">🤖 AI Insights</h2>
          {insights.map((insight, i) => (
            <InsightCard key={i} type={insight.type} message={insight.message} />
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="mt-6 bg-card border border-border rounded-xl p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-3">Recent Messages</h2>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{msg.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{msg.body}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student MCQ Test Scores */}
      {sectionResults.length > 0 && (
        <div className="mt-6 bg-card border border-border rounded-xl p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Student MCQ Scores — {user?.department}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Roll No</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Section</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Subject</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Score</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...sectionResults].reverse().slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2 px-3 font-medium text-foreground">{r.studentName}</td>
                    <td className="py-2 px-3 text-muted-foreground">{r.rollNo}</td>
                    <td className="py-2 px-3 text-muted-foreground">{r.section} — {r.year}</td>
                    <td className="py-2 px-3 text-foreground">{r.subject}</td>
                    <td className="py-2 px-3">
                      <span className={`font-semibold ${
                        r.score / r.total >= 0.7 ? "text-green-600" : r.score / r.total >= 0.5 ? "text-orange-500" : "text-red-500"
                      }`}>{r.score}/{r.total}</span>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(r.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffDashboard;
