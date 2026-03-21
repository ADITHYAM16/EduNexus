import React, { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStaff } from "@/contexts/StaffContext";
import { AlertTriangle, Send, BarChart2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type StaffMember = ReturnType<typeof useStaff>["staffList"][0];

// ── AI Background Elements ───────────────────────────────────────────────────
const AI_STYLES = `
  @keyframes floatUp { 0%{transform:translateY(0) scale(1);opacity:0.7} 100%{transform:translateY(-340px) scale(0.3);opacity:0} }
  @keyframes pulse3d { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.6);opacity:1} }
  @keyframes scanLine { 0%{top:0%;opacity:0.8} 100%{top:100%;opacity:0.2} }
  @keyframes blink { 0%,100%{opacity:0.2} 50%{opacity:1} }
  @keyframes drift { 0%{transform:translate(0,0)} 25%{transform:translate(12px,-8px)} 50%{transform:translate(-6px,14px)} 75%{transform:translate(-14px,-4px)} 100%{transform:translate(0,0)} }
  @keyframes dataStream { 0%{opacity:0;transform:translateY(-10px)} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0;transform:translateY(10px)} }
  @keyframes orbitRing { 0%{transform:rotateZ(0deg) rotateX(70deg)} 100%{transform:rotateZ(360deg) rotateX(70deg)} }
  @keyframes glowPulse { 0%,100%{box-shadow:0 0 6px 2px rgba(59,130,246,0.4)} 50%{box-shadow:0 0 18px 6px rgba(59,130,246,0.9)} }
`;

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 5.2) % 90}%`,
  size: 2 + (i % 3),
  delay: `${(i * 0.4) % 6}s`,
  duration: `${4 + (i % 4)}s`,
  color: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#3b82f6" : "#818cf8",
}));

const NODES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + i * 11}%`,
  top: `${15 + (i % 3) * 22}%`,
  delay: `${i * 0.35}s`,
  color: i % 2 === 0 ? "#3b82f6" : "#10b981",
}));

const DATA_STREAMS = [
  "01001101", "ATTEND", "AI▸▸", "98.2%", "NN▸", "10110", "SYNC", "▸DATA",
  "LEARN", "00110", "PRED", "11001",
];

const AIBackground: React.FC = () => (
  <>
    <style>{AI_STYLES}</style>

    {/* Floating particles */}
    {PARTICLES.map(p => (
      <div key={p.id} style={{
        position: "absolute", left: p.left, bottom: 0,
        width: p.size, height: p.size,
        borderRadius: "50%",
        background: p.color,
        boxShadow: `0 0 6px 2px ${p.color}88`,
        animation: `floatUp ${p.duration} ${p.delay} infinite linear`,
        pointerEvents: "none",
      }} />
    ))}

    {/* Neural nodes with connecting lines SVG */}
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.25 }}>
      {NODES.map((n, i) =>
        NODES.slice(i + 1, i + 3).map((m, j) => (
          <line key={`${i}-${j}`}
            x1={`${10 + n.id * 11}%`} y1={`${15 + (n.id % 3) * 22}%`}
            x2={`${10 + m.id * 11}%`} y2={`${15 + (m.id % 3) * 22}%`}
            stroke="#3b82f6" strokeWidth="0.8"
            strokeDasharray="4 3"
          />
        ))
      )}
    </svg>

    {/* Pulsing neural nodes */}
    {NODES.map(n => (
      <div key={n.id} style={{
        position: "absolute",
        left: n.left, top: n.top,
        width: 7, height: 7,
        borderRadius: "50%",
        background: n.color,
        animation: `pulse3d 2s ${n.delay} infinite ease-in-out, glowPulse 2s ${n.delay} infinite ease-in-out`,
        pointerEvents: "none",
      }} />
    ))}

    {/* Scanning beam */}
    <div style={{
      position: "absolute", left: 0, right: 0, height: 2,
      background: "linear-gradient(90deg, transparent, #3b82f688, #10b98166, transparent)",
      animation: "scanLine 3.5s infinite linear",
      pointerEvents: "none",
    }} />

    {/* Drifting data stream labels */}
    {DATA_STREAMS.map((txt, i) => (
      <div key={i} style={{
        position: "absolute",
        left: `${4 + (i * 8.1) % 88}%`,
        top: `${8 + (i * 13) % 75}%`,
        color: i % 2 === 0 ? "rgba(59,130,246,0.45)" : "rgba(16,185,129,0.35)",
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        letterSpacing: 1,
        animation: `dataStream ${3 + (i % 3)}s ${(i * 0.5) % 4}s infinite ease-in-out, drift ${6 + (i % 4)}s ${(i * 0.3) % 3}s infinite ease-in-out`,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}>{txt}</div>
    ))}

    {/* Corner glow orbs */}
    <div style={{ position:"absolute", top:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
    <div style={{ position:"absolute", bottom:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)", pointerEvents:"none" }} />
    <div style={{ position:"absolute", top:"40%", right:-30, width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 70%)", pointerEvents:"none" }} />
  </>
);

// ── 3D Bar Chart ──────────────────────────────────────────────────────────────
const Chart3D: React.FC<{ data: { month: string; attendance: number }[] }> = ({ data }) => {
  const [rotX, setRotX] = useState(28);
  const [rotY, setRotY] = useState(-25);
  const [containerWidth, setContainerWidth] = useState(500);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Mouse handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setRotY(r => r + dx * 0.5);
    setRotX(r => Math.max(5, Math.min(60, r - dy * 0.3)));
  }, []);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true;
    last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - last.current.x;
    const dy = e.touches[0].clientY - last.current.y;
    last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setRotY(r => r + dx * 0.5);
    setRotX(r => Math.max(5, Math.min(60, r - dy * 0.3)));
  }, []);
  const onTouchEnd = useCallback(() => { dragging.current = false; }, []);

  const maxVal = Math.max(...data.map(d => d.attendance));

  // Responsive sizing based on actual container width
  const isMobile = containerWidth < 420;
  const barW = isMobile ? 16 : 22;
  const gap  = isMobile ? 6  : 10;
  const depth = isMobile ? 8  : 11;
  const chartH = isMobile ? 110 : 140;
  const floorH = isMobile ? 28  : 38;
  const labelFontSize = isMobile ? 8 : 11;
  const valueFontSize = isMobile ? 9 : 12;

  const totalBarsW = data.length * (barW + gap) - gap;
  const padX = isMobile ? 20 : 40;
  const sceneW = totalBarsW + padX * 2;
  const sceneH = chartH + floorH + 50;

  return (
    <div
      ref={wrapRef}
      className="relative w-full rounded-xl select-none"
      style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)",
        height: isMobile ? 280 : 380,
        cursor: "grab",
        overflow: "hidden",
        touchAction: "none",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* AI animated background */}
      <AIBackground />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: isMobile ? 600 : 1000 }}
      >
        <div
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transformStyle: "preserve-3d",
            position: "relative",
            width: sceneW,
            height: sceneH,
          }}
        >
          {/* Floor grid SVG */}
          <svg width={sceneW} height={floorH + 20} style={{ position: "absolute", bottom: 0, left: 0 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * ((floorH + 20) / 5)} x2={sceneW} y2={i * ((floorH + 20) / 5)}
                stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} />
            ))}
            {Array.from({ length: Math.floor(sceneW / 16) + 1 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 16} y1={0} x2={i * 16} y2={floorH + 20}
                stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} />
            ))}
          </svg>

          {/* Bars */}
          {data.map((d, i) => {
            const barH = Math.max(6, Math.round((d.attendance / 100) * chartH));
            const isHigh = d.attendance === maxVal;
            const color     = isHigh ? "#10b981" : d.attendance >= 75 ? "#3b82f6" : "#ef4444";
            const colorDark = isHigh ? "#059669" : d.attendance >= 75 ? "#1d4ed8" : "#b91c1c";
            const colorSide = isHigh ? "#047857" : d.attendance >= 75 ? "#1e40af" : "#991b1b";
            const x = padX + i * (barW + gap);

            return (
              <div key={d.month} style={{
                position: "absolute",
                left: x,
                bottom: floorH + 20,
                width: barW,
                height: barH,
                transformStyle: "preserve-3d",
              }}>
                {/* Front */}
                <div style={{ position:"absolute", width:barW, height:barH, background:`linear-gradient(180deg,${color}dd,${colorDark})` }} />
                {/* Top */}
                <div style={{ position:"absolute", width:barW, height:depth, background:color, top:0, transform:"rotateX(-90deg)", transformOrigin:"top" }} />
                {/* Right */}
                <div style={{ position:"absolute", width:depth, height:barH, background:colorSide, left:barW, transform:"rotateY(90deg)", transformOrigin:"left" }} />
                {/* Value */}
                <div style={{
                  position:"absolute", top: valueFontSize === 9 ? -16 : -20,
                  left:0, width:barW, textAlign:"center",
                  color:"#fff", fontSize:valueFontSize, fontWeight:700,
                  textShadow:"0 1px 4px rgba(0,0,0,0.9)", pointerEvents:"none",
                }}>{d.attendance}</div>
                {/* Month */}
                <div style={{
                  position:"absolute",
                  bottom: -(floorH + 14),
                  left:"50%", transform:"translateX(-50%)",
                  color:"rgba(255,255,255,0.9)",
                  fontSize:labelFontSize, fontWeight:600,
                  whiteSpace:"nowrap",
                  textShadow:"0 1px 3px rgba(0,0,0,0.9)",
                  pointerEvents:"none",
                }}>{d.month}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const HodAttendance: React.FC = () => {
  const { staffList } = useStaff();
  const [warnStaff, setWarnStaff] = useState<StaffMember | null>(null);
  const [chartStaff, setChartStaff] = useState<StaffMember | null>(null);
  const [message, setMessage] = useState("");

  const handleSendWarning = () => {
    if (!message.trim()) return;
    toast({ title: "Warning Sent", description: `Message sent to ${warnStaff?.name}` });
    setMessage("");
    setWarnStaff(null);
  };

  // Generate 12-month 2026 bar data per staff
  const getStaffMonthlyData = (staff: StaffMember) =>
    ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month) => ({
      month,
      attendance: Math.min(100, Math.max(50, staff.attendance + Math.floor(Math.random() * 16 - 8))),
    }));

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Attendance Monitoring</h1>
      <p className="text-muted-foreground text-sm mb-8">Track staff attendance across the department</p>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-4">Staff Attendance Report</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left py-3 pr-4 font-medium">Staff</th>
                <th className="text-left py-3 pr-4 font-medium">Subject</th>
                <th className="text-center py-3 pr-4 font-medium">Attendance %</th>
                <th className="text-center py-3 pr-4 font-medium">Status</th>
                <th className="text-center py-3 pr-4 font-medium">Chart</th>
                <th className="text-center py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{s.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.subject}</td>
                  <td className="py-3 pr-4 text-center font-mono text-foreground">{s.attendance}%</td>
                  <td className="py-3 pr-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      s.attendance >= 85 ? "bg-success/10 text-success" : s.attendance >= 75 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    }`}>
                      {s.attendance >= 85 ? "Good" : s.attendance >= 75 ? "Average" : "Low"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <Button size="sm" variant="outline" onClick={() => setChartStaff(s)} className="gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5" /> View
                    </Button>
                  </td>
                  <td className="py-3 text-center">
                    {s.attendance < 75 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setWarnStaff(s); setMessage(`Dear ${s.name},\n\nYour attendance is currently at ${s.attendance}%. Please ensure regular attendance.\n\nRegards,\nHOD`); }}
                        className="gap-1.5 text-warning border-warning/30 hover:bg-warning/10 hover:text-warning"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Warn
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3D Bar Chart Dialog */}
      <Dialog open={!!chartStaff} onOpenChange={() => setChartStaff(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Staff Attendance — 3D Overview</DialogTitle>
            <p className="text-xs text-primary">Drag to rotate the chart</p>
          </DialogHeader>
          {chartStaff && (
            <div className="pt-1">
              <Chart3D data={getStaffMonthlyData(chartStaff)} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Warn Dialog */}
      <Dialog open={!!warnStaff} onOpenChange={() => setWarnStaff(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Send Warning to {warnStaff?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="resize-none" />
            <Button onClick={handleSendWarning} className="w-full gap-2">
              <Send className="w-4 h-4" /> Send Warning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodAttendance;
