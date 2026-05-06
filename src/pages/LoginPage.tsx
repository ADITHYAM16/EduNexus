import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStudent } from "@/contexts/StudentContext";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, UserPlus, LogIn, ShieldCheck, Info, ArrowLeft, GraduationCap } from "lucide-react";

type Tab = "login" | "signup" | "admin" | "student";
type View = "main" | "forgot-email" | "forgot-reset";

const inputCls = "w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition";
const btnCls = "w-full py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60";
const gradientStyle = { background: "linear-gradient(135deg, #a855f7, #7c3aed)" };
const adminGradient = { background: "linear-gradient(135deg, #1e40af, #1d4ed8)" } as React.CSSProperties;

const ErrBox: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
    <Info className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
    <p className="text-sm text-destructive">{msg}</p>
  </div>
);

const OkBox: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
    <Info className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
    <p className="text-sm text-green-600">{msg}</p>
  </div>
);

const PwdInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; show: boolean; onToggle: () => void }> = ({ value, onChange, placeholder, show, onToggle }) => (
  <div className="relative">
    <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} required placeholder={placeholder || "Enter password"}
      className={inputCls + " pr-10"} />
    <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
);

const LoginPage: React.FC = () => {
  const { login, signup, resetPassword } = useAuth();
  const { setStudent } = useStudent();
  const navigate = useNavigate();

  // Force light mode on login page
  useEffect(() => {
    const prev = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("dark");
    return () => { if (prev) document.documentElement.classList.add("dark"); };
  }, []);

  const [tab, setTab] = useState<Tab>("signup");
  const [view, setView] = useState<View>("main");

  // ── Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Sign Up state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // ── Admin Login state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPwd, setAdminPwd] = useState("");
  const [showAdminPwd, setShowAdminPwd] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // ── Student Login state
  const [studentRoll, setStudentRoll] = useState("");
  const [studentError, setStudentError] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);

  const DEPARTMENTS = ["Computer Science", "Artificial Intelligence & Data Science", "Information Technology", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering"];
  const SECTIONS = ["A", "B", "C"];
  const YEARS = ["I Year", "II Year", "III Year", "IV Year"];

  // ── Forgot Password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [forgotEmailLoading, setForgotEmailLoading] = useState(false);
  const [resetPwd, setResetPwd] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const switchTab = (t: Tab) => {
    setTab(t); setView("main");
    setLoginError(""); setSignupError(""); setSignupSuccess(""); setAdminError(""); setStudentError("");
  };

  // ── Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(""); setLoginLoading(true);
    const result = await login(loginEmail, loginPwd);
    if (result.success) {
      const saved = sessionStorage.getItem("portal_user");
      const u = saved ? JSON.parse(saved) : null;
      if (u?.role === "ROLE_HOD") {
        setLoginError("Use Admin Login to access the HOD panel.");
        setLoginLoading(false);
        return;
      }
      navigate("/staff");
    } else {
      setLoginError(result.error || "Login failed.");
    }
    setLoginLoading(false);
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError("");
    if (!studentRoll.trim()) { setStudentError("Please enter your roll number."); return; }
    setStudentLoading(true);
    const { data, error: dbErr } = await supabase
      .from("students")
      .select("*")
      .eq("roll_no", studentRoll.trim().toUpperCase())
      .single();
    setStudentLoading(false);
    if (dbErr || !data) {
      setStudentError("❌ Roll number not registered. Please contact your administrator.");
      return;
    }
    setStudent({ name: data.name, rollNo: data.roll_no, email: data.email || "", department: data.department, section: data.section, year: data.year });
    navigate("/student");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(""); setSignupSuccess("");
    if (signupEmail.trim().toLowerCase() === "hod@edunexus.com") {
      setSignupError("Admin account cannot be registered here. Use Admin Login.");
      return;
    }
    if (signupPwd !== signupConfirm) { setSignupError("Passwords do not match."); return; }
    setSignupLoading(true);
    const result = await signup(signupName, signupEmail, signupPwd);
    if (result.success) {
      setSignupSuccess("Account created! You can now sign in.");
      setSignupName(""); setSignupEmail(""); setSignupPwd(""); setSignupConfirm("");
      setTimeout(() => { switchTab("login"); }, 1800);
    } else {
      setSignupError(result.error || "Signup failed.");
    }
    setSignupLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(""); setAdminLoading(true);
    const result = await login(adminEmail, adminPwd);
    if (result.success) {
      const saved = sessionStorage.getItem("portal_user");
      const u = saved ? JSON.parse(saved) : null;
      if (u?.role !== "ROLE_HOD") {
        setAdminError("This account does not have admin access.");
        setAdminLoading(false);
        return;
      }
      navigate("/hod");
    } else {
      setAdminError(result.error || "Admin login failed.");
    }
    setAdminLoading(false);
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotEmailError(""); setForgotEmailLoading(true);
    const email = forgotEmail.trim().toLowerCase();
    const { data } = await supabase.from("staff").select("id").eq("email", email).single();
    if (!data) {
      setForgotEmailError("No account found with this email.");
      setForgotEmailLoading(false);
      return;
    }
    setForgotEmailLoading(false);
    setView("forgot-reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(""); setResetSuccess("");
    if (resetPwd !== resetConfirm) { setResetError("Passwords do not match."); return; }
    if (resetPwd.length < 6) { setResetError("Password must be at least 6 characters."); return; }
    setResetLoading(true);
    const result = await resetPassword(forgotEmail.trim().toLowerCase(), resetPwd);
    if (result.success) {
      setResetSuccess("Password reset successfully! Redirecting to sign in…");
      setTimeout(() => {
        setView("main"); setTab("login");
        setForgotEmail(""); setResetPwd(""); setResetConfirm(""); setResetSuccess("");
      }, 1800);
    } else {
      setResetError(result.error || "Reset failed.");
    }
    setResetLoading(false);
  };

  const leftPanel = (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute rounded-full border border-primary-foreground/20"
            style={{ width: `${200 + i * 150}px`, height: `${200 + i * 150}px`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        ))}
      </div>
      <div className="relative z-10 max-w-md text-center">
        <img src="/logo.png" alt="EduNexus" className="w-64 h-64 mx-auto mb-4 object-contain" style={{ mixBlendMode: "multiply" }} />
        <h1 className="text-6xl font-bold text-primary-foreground -mt-6 mb-3 font-cinzel">EduNexus</h1>
        <p className="text-2xl font-medium text-center mt-2 mb-0 text-primary-foreground/80">
          Department of Artificial Intelligence<br />&<br />Data Science
        </p>
        <p className="text-primary-foreground/60 text-sm leading-relaxed mt-4">
          Staff Attendance, Academic Progress & Communication — powered by AI insights
        </p>
      </div>
    </div>
  );

  // ── Forgot Password: Email step
  if (view === "forgot-email") {
    return (
      <div className="min-h-screen flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center bg-background min-h-screen">
          <div className="flex flex-col items-center pt-0 pb-2 lg:hidden w-full">
            <img src="/logo.png" alt="EduNexus" className="w-44 h-44 object-contain" style={{ mixBlendMode: "multiply" }} />
            <h1 className="text-4xl font-bold text-foreground -mt-6 font-cinzel">EduNexus</h1>
          </div>
          <div className="w-full max-w-md flex-1 flex flex-col justify-center px-6 pb-6">
            <div className="bg-card border border-border rounded-2xl shadow-card p-8">
              <button onClick={() => setView("main")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
              <h2 className="text-2xl font-bold text-foreground mb-1">Forgot Password</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter your registered email to reset your password.</p>
              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required
                    placeholder="yourname@mahendra.info" className={inputCls} />
                </div>
                {forgotEmailError && <ErrBox msg={forgotEmailError} />}
                <button type="submit" disabled={forgotEmailLoading} className={btnCls} style={gradientStyle}>
                  {forgotEmailLoading ? "Verifying…" : "Continue"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Forgot Password: Reset step
  if (view === "forgot-reset") {
    return (
      <div className="min-h-screen flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center bg-background min-h-screen">
          <div className="flex flex-col items-center pt-0 pb-2 lg:hidden w-full">
            <img src="/logo.png" alt="EduNexus" className="w-44 h-44 object-contain" style={{ mixBlendMode: "multiply" }} />
            <h1 className="text-4xl font-bold text-foreground -mt-6 font-cinzel">EduNexus</h1>
          </div>
          <div className="w-full max-w-md flex-1 flex flex-col justify-center px-6 pb-6">
            <div className="bg-card border border-border rounded-2xl shadow-card p-8">
              <button onClick={() => setView("forgot-email")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-bold text-foreground mb-1">Set New Password</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Setting new password for <span className="font-medium text-foreground">{forgotEmail}</span>
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                  <PwdInput value={resetPwd} onChange={setResetPwd} placeholder="Min. 6 characters" show={showResetPwd} onToggle={() => setShowResetPwd(p => !p)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
                  <PwdInput value={resetConfirm} onChange={setResetConfirm} placeholder="Re-enter new password" show={showResetConfirm} onToggle={() => setShowResetConfirm(p => !p)} />
                </div>
                {resetError && <ErrBox msg={resetError} />}
                {resetSuccess && <OkBox msg={resetSuccess} />}
                <button type="submit" disabled={resetLoading} className={btnCls} style={gradientStyle}>
                  {resetLoading ? "Saving…" : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main view
  return (
    <div className="min-h-screen flex">
      {leftPanel}

      <div className="flex-1 flex flex-col items-center bg-background min-h-screen">
        {/* Mobile header */}
        <div className="flex flex-col items-center pt-0 pb-2 lg:hidden w-full">
          <img src="/logo.png" alt="EduNexus" className="w-44 h-44 object-contain" style={{ mixBlendMode: "multiply" }} />
          <h1 className="text-4xl font-bold text-foreground -mt-6 font-cinzel">EduNexus</h1>
          <p className="text-xl font-medium mt-3 mb-0 text-center" style={{ color: "#a855f7" }}>
            Department of Artificial Intelligence<br />&<br />Data Science
          </p>
        </div>

        <div className="w-full max-w-md flex-1 flex flex-col justify-center px-6 pb-6">
          <div className="bg-card border border-border rounded-2xl shadow-card p-8">

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {tab === "login" ? "Welcome back" : tab === "signup" ? "Create account" : tab === "admin" ? "Admin Login" : "Student Login"}
              </h2>
            </div>

            {/* 4-Tab Toggle: Sign Up | Sign In | Admin | Student */}
            <div className="flex gap-1 mb-6 p-1 bg-muted rounded-xl">
              <button onClick={() => switchTab("signup")}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <UserPlus className="w-3 h-3" /> Sign Up
              </button>
              <button onClick={() => switchTab("login")}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <LogIn className="w-3 h-3" /> Staff
              </button>
              <button onClick={() => switchTab("admin")}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "admin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <ShieldCheck className="w-3 h-3" /> Admin
              </button>
              <button onClick={() => switchTab("student")}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "student" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <GraduationCap className="w-3 h-3" /> Student
              </button>
            </div>

            {/* ── SIGN IN ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                    placeholder="yourname@mahendra.info" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <PwdInput value={loginPwd} onChange={setLoginPwd} placeholder="Enter your password" show={showLoginPwd} onToggle={() => setShowLoginPwd(p => !p)} />
                </div>
                {loginError && <ErrBox msg={loginError} />}
                <button type="submit" disabled={loginLoading} className={btnCls} style={gradientStyle}>
                  {loginLoading ? "Signing in…" : "Sign In"}
                </button>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-muted-foreground">
                    No account?{" "}
                    <button type="button" onClick={() => switchTab("signup")} className="font-medium hover:underline" style={{ color: "#a855f7" }}>Sign up</button>
                  </p>
                  <button type="button" onClick={() => { setForgotEmail(loginEmail); setForgotEmailError(""); setView("forgot-email"); }}
                    className="text-xs font-medium hover:underline" style={{ color: "#a855f7" }}>
                    Forgot password?
                  </button>
                </div>
              </form>
            )}

            {/* ── SIGN UP ── */}
            {tab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} required
                    placeholder="Dr. / Prof. Your Name" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required
                    placeholder="yourname@mahendra.info" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <PwdInput value={signupPwd} onChange={setSignupPwd} placeholder="Min. 6 characters" show={showSignupPwd} onToggle={() => setShowSignupPwd(p => !p)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                  <PwdInput value={signupConfirm} onChange={setSignupConfirm} placeholder="Re-enter your password" show={showConfirmPwd} onToggle={() => setShowConfirmPwd(p => !p)} />
                </div>
                {signupError && <ErrBox msg={signupError} />}
                {signupSuccess && <OkBox msg={signupSuccess} />}
                <button type="submit" disabled={signupLoading} className={btnCls} style={gradientStyle}>
                  {signupLoading ? "Creating account…" : "Create Account"}
                </button>
                <p className="text-center text-xs text-muted-foreground pt-1">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchTab("login")} className="font-medium hover:underline" style={{ color: "#a855f7" }}>Sign in</button>
                </p>
              </form>
            )}

            {/* ── ADMIN LOGIN ── */}
            {tab === "admin" && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Admin Email</label>
                  <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required
                    placeholder="yourname@mahendra.info" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <PwdInput value={adminPwd} onChange={setAdminPwd} placeholder="Enter admin password" show={showAdminPwd} onToggle={() => setShowAdminPwd(p => !p)} />
                </div>
                {adminError && <ErrBox msg={adminError} />}
                <button type="submit" disabled={adminLoading} className={btnCls} style={adminGradient}>
                  {adminLoading ? "Signing in…" : "Admin Sign In"}
                </button>
                <div className="flex justify-end pt-1">
                  <button type="button" onClick={() => { setForgotEmail("hod@edunexus.com"); setForgotEmailError(""); setView("forgot-email"); }}
                    className="text-xs font-medium hover:underline" style={{ color: "#1d4ed8" }}>
                    Forgot password?
                  </button>
                </div>
              </form>
            )}

            {/* ── STUDENT LOGIN ── */}
            {tab === "student" && (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Roll Number *</label>
                  <input
                    type="text"
                    value={studentRoll}
                    onChange={e => setStudentRoll(e.target.value)}
                    required
                    placeholder="e.g. 124UAD003"
                    className={inputCls}
                    autoFocus
                  />
                </div>
                {studentError && <ErrBox msg={studentError} />}
                <button type="submit" disabled={studentLoading} className={btnCls} style={gradientStyle}>
                  {studentLoading ? "Verifying..." : "Enter Student Portal"}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
