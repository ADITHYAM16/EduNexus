import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarCheck, Check, X, MapPin, Shield, AlertTriangle, Fingerprint, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import AttendanceChart3D from "@/components/AttendanceChart3D";

const COLLEGE_LAT = 11.476742;
const COLLEGE_LNG = 77.999672;
const GEOFENCE_RADIUS_M = 10000;

// Admin can override college location from env
const OVERRIDE_LAT = import.meta.env.VITE_COLLEGE_LAT ? parseFloat(import.meta.env.VITE_COLLEGE_LAT) : COLLEGE_LAT;
const OVERRIDE_LNG = import.meta.env.VITE_COLLEGE_LNG ? parseFloat(import.meta.env.VITE_COLLEGE_LNG) : COLLEGE_LNG;

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Check if device supports biometric auth (WebAuthn)
const isBiometricSupported = () =>
  typeof window !== "undefined" &&
  window.PublicKeyCredential !== undefined &&
  typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";

// Check if running on mobile
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Trigger biometric verification using WebAuthn
async function verifyBiometric(userName: string): Promise<boolean> {
  try {
    const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) return true; // fallback: allow if not available

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "EduNexus", id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(userName),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false,
        },
        timeout: 60000,
      },
    });

    return !!credential;
  } catch (err: any) {
    // If already registered, try assertion instead
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          userVerification: "required",
          timeout: 60000,
        },
      });
      return !!assertion;
    } catch {
      return false;
    }
  }
}

interface AttendanceRecord { id: string; date: string; status: string; }

type Step = "idle" | "geo_checking" | "geo_outside" | "geo_error" | "bio_prompt" | "bio_checking" | "bio_failed" | "saving" | "success" | "already_marked";

const StaffAttendance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [marked, setMarked] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [showDialog, setShowDialog] = useState(false);
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [biometricSupported, setBiometricSupported] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isBiometricSupported()) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setBiometricSupported);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("attendance").select("id,date,status")
      .eq("staff_id", user.id).order("date", { ascending: false });

    const records = data || [];
    setHistory(records);

    // Overall percentage: present days / total working days elapsed this year
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    let workingDaysElapsed = 0;
    for (let d = new Date(yearStart); d <= now; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) workingDaysElapsed++;
    }
    const present = records.filter(r => r.status === "present").length;
    const late    = records.filter(r => r.status === "late").length;
    setPercentage(workingDaysElapsed > 0 ? Math.round(((present + late * 0.5) / workingDaysElapsed) * 100) : 0);

    if (records.find(r => r.date === today)) setMarked(true);

    // Chart: each month value = present days / working days in that month (up to today)
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    setChartData(months.map((label, i) => {
      const year = now.getFullYear();
      // Don't show future months
      if (i > now.getMonth()) return { label, value: 0 };

      // Count working days in this month up to today
      const monthEnd = i === now.getMonth()
        ? now
        : new Date(year, i + 1, 0); // last day of month
      let workingDays = 0;
      for (let d = new Date(year, i, 1); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) workingDays++;
      }

      const mr = records.filter(r => new Date(r.date).getMonth() === i && new Date(r.date).getFullYear() === year);
      const p  = mr.filter(r => r.status === "present").length;
      const l  = mr.filter(r => r.status === "late").length;
      return { label, value: workingDays > 0 ? Math.round(((p + l * 0.5) / workingDays) * 100) : 0 };
    }));
  }, [user?.id, today]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const saveAttendance = async () => {
    setStep("saving");
    const { error } = await supabase.from("attendance").upsert({
      staff_id: user?.id, date: today, status: "present",
    }, { onConflict: "staff_id,date" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setStep("geo_error");
      return;
    }
    setStep("success");
    setMarked(true);
    toast({ title: "Attendance Marked ✓", description: "Your attendance has been recorded." });
    fetchHistory();
  };

  const handleMarkAttendance = () => {
    if (marked) return;
    setStep("geo_checking");
    setShowDialog(true);

    if (!navigator.geolocation) {
      setStep("geo_error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const dist = getDistanceMeters(pos.coords.latitude, pos.coords.longitude, OVERRIDE_LAT, OVERRIDE_LNG);
        setDistanceM(Math.round(dist));

        if (dist > GEOFENCE_RADIUS_M) {
          setStep("geo_outside");
          return;
        }

        // Inside geofence — check if mobile + biometric supported
        if (isMobile() && biometricSupported) {
          setStep("bio_prompt");
        } else {
          // Desktop or no biometric — save directly
          await saveAttendance();
        }
      },
      () => setStep("geo_error"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleBiometricVerify = async () => {
    setStep("bio_checking");
    const verified = await verifyBiometric(user?.name || user?.email || "staff");
    if (verified) {
      await saveAttendance();
    } else {
      setStep("bio_failed");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Attendance</h1>
      <p className="text-muted-foreground text-sm mb-8">Mark your daily attendance with location & biometric verification</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mark Attendance Card */}
        <div className="relative overflow-hidden border border-primary/40 rounded-xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] bg-[#050B14] flex flex-col">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[60px] animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-[1.5px] border-primary/40 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-primary/60 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1.5s]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-primary/80 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_3s]"></div>
            <div className="absolute left-0 top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-[scan_4s_linear_infinite]"></div>
          </div>

          <style dangerouslySetInnerHTML={{__html:`@keyframes scan{0%{top:-10%;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:110%;opacity:0}}`}}/>

          <div className="relative z-10 px-4 py-6 backdrop-blur-sm bg-black/10 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 bg-primary/20 text-blue-200 border border-primary/40 rounded-full uppercase tracking-wider">
                <MapPin className="w-2.5 h-2.5 animate-bounce"/> Geofence Active
              </div>
              {biometricSupported && isMobile() && (
                <div className="flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/40 rounded-full uppercase tracking-wider">
                  <Fingerprint className="w-2.5 h-2.5"/> Biometric On
                </div>
              )}
            </div>

            <div className="text-center py-2 flex-1 flex flex-col items-center justify-center">
              <div className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${marked ? "bg-success/20 border-2 border-success/50 shadow-[0_0_25px_rgba(34,197,94,0.4)]" : "bg-gradient-to-br from-primary/30 to-indigo-600/30 border-2 border-primary/50 shadow-[0_0_25px_rgba(59,130,246,0.5)]"}`}>
                <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse"></div>
                <div className="absolute inset-1.5 rounded-full border border-white/20 border-dashed animate-[spin_10s_linear_infinite]"></div>
                <CalendarCheck className={`w-7 h-7 relative z-10 ${marked ? "text-success" : "text-white"}`}/>
              </div>

              <div className="mb-4 inline-block bg-black/50 border border-white/10 px-3 py-1 rounded-xl backdrop-blur-md">
                <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 tracking-wide">
                  {marked ? "Attendance Verified ✓" : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <p className="text-[10px] text-blue-200 mb-2 flex items-center justify-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full border border-primary/30">
                <Shield className="w-2.5 h-2.5 text-blue-400"/> GPS + {isMobile() && biometricSupported ? "Fingerprint" : "Location"} Verification
              </p>

              <p className="text-[9px] text-blue-300/60 mb-4">Within 10km of Mahendra Engineering College</p>

              <button
                onClick={handleMarkAttendance}
                disabled={marked}
                className={`relative overflow-hidden px-4 py-2 w-full max-w-[200px] rounded-lg text-[13px] font-black tracking-wide uppercase shadow-lg transition-all duration-300 ${marked ? "bg-success/20 text-success border border-success/30 opacity-80 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] border border-blue-400/50"}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {marked ? "Recorded" : isMobile() && biometricSupported ? <><Fingerprint className="w-4 h-4"/> Mark Present</> : <><MapPin className="w-4 h-4"/> Mark Present</>}
                </span>
              </button>
            </div>

            <div className="mt-4 p-2 bg-gradient-to-br from-[#0a1526] to-[#040914] rounded-lg text-center border border-primary/30">
              <p className="text-[9px] font-bold text-blue-300/80 uppercase tracking-[0.1em] mb-0.5">Current Attendance</p>
              <div className="flex items-center justify-center gap-0.5">
                <p className="text-2xl leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300">{percentage}</p>
                <p className="text-sm font-black text-blue-400 mb-0.5">%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Chart */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden shadow-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Monthly Attendance Trend</h2>
            <p className="text-xs mt-0.5 text-muted-foreground">Drag to rotate · AI-powered view</p>
          </div>
          <div className="p-4">
            <AttendanceChart3D data={chartData.length > 0 ? chartData : [{ label: "No Data", value: 0 }]}/>
          </div>
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog open={showDialog} onOpenChange={v => { if (!v && (step === "success" || step === "geo_outside" || step === "geo_error" || step === "bio_failed")) setShowDialog(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {step === "bio_prompt" || step === "bio_checking"
                ? <><Fingerprint className="w-5 h-5 text-green-500"/> Biometric Verification</>
                : <><MapPin className="w-5 h-5 text-primary"/> Location Verification</>
              }
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 text-center space-y-4">
            {/* Geo Checking */}
            {step === "geo_checking" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <MapPin className="w-8 h-8 text-primary"/>
                </div>
                <p className="text-sm text-muted-foreground">Verifying your location...</p>
                <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto"/>
              </>
            )}

            {/* Outside Geofence */}
            {step === "geo_outside" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive"/>
                </div>
                <p className="text-sm font-semibold text-destructive">Outside Campus Boundary</p>
                <p className="text-xs text-muted-foreground">
                  You are <span className="font-bold text-foreground">{distanceM}m</span> away from campus.<br/>
                  Must be within <span className="font-bold">10km</span> to mark attendance.
                </p>
                <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
                  📍 Please be physically present on campus to mark attendance.
                </div>
                <button onClick={() => setShowDialog(false)} className="w-full py-2 rounded-lg bg-muted text-foreground text-sm font-medium">Close</button>
              </>
            )}

            {/* Geo Error */}
            {step === "geo_error" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-warning"/>
                </div>
                <p className="text-sm font-medium text-warning">Location Access Failed</p>
                <p className="text-xs text-muted-foreground">Please enable GPS/Location services and try again.</p>
                <button onClick={() => setShowDialog(false)} className="w-full py-2 rounded-lg bg-muted text-foreground text-sm font-medium">Close</button>
              </>
            )}

            {/* Biometric Prompt */}
            {step === "bio_prompt" && (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                  <Fingerprint className="w-10 h-10 text-green-500"/>
                </div>
                <p className="text-sm font-semibold text-foreground">Fingerprint Required</p>
                <p className="text-xs text-muted-foreground">
                  ✅ Location verified — {distanceM}m from campus<br/>
                  Now verify your identity with fingerprint.
                </p>
                <button
                  onClick={handleBiometricVerify}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Fingerprint className="w-5 h-5"/> Verify Fingerprint
                </button>
              </>
            )}

            {/* Biometric Checking */}
            {step === "bio_checking" && (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center animate-pulse">
                  <Fingerprint className="w-10 h-10 text-green-500"/>
                </div>
                <p className="text-sm text-muted-foreground">Scanning fingerprint...</p>
                <Loader2 className="w-5 h-5 animate-spin text-green-500 mx-auto"/>
              </>
            )}

            {/* Biometric Failed */}
            {step === "bio_failed" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive"/>
                </div>
                <p className="text-sm font-semibold text-destructive">Fingerprint Not Matched</p>
                <p className="text-xs text-muted-foreground">Biometric verification failed. Please try again.</p>
                <div className="flex gap-2">
                  <button onClick={() => setStep("bio_prompt")} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Retry</button>
                  <button onClick={() => setShowDialog(false)} className="flex-1 py-2 rounded-lg bg-muted text-foreground text-sm font-medium">Cancel</button>
                </div>
              </>
            )}

            {/* Saving */}
            {step === "saving" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 text-primary animate-spin"/>
                </div>
                <p className="text-sm text-muted-foreground">Saving attendance...</p>
              </>
            )}

            {/* Success */}
            {step === "success" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-success"/>
                </div>
                <p className="text-sm font-semibold text-success">Attendance Marked Successfully!</p>
                <p className="text-xs text-muted-foreground">
                  {distanceM !== null ? `📍 ${distanceM}m from campus` : ""}{biometricSupported && isMobile() ? " · 🔐 Fingerprint verified" : ""}
                </p>
                <button onClick={() => setShowDialog(false)} className="w-full py-2 rounded-lg bg-success text-white text-sm font-medium">Done</button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* History */}
      <div className="mt-6 bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-4">Recent Attendance Log</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No attendance records yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {history.slice(0, 15).map(entry => (
              <div key={entry.id} className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground">{entry.date}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  entry.status === "present" ? "bg-success/10 text-success" :
                  entry.status === "late" ? "bg-warning/10 text-warning" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {entry.status === "present" ? <Check className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffAttendance;
