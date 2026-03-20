import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("ROLE_STAFF");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(email, password, role);
    if (success) {
      navigate(role === "ROLE_HOD" ? "/hod" : "/staff");
    } else {
      setError("Invalid credentials. Try the demo accounts below.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-primary-foreground/20"
              style={{ width: `${200 + i * 150}px`, height: `${200 + i * 150}px`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          ))}
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="EduNexus" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">EduNexus</h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Staff Attendance, Academic Progress & Communication — powered by AI insights
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-start p-8 pt-0 bg-background">
        <div className="flex flex-col items-center pt-0 mb-8">
          <div className="w-44 h-44 mb-3">
            <img src="/logo.png" alt="EduNexus" className="w-full h-full object-contain" style={{mixBlendMode: "multiply"}} />
          </div>
          <h1 className="text-4xl font-bold text-foreground -mt-4" style={{fontFamily: "'Cinzel', serif"}}>EduNexus</h1>
          <p className="text-xl font-semibold mt-6 text-center bg-clip-text text-transparent" style={{backgroundImage: "linear-gradient(90deg, #ff0080, #ff4500, #ff8c00, #ffe600, #adff2f, #00ff88, #00e5ff, #00cfff, #007bff, #8a2be2, #a855f7, #ff00ff, #ff0080)", backgroundSize: "300% auto", animation: "gradientShift 6s linear infinite"}}>Department of Artificial Intelligence<br />&<br />Data Science</p>
        </div>
        <div className="w-full max-w-md">

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to access your portal</p>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            {(["ROLE_STAFF", "ROLE_HOD"] as UserRole[]).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  role === r ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                }`}>
                {r === "ROLE_STAFF" ? "Staff" : "HOD Admin"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition pr-10" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              Sign In
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-muted-foreground font-mono">
              <p>Staff: staff@college.edu / staff123</p>
              <p>HOD: hod@college.edu / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
