import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, UserPlus, LogIn, Info } from "lucide-react";

type Tab = "login" | "signup";

const LoginPage: React.FC = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    setTimeout(() => {
      const result = login(loginEmail, loginPassword);
      if (result.success) {
        const saved = sessionStorage.getItem("portal_user");
        const user = saved ? JSON.parse(saved) : null;
        navigate(user?.role === "ROLE_HOD" ? "/hod" : "/staff");
      } else {
        setLoginError(result.error || "Login failed.");
      }
      setLoginLoading(false);
    }, 400);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess("");
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }
    setSignupLoading(true);
    setTimeout(() => {
      const result = signup(signupName, signupEmail, signupPassword);
      if (result.success) {
        setSignupSuccess("Account created! You can now log in.");
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupConfirm("");
        setTimeout(() => { setTab("login"); setSignupSuccess(""); }, 1800);
      } else {
        setSignupError(result.error || "Signup failed.");
      }
      setSignupLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground/20"
              style={{
                width: `${200 + i * 150}px`,
                height: `${200 + i * 150}px`,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
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

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center bg-background min-h-screen">

        {/* Logo + Title (mobile only) */}
        <div className="flex flex-col items-center pt-0 pb-2 lg:hidden w-full">
          <img src="/logo.png" alt="EduNexus" className="w-44 h-44 object-contain" style={{ mixBlendMode: "multiply" }} />
          <h1 className="text-4xl font-bold text-foreground -mt-6 font-cinzel">EduNexus</h1>
          <p className="text-xl font-medium mt-3 mb-0 text-center" style={{ color: "#a855f7" }}>
            Department of Artificial Intelligence<br />&<br />Data Science
          </p>
        </div>

        {/* Form area */}
        <div className="w-full max-w-md flex-1 flex flex-col justify-center px-6 pb-6">

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-8">

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {tab === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {tab === "login" ? "Sign in to access your portal" : "Register with your @mahendra.info email"}
              </p>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-1 mb-6 p-1 bg-muted rounded-xl">
              <button
                onClick={() => { setTab("login"); setLoginError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button
                onClick={() => { setTab("signup"); setSignupError(""); setSignupSuccess(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </button>
            </div>

            {/* LOGIN FORM */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    required placeholder="you@mahendra.info"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPwd ? "text" : "password"} value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)} required placeholder="Enter your password"
                      className="w-full px-4 py-2.5 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                    />
                    <button type="button" onClick={() => setShowLoginPwd(!showLoginPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {loginError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Info className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{loginError}</p>
                  </div>
                )}
                <button type="submit" disabled={loginLoading}
                  className="w-full py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
                  {loginLoading ? "Signing in…" : "Sign In"}
                </button>
                <p className="text-center text-xs text-muted-foreground pt-1">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setTab("signup")}
                    className="font-medium hover:underline" style={{ color: "#a855f7" }}>
                    Sign up
                  </button>
                </p>
              </form>
            )}

            {/* SIGNUP FORM */}
            {tab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)}
                    required placeholder="Dr. / Prof. Your Name"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                    required placeholder="you@mahendra.info"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only <span className="font-medium">@mahendra.info</span> emails are accepted.
                    Use <span className="font-medium">hod@mahendra.info</span> to register as HOD.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showSignupPwd ? "text" : "password"} value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)} required placeholder="Min. 6 characters"
                      className="w-full px-4 py-2.5 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                    />
                    <button type="button" onClick={() => setShowSignupPwd(!showSignupPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showSignupPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"} value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)} required placeholder="Re-enter your password"
                      className="w-full px-4 py-2.5 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 transition"
                    />
                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {signupError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Info className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{signupError}</p>
                  </div>
                )}
                {signupSuccess && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Info className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600">{signupSuccess}</p>
                  </div>
                )}
                <button type="submit" disabled={signupLoading}
                  className="w-full py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
                  {signupLoading ? "Creating account…" : "Create Account"}
                </button>
                <p className="text-center text-xs text-muted-foreground pt-1">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("login")}
                    className="font-medium hover:underline" style={{ color: "#a855f7" }}>
                    Sign in
                  </button>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
