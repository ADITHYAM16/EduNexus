import React, { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStaff } from "@/contexts/StaffContext";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Send, BarChart2, Loader2, CalendarCheck, Users, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface AttendanceRecord { id: string; staff_id: string; date: string; status: "present" | "absent" | "late"; }
interface StaffSummary { staffId: string; name: string; subject: string; total: number; present: number; absent: number; late: number; percentage: number; }

// ── AI Background ─────────────────────────────────────────────────────────────
const AI_STYLES = `
  @keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:0.7}100%{transform:translateY(-340px) scale(0.3);opacity:0}}
  @keyframes pulse3d{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.6);opacity:1}}
  @keyframes scanLine{0%{top:0%;opacity:0.8}100%{top:100%;opacity:0.2}}
  @keyframes drift{0%{transform:translate(0,0)}25%{transform:translate(12px,-8px)}50%{transform:translate(-6px,14px)}75%{transform:translate(-14px,-4px)}100%{transform:translate(0,0)}}
  @keyframes dataStream{0%{opacity:0;transform:translateY(-10px)}10%{opacity:1}90%{opacity:1}100%{opacity:0;transform:translateY(10px)}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 6px 2px rgba(59,130,246,0.4)}50%{box-shadow:0 0 18px 6px rgba(59,130,246,0.9)}}
`;
const PARTICLES = Array.from({length:18},(_,i)=>({id:i,left:`${5+(i*5.2)%90}%`,size:2+(i%3),delay:`${(i*0.4)%6}s`,duration:`${4+(i%4)}s`,color:i%3===0?"#10b981":i%3===1?"#3b82f6":"#818cf8"}));
const NODES = Array.from({length:8},(_,i)=>({id:i,left:`${10+i*11}%`,top:`${15+(i%3)*22}%`,delay:`${i*0.35}s`,color:i%2===0?"#3b82f6":"#10b981"}));
const DATA_STREAMS = ["01001101","ATTEND","AI▸▸","98.2%","NN▸","10110","SYNC","▸DATA","LEARN","00110","PRED","11001"];

const AIBackground: React.FC = () => (
  <>
    <style>{AI_STYLES}</style>
    {PARTICLES.map(p=><div key={p.id} style={{position:"absolute",left:p.left,bottom:0,width:p.size,height:p.size,borderRadius:"50%",background:p.color,boxShadow:`0 0 6px 2px ${p.color}88`,animation:`floatUp ${p.duration} ${p.delay} infinite linear`,pointerEvents:"none"}}/>)}
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:0.25}}>
      {NODES.map((n,i)=>NODES.slice(i+1,i+3).map((m,j)=><line key={`${i}-${j}`} x1={`${10+n.id*11}%`} y1={`${15+(n.id%3)*22}%`} x2={`${10+m.id*11}%`} y2={`${15+(m.id%3)*22}%`} stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="4 3"/>))}
    </svg>
    {NODES.map(n=><div key={n.id} style={{position:"absolute",left:n.left,top:n.top,width:7,height:7,borderRadius:"50%",background:n.color,animation:`pulse3d 2s ${n.delay} infinite ease-in-out, glowPulse 2s ${n.delay} infinite ease-in-out`,pointerEvents:"none"}}/>)}
    <div style={{position:"absolute",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#3b82f688,#10b98166,transparent)",animation:"scanLine 3.5s infinite linear",pointerEvents:"none"}}/>
    {DATA_STREAMS.map((txt,i)=><div key={i} style={{position:"absolute",left:`${4+(i*8.1)%88}%`,top:`${8+(i*13)%75}%`,color:i%2===0?"rgba(59,130,246,0.45)":"rgba(16,185,129,0.35)",fontSize:9,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:1,animation:`dataStream ${3+(i%3)}s ${(i*0.5)%4}s infinite ease-in-out, drift ${6+(i%4)}s ${(i*0.3)%3}s infinite ease-in-out`,pointerEvents:"none",whiteSpace:"nowrap"}}>{txt}</div>)}
    <div style={{position:"absolute",top:-40,left:-40,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
    <div style={{position:"absolute",bottom:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.10) 0%,transparent 70%)",pointerEvents:"none"}}/>
  </>
);

// ── 3D Bar Chart ──────────────────────────────────────────────────────────────
const Chart3D: React.FC<{data:{month:string;attendance:number}[]}> = ({data}) => {
  const [rotX,setRotX] = useState(28);
  const [rotY,setRotY] = useState(-25);
  const [containerWidth,setContainerWidth] = useState(500);
  const dragging = useRef(false);
  const last = useRef({x:0,y:0});
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const el=wrapRef.current; if(!el) return;
    const ro=new ResizeObserver(e=>{setContainerWidth(e[0].contentRect.width);});
    ro.observe(el); setContainerWidth(el.clientWidth);
    return ()=>ro.disconnect();
  },[]);

  const onMouseDown=useCallback((e:React.MouseEvent)=>{dragging.current=true;last.current={x:e.clientX,y:e.clientY};},[]);
  const onMouseMove=useCallback((e:React.MouseEvent)=>{if(!dragging.current)return;const dx=e.clientX-last.current.x;const dy=e.clientY-last.current.y;last.current={x:e.clientX,y:e.clientY};setRotY(r=>r+dx*0.5);setRotX(r=>Math.max(5,Math.min(60,r-dy*0.3)));},[]);
  const onMouseUp=useCallback(()=>{dragging.current=false;},[]);
  const onTouchStart=useCallback((e:React.TouchEvent)=>{dragging.current=true;last.current={x:e.touches[0].clientX,y:e.touches[0].clientY};},[]);
  const onTouchMove=useCallback((e:React.TouchEvent)=>{if(!dragging.current)return;e.preventDefault();const dx=e.touches[0].clientX-last.current.x;const dy=e.touches[0].clientY-last.current.y;last.current={x:e.touches[0].clientX,y:e.touches[0].clientY};setRotY(r=>r+dx*0.5);setRotX(r=>Math.max(5,Math.min(60,r-dy*0.3)));},[]);
  const onTouchEnd=useCallback(()=>{dragging.current=false;},[]);

  const maxVal=Math.max(...data.map(d=>d.attendance));
  const isMobile=containerWidth<420;
  const barW=isMobile?16:22,gap=isMobile?6:10,depth=isMobile?8:11,chartH=isMobile?110:140,floorH=isMobile?28:38;
  const labelFontSize=isMobile?8:11,valueFontSize=isMobile?9:12;
  const totalBarsW=data.length*(barW+gap)-gap;
  const padX=isMobile?20:40;
  const sceneW=totalBarsW+padX*2,sceneH=chartH+floorH+50;

  return (
    <div ref={wrapRef} className="relative w-full rounded-xl select-none"
      style={{background:"linear-gradient(135deg,#0a0f1e 0%,#0d1b3e 50%,#0a1628 100%)",height:isMobile?280:380,cursor:"grab",overflow:"hidden",touchAction:"none"}}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      <AIBackground/>
      <div className="absolute inset-0 flex items-center justify-center" style={{perspective:isMobile?600:1000}}>
        <div style={{transform:`rotateX(${rotX}deg) rotateY(${rotY}deg)`,transformStyle:"preserve-3d",position:"relative",width:sceneW,height:sceneH}}>
          <svg width={sceneW} height={floorH+20} style={{position:"absolute",bottom:0,left:0}}>
            {Array.from({length:6}).map((_,i)=><line key={`h${i}`} x1={0} y1={i*((floorH+20)/5)} x2={sceneW} y2={i*((floorH+20)/5)} stroke="rgba(255,255,255,0.18)" strokeWidth={0.8}/>)}
            {Array.from({length:Math.floor(sceneW/16)+1}).map((_,i)=><line key={`v${i}`} x1={i*16} y1={0} x2={i*16} y2={floorH+20} stroke="rgba(255,255,255,0.18)" strokeWidth={0.8}/>)}
          </svg>
          {data.map((d,i)=>{
            const barH=Math.max(6,Math.round((d.attendance/100)*chartH));
            const isHigh=d.attendance===maxVal;
            const color=isHigh?"#10b981":d.attendance>=75?"#3b82f6":"#ef4444";
            const colorDark=isHigh?"#059669":d.attendance>=75?"#1d4ed8":"#b91c1c";
            const colorSide=isHigh?"#047857":d.attendance>=75?"#1e40af":"#991b1b";
            const x=padX+i*(barW+gap);
            return (
              <div key={d.month} style={{position:"absolute",left:x,bottom:floorH+20,width:barW,height:barH,transformStyle:"preserve-3d"}}>
                <div style={{position:"absolute",width:barW,height:barH,background:`linear-gradient(180deg,${color}dd,${colorDark})`}}/>
                <div style={{position:"absolute",width:barW,height:depth,background:color,top:0,transform:"rotateX(-90deg)",transformOrigin:"top"}}/>
                <div style={{position:"absolute",width:depth,height:barH,background:colorSide,left:barW,transform:"rotateY(90deg)",transformOrigin:"left"}}/>
                <div style={{position:"absolute",top:valueFontSize===9?-16:-20,left:0,width:barW,textAlign:"center",color:"#fff",fontSize:valueFontSize,fontWeight:700,textShadow:"0 1px 4px rgba(0,0,0,0.9)",pointerEvents:"none"}}>{d.attendance}</div>
                <div style={{position:"absolute",bottom:-(floorH+14),left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.9)",fontSize:labelFontSize,fontWeight:600,whiteSpace:"nowrap",textShadow:"0 1px 3px rgba(0,0,0,0.9)",pointerEvents:"none"}}>{d.month}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const HodAttendance: React.FC = () => {
  const { staffList } = useStaff();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnStaff, setWarnStaff] = useState<StaffSummary | null>(null);
  const [chartStaff, setChartStaff] = useState<StaffSummary | null>(null);
  const [message, setMessage] = useState("");

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("attendance").select("id,staff_id,date,status").order("date", { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { 
    fetchAttendance(); 
    const interval = setInterval(fetchAttendance, 30000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  const summaries: StaffSummary[] = staffList.map(s => {
    const r = records.filter(r => r.staff_id === s.id);
    const total = r.length;
    const present = r.filter(x => x.status === "present").length;
    const absent = r.filter(x => x.status === "absent").length;
    const late = r.filter(x => x.status === "late").length;
    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    return { staffId: s.id, name: s.name, subject: s.subject || "—", total, present, absent, late, percentage };
  });

  const getMonthlyData = (staffId: string) =>
    MONTHS.map((month, i) => {
      const mr = records.filter(r => r.staff_id === staffId && new Date(r.date).getMonth() === i);
      const t = mr.length;
      const p = mr.filter(r => r.status === "present").length;
      const l = mr.filter(r => r.status === "late").length;
      return { month, attendance: t > 0 ? Math.round(((p + l * 0.5) / t) * 100) : 0 };
    });

  const handleSendWarning = () => {
    if (!message.trim()) return;
    toast({ title: "Warning Sent", description: `Message sent to ${warnStaff?.name}` });
    setMessage(""); setWarnStaff(null);
  };

  const lowCount = summaries.filter(s => s.total > 0 && s.percentage < 75).length;
  const avgPct = summaries.filter(s => s.total > 0).length > 0
    ? Math.round(summaries.filter(s => s.total > 0).reduce((a, s) => a + s.percentage, 0) / summaries.filter(s => s.total > 0).length)
    : 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Monitor</h1>
          <p className="text-sm text-muted-foreground">Staff mark their own attendance from the staff portal</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAttendance} className="gap-2">
          <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}/> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary"/></div>
          <div><p className="text-xs text-muted-foreground">Total Staff</p><p className="text-xl font-bold text-foreground">{staffList.length}</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CalendarCheck className="w-5 h-5 text-success"/></div>
          <div><p className="text-xs text-muted-foreground">Avg Attendance</p><p className="text-xl font-bold text-success">{avgPct}%</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-destructive"/></div>
          <div><p className="text-xs text-muted-foreground">Low Attendance</p><p className="text-xl font-bold text-destructive">{lowCount}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary"/></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Staff</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Subject</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Present</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Absent</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Late</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Total Days</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Attendance %</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Chart</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map(s => (
                <tr key={s.staffId} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{s.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.subject}</td>
                  <td className="px-4 py-3 text-center font-medium text-success">{s.present}</td>
                  <td className="px-4 py-3 text-center font-medium text-destructive">{s.absent}</td>
                  <td className="px-4 py-3 text-center font-medium text-warning">{s.late}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{s.total}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{s.total > 0 ? `${s.percentage}%` : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {s.total === 0 ? <span className="text-xs text-muted-foreground">No data</span> : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.percentage >= 85 ? "bg-success/10 text-success" : s.percentage >= 75 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                        {s.percentage >= 85 ? "Good" : s.percentage >= 75 ? "Average" : "Low"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="outline" onClick={() => setChartStaff(s)} className="gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5"/> View
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.total > 0 && s.percentage < 75 ? (
                      <Button size="sm" variant="outline"
                        onClick={() => { setWarnStaff(s); setMessage(`Dear ${s.name},\n\nYour attendance is currently at ${s.percentage}%. Please ensure regular attendance.\n\nRegards,\nHOD`); }}
                        className="gap-1.5 text-warning border-warning/30 hover:bg-warning/10">
                        <AlertTriangle className="w-3.5 h-3.5"/> Warn
                      </Button>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 3D Chart Dialog */}
      <Dialog open={!!chartStaff} onOpenChange={() => setChartStaff(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{chartStaff?.name} — Monthly Attendance</DialogTitle>
            <p className="text-xs text-primary">Drag to rotate the chart</p>
          </DialogHeader>
          {chartStaff && <div className="pt-1"><Chart3D data={getMonthlyData(chartStaff.staffId).some(d => d.attendance > 0) ? getMonthlyData(chartStaff.staffId) : MONTHS.map(m => ({ month: m, attendance: 0 }))}/></div>}
        </DialogContent>
      </Dialog>

      {/* Warn Dialog */}
      <Dialog open={!!warnStaff} onOpenChange={() => setWarnStaff(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning"/> Send Warning to {warnStaff?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="resize-none"/>
            <Button onClick={handleSendWarning} className="w-full gap-2">
              <Send className="w-4 h-4"/> Send Warning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodAttendance;
