import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockAttendanceHistory, mockWeeklyAttendance } from "@/data/mockData";
import { CalendarCheck, Check, X, MapPin, Shield, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import AttendanceChart3D from "@/components/AttendanceChart3D";

const COLLEGE_LAT = 13.0827;
const COLLEGE_LNG = 80.2707;
const GEOFENCE_RADIUS_M = 500;

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const StaffAttendance: React.FC = () => {
  const [marked, setMarked] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "checking" | "inside" | "outside" | "error">("idle");
  const [showGeoDialog, setShowGeoDialog] = useState(false);
  const { toast } = useToast();
  const attendance = 88;

  const handleMarkAttendance = () => {
    setGeoStatus("checking");
    setShowGeoDialog(true);

    if (!navigator.geolocation) {
      setGeoStatus("error");
      toast({ title: "Geolocation not supported", description: "Your browser doesn't support geolocation.", variant: "destructive" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = getDistanceMeters(pos.coords.latitude, pos.coords.longitude, COLLEGE_LAT, COLLEGE_LNG);
        if (dist <= GEOFENCE_RADIUS_M) {
          setGeoStatus("inside");
          setMarked(true);
          toast({ title: "Attendance Marked ✓", description: `You are within campus (${Math.round(dist)}m away).` });
        } else {
          setGeoStatus("outside");
          toast({ title: "Outside Campus", description: `You are ${Math.round(dist)}m away. Must be within ${GEOFENCE_RADIUS_M}m.`, variant: "destructive" });
        }
      },
      () => {
        setGeoStatus("error");
        toast({ title: "Location Error", description: "Unable to get your location. Please enable GPS.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Attendance</h1>
      <p className="text-muted-foreground text-sm mb-8">Track and mark your daily attendance</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mark Attendance with Live AI Geofencing Background */}
        <div className="relative overflow-hidden border border-primary/40 rounded-xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] bg-[#050B14] group transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] flex flex-col">
          {/* Live AI Geofencing Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Dark Hex/Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-40"></div>
            
            {/* Animated Radar/Ping effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[60px] mix-blend-screen animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-[1.5px] border-primary/40 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-primary/60 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1.5s]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-primary/80 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_3s] shadow-[0_0_20px_rgba(59,130,246,0.8)]"></div>

            {/* AI Network Nodes/Satellites */}
            <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_2px_#3b82f6] animate-[pulse_2s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_2px_#6366f1] animate-[pulse_3s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-[60%] left-[15%] w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_12px_2px_#22d3ee] animate-[pulse_2.5s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[15%] right-[20%] w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_10px_2px_#93c5fd] animate-[pulse_3.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Network Connections (SVG) */}
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" className="animate-[pulse_2s_ease-in-out_infinite]" />
              <line x1="75%" y1="66.6%" x2="50%" y2="50%" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" className="animate-[pulse_3s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
              <line x1="15%" y1="60%" x2="50%" y2="50%" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" className="animate-[pulse_2.5s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
              <line x1="80%" y1="15%" x2="50%" y2="50%" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 3" className="animate-[pulse_3.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
            </svg>

            {/* Sweep Scanner line */}
            <div className="absolute left-0 top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-[scan_4s_linear_infinite] shadow-[0_0_12px_2px_rgba(59,130,246,0.6)] z-0"></div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { top: -10%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 110%; opacity: 0; }
            }
          `}} />

          {/* Glassmorphism Content Layer */}
          <div className="relative z-10 px-4 py-6 backdrop-blur-sm bg-black/10 flex-1 flex flex-col justify-between">
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 bg-primary/20 text-blue-200 border border-primary/40 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)] uppercase tracking-wider">
                <MapPin className="w-2.5 h-2.5 animate-bounce" />
                Geofence Active
              </div>
            </div>
            <div className="text-center py-2 flex-1 flex flex-col items-center justify-center">
              {/* Highlight Calendar */}
              <div className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out group-hover:scale-[1.05] ${
                marked ? "bg-success/20 border-2 border-success/50 shadow-[0_0_25px_rgba(34,197,94,0.4)]" : "bg-gradient-to-br from-primary/30 to-indigo-600/30 border-2 border-primary/50 shadow-[0_0_25px_rgba(59,130,246,0.5)]"
              }`}>
                <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse"></div>
                <div className="absolute inset-1.5 rounded-full border border-white/20 border-dashed animate-[spin_10s_linear_infinite]"></div>
                <CalendarCheck className={`w-7 h-7 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] ${marked ? "text-success" : "text-white"}`} />
              </div>
              
              {/* Highlight Date */}
              <div className="mb-4 inline-block bg-black/50 border border-white/10 px-3 py-1 rounded-xl backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide">
                  {marked ? "Attendance Verified ✓" : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <p className="text-[10px] text-blue-200 mb-5 flex items-center justify-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <Shield className="w-2.5 h-2.5 text-blue-400" /> AI Location Verification Required
              </p>
              
              {/* Highlight Mark Present Button */}
              <button 
                onClick={handleMarkAttendance} 
                disabled={marked}
                className={`relative overflow-hidden px-4 py-2 w-full max-w-[180px] rounded-lg text-[13px] font-black tracking-wide uppercase shadow-lg transition-all duration-300 ${
                  marked 
                    ? "bg-success/20 text-success border border-success/30 opacity-80 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] hover:scale-[1.03] border border-blue-400/50 hover:border-blue-300"
                }`}
              >
                {!marked && <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-[-20deg] -ml-[-100%] transition-all duration-700 ease-out group-hover:ml-[100%]"></div>}
                <span className="relative z-10 flex items-center justify-center gap-1.5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                  {marked ? "Recorded" : "Mark Present"}
                </span>
              </button>
            </div>

            {/* Highlight Current Attendance */}
            <div className="mt-4 p-2 bg-gradient-to-br from-[#0a1526] to-[#040914] rounded-lg text-center border border-primary/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 rounded-full blur-xl translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl -translate-x-1/2 translate-y-1/2"></div>
              
              <p className="relative z-10 text-[9px] font-bold text-blue-300/80 uppercase tracking-[0.1em] mb-0.5">Current Attendance</p>
              <div className="relative z-10 flex items-center justify-center gap-0.5">
                <p className="text-2xl leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] tracking-tighter">
                  {attendance}
                </p>
                <p className="text-sm font-black text-blue-400 mb-0.5 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Attendance Chart */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden shadow-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Monthly Attendance Trend</h2>
            <p className="text-xs mt-0.5 text-muted-foreground">Drag to rotate · AI-powered view</p>
          </div>
          <AttendanceChart3D
            data={mockWeeklyAttendance.map(d => ({ label: d.week, value: d.percentage }))}
          />
        </div>
      </div>

      {/* Geofence Status Dialog */}
      <Dialog open={showGeoDialog} onOpenChange={setShowGeoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Location Verification
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            {geoStatus === "checking" && (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Verifying your location...</p>
              </div>
            )}
            {geoStatus === "inside" && (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <p className="text-sm font-medium text-success">Within campus — Attendance marked!</p>
              </div>
            )}
            {geoStatus === "outside" && (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">You are outside the campus geofence.</p>
                <p className="text-xs text-muted-foreground">You must be within {GEOFENCE_RADIUS_M}m of campus to mark attendance.</p>
              </div>
            )}
            {geoStatus === "error" && (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <p className="text-sm font-medium text-warning">Could not verify location.</p>
                <p className="text-xs text-muted-foreground">Please enable location services and try again.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* History */}
      <div className="mt-6 bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-4">Recent Attendance Log</h2>
        <div className="divide-y divide-border">
          {mockAttendanceHistory.map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <span className="text-sm text-foreground">{entry.date}</span>
              <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                entry.status === "present" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                {entry.status === "present" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {entry.status === "present" ? "Present" : "Absent"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffAttendance;
