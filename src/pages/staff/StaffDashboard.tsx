import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import InsightCard from "@/components/InsightCard";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarCheck, BookOpen, Brain, MessageSquare } from "lucide-react";
import { mockWeeklyAttendance, mockSubjectProgress, mockMessages, getAIInsights } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const attendance = 88;
  const syllabus = 72;
  const insights = getAIInsights(attendance, syllabus);
  const recentMessages = mockMessages.slice(0, 2);
  const totalTopics = mockSubjectProgress.reduce((a, s) => a + s.topicsTotal, 0);
  const completedTopics = mockSubjectProgress.reduce((a, s) => a + s.topicsCompleted, 0);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ").pop()}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Attendance" value={`${attendance}%`} icon={CalendarCheck} variant="primary" trend="up" trendValue="+2% this week" linkTo="/staff/attendance" />
        <StatCard title="Syllabus Done" value={`${syllabus}%`} icon={BookOpen} variant="warning" trend="up" trendValue="+5% this month" linkTo="/staff/academic" />
        <StatCard title="AI Insights" value={insights.length} icon={Brain} variant="success" subtitle="View insights" linkTo="/staff/insights" />
        <StatCard title="Messages" value={mockMessages.length} icon={MessageSquare} subtitle="1 unread" linkTo="/staff/messages" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Attendance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            🤖 AI Insights
          </h2>
          {insights.map((insight, i) => (
            <InsightCard key={i} type={insight.type} message={insight.message} />
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="mt-6 bg-card border border-border rounded-xl p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-3">Recent Messages</h2>
        <div className="space-y-3">
          {recentMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{msg.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{msg.body}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">{msg.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
