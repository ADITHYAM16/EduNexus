import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, CalendarCheck, BookOpen, MessageSquare, Brain,
  Users, BarChart3, LogOut, Menu, Moon, Sun, Building2, ClipboardList, TrendingUp
} from "lucide-react";
import EduNexusLogo from "@/components/EduNexusLogo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const staffLinks = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { to: "/staff/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/staff/messages", label: "Messages", icon: MessageSquare },
  { to: "/staff/academic", label: "Syllabus Progress", icon: BookOpen },
  { to: "/staff/student-progress", label: "Students Progress", icon: TrendingUp },
  { to: "/staff/weekly-test", label: "Weekly Test", icon: ClipboardList },
  { to: "/staff/insights", label: "AI Insights", icon: Brain },
];

const hodLinks = [
  { to: "/hod", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hod/departments", label: "Manage Department", icon: Building2 },
  { to: "/hod/staff", label: "Staff Management", icon: Users },
  { to: "/hod/attendance", label: "Attendance Monitor", icon: CalendarCheck },
  { to: "/hod/progress", label: "Syllabus Progress", icon: BookOpen },
  { to: "/hod/student-progress", label: "Students Progress", icon: TrendingUp },
  { to: "/hod/communication", label: "Communication", icon: MessageSquare },
  { to: "/hod/analytics", label: "Analytics & AI", icon: BarChart3 },
];

const SidebarContent: React.FC<{
  links: typeof staffLinks;
  location: ReturnType<typeof useLocation>;
  user: ReturnType<typeof useAuth>["user"];
  logout: () => void;
  onNavigate?: () => void;
}> = ({ links, location, user, logout, onNavigate }) => (
  <div className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="EduNexus" className="w-14 h-14 object-contain" style={{ mixBlendMode: "multiply" }} />
        <div>
          <p className="text-xl font-bold text-sidebar-foreground font-cinzel">EduNexus</p>
          <p className="text-[11px] text-sidebar-foreground/60">
            {user?.role === "ROLE_HOD" ? "HOD Admin" : "Staff Portal"}
          </p>
        </div>
      </div>
    </div>

    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto min-h-0">
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-sidebar-accent text-sidebar-primary font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>

    <div className="p-3 border-t border-sidebar-border">
      <Link
        to={user?.role === "ROLE_HOD" ? "/hod/profile" : "/staff/profile"}
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary-foreground">{user?.name?.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-sidebar-foreground/90 truncate">{user?.name}</p>
          <p className="text-[11px] text-sidebar-foreground/50 truncate">{user?.department}</p>
        </div>
      </Link>
      <button
        onClick={logout}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-destructive transition-colors"
        style={{ transform: "none" }}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  </div>
);

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
    return isDark;
  });
  const links = user?.role === "ROLE_HOD" ? hodLinks : staffLinks;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <div className="flex min-h-screen h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col shrink-0 h-full overflow-y-auto">
        <SidebarContent links={links} location={location} user={user} logout={logout} />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground flex flex-col h-full overflow-hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent links={links} location={location} user={user} logout={logout} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header — always visible, never hidden */}
        <header className="flex items-center justify-between px-4 py-3 border-2 rounded-xl mx-2 mt-2 mb-0 bg-card shrink-0 border-purple-500 dark:border-purple-400 z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Hamburger — only on mobile */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            {/* Logo + name — only on mobile */}
            <div className="md:hidden flex items-center gap-2 min-w-0">
              <img src="/logo.png" alt="EduNexus" className="w-7 h-7 object-contain shrink-0" style={{ mixBlendMode: "multiply" }} />
              <span className="text-sm font-bold text-foreground font-cinzel truncate">EduNexus</span>
            </div>
            {/* Page title — only on desktop */}
            <h2 className="hidden md:block text-sm font-medium text-muted-foreground truncate">
              {location.pathname.split("/").pop()?.replace(/-/g, " ").replace(/^\w/, c => c.toUpperCase()) || "Dashboard"}
            </h2>
          </div>
          {/* Dark/Light toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0 ml-2"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-5 h-5 text-warning" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
