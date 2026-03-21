import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, CalendarCheck, Award, MessageSquare, ClipboardList } from "lucide-react";
import { mockDepartmentStats, mockStaffList, mockMessages } from "@/data/mockData";
import { useTodo } from "@/contexts/TodoContext";

const HodDashboard: React.FC = () => {
  const { todos } = useTodo();
  const pending = todos.filter(t => !t.done);

  const topPerformer = mockStaffList.reduce((a, b) => a.attendance > b.attendance ? a : b);
  const announcementsCount = mockMessages.filter(m => m.type === "announcement").length;
  const tasksPending = pending.length;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Department Overview</h1>
      <p className="text-muted-foreground text-sm mb-8">Artificial Intelligence & Data Science</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Staff" value={mockDepartmentStats.totalStaff} icon={Users} variant="primary" linkTo="/hod/staff" />
        <StatCard title="Avg Attendance" value={`${mockDepartmentStats.avgAttendance}%`} icon={CalendarCheck} variant="success" trend="up" trendValue="+3% vs last month" linkTo="/hod/attendance" />
        <StatCard title="Top Performer" value={topPerformer.name.replace("Prof. ", "")} icon={Award} variant="success" subtitle={`${topPerformer.attendance}% attendance`} linkTo="/hod/staff" />
        <StatCard title="Announcements" value={announcementsCount} icon={MessageSquare} variant="primary" subtitle="Total sent" linkTo="/hod/communication" />
      </div>

      {/* Pending Reminders */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" /> Pending Reminders
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">All tasks completed!</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((item, i) => (
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
