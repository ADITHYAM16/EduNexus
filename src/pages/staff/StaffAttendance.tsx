import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockAttendanceHistory, mockWeeklyAttendance } from "@/data/mockData";
import { CalendarCheck, Check, X, MapPin, Shield, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
        {/* Mark Attendance with Geofencing */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Today's Attendance</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              Geofenced
            </div>
          </div>
          <div className="text-center py-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              marked ? "bg-success/10" : "bg-muted"
            }`}>
              <CalendarCheck className={`w-8 h-8 ${marked ? "text-success" : "text-muted-foreground"}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {marked ? "Attendance marked for today ✓" : "March 14, 2026"}
            </p>
            <p className="text-xs text-muted-foreground/60 mb-4 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Location verification required
            </p>
            <button onClick={handleMarkAttendance} disabled={marked}
              className="px-6 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-opacity">
              {marked ? "Marked" : "Mark Present"}
            </button>
          </div>
          <div className="mt-4 p-4 bg-muted/40 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Current Attendance</p>
            <p className="text-3xl font-bold text-foreground">{attendance}%</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Weekly Attendance Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
