import React, { useState, useRef, useCallback, useEffect } from "react";

// ── Unique 3D Cybernetic AI live background ─────────────────────────────────────
const STYLES = `
  @keyframes cyberGridMove {
    0% { transform: rotateX(75deg) translateY(0); }
    100% { transform: rotateX(75deg) translateY(40px); }
  }
  @keyframes floatCube {
    0% { transform: translateY(400px) rotateX(0deg) rotateY(0deg); opacity: 0; }
    15% { opacity: 0.8; }
    85% { opacity: 0.8; }
    100% { transform: translateY(-100px) rotateX(360deg) rotateY(360deg); opacity: 0; }
  }
  @keyframes quantumBeam {
    0% { transform: translateX(-100%); opacity: 0; }
    30% { opacity: 1; }
    70% { opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  @keyframes sphereRotate {
    0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
    100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
  }
  @keyframes hudSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CyberGrid: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
    perspective: '800px'
  }}>
    <div style={{
      position: 'absolute', bottom: '-50%', left: '-50%', right: '-50%', height: '150%',
      backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.25) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      transform: 'rotateX(75deg) translateY(0)',
      animation: 'cyberGridMove 3s linear infinite',
      maskImage: 'linear-gradient(transparent 10%, black 80%)',
      WebkitMaskImage: 'linear-gradient(transparent 10%, black 80%)'
    }} />
  </div>
);

const QuantumBeams: React.FC = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: `${15 + i * 14}%`,
        left: 0, right: 0,
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? '#a855f7' : '#06b6d4'}, transparent)`,
        animation: `quantumBeam ${4 + i}s infinite ease-in-out ${i * 0.7}s`,
        opacity: 0,
        pointerEvents: 'none',
        boxShadow: `0 0 8px ${i % 2 === 0 ? 'rgba(168, 85, 247, 0.8)' : 'rgba(6, 182, 212, 0.8)'}`
      }} />
    ))}
  </>
);

const HologramCubes: React.FC = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => {
      const size = 12 + (i % 3) * 6;
      return (
        <div key={i} style={{
          position: 'absolute',
          left: `${5 + i * 9}%`,
          width: size, height: size,
          border: `1px solid ${i % 2 === 0 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(6, 182, 212, 0.6)'}`,
          background: i % 2 === 0 ? 'rgba(168, 85, 247, 0.1)' : 'rgba(6, 182, 212, 0.1)',
          boxShadow: `0 0 10px ${i % 2 === 0 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(6, 182, 212, 0.4)'}`,
          animation: `floatCube ${8 + (i % 4) * 2}s infinite linear ${i % 3}s`,
          pointerEvents: 'none',
        }} />
      );
    })}
  </>
);

const EnergySphere: React.FC = () => (
  <div style={{
    position: 'absolute', top: '15%', right: '15%',
    width: '140px', height: '140px',
    perspective: '800px', pointerEvents: 'none',
  }}>
    <div style={{
      width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d',
      animation: 'sphereRotate 20s infinite linear',
    }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `1.5px solid ${i % 2 === 0 ? 'rgba(168,85,247,0.25)' : 'rgba(6,182,212,0.25)'}`,
          transform: `rotateX(${i * 36}deg) rotateY(${i * 36}deg)`,
          boxShadow: '0 0 10px rgba(6,182,212,0.1) inset',
        }} />
      ))}
    </div>
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      border: '1px dashed rgba(168,85,247,0.4)',
      animation: 'hudSpin 15s infinite linear reverse',
    }} />
  </div>
);

const AmbientGlow: React.FC = () => (
  <>
    <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
  </>
);

// ── Main Chart Component ───────────────────────────────────────────────────────
interface AttendanceChart3DProps {
  data: { label: string; value: number }[];
}

const AttendanceChart3D: React.FC<AttendanceChart3DProps> = ({ data }) => {
  const [rotX, setRotX] = useState(26);
  const [rotY, setRotY] = useState(-20);
  const [containerWidth, setContainerWidth] = useState(500);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width));
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Mouse
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
    setRotX(r => Math.max(5, Math.min(65, r - dy * 0.3)));
  }, []);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  // Touch
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
    setRotX(r => Math.max(5, Math.min(65, r - dy * 0.3)));
  }, []);
  const onTouchEnd = useCallback(() => { dragging.current = false; }, []);

  const maxVal = Math.max(...data.map(d => d.value));
  const isMobile = containerWidth < 440;

  const barW   = isMobile ? 20 : 30;
  const gap    = isMobile ? 7  : 14;
  const depth  = isMobile ? 10 : 16;
  const chartH = isMobile ? 130 : 180;
  const floorH = isMobile ? 30  : 44;
  const padX   = isMobile ? 18  : 44;
  const labelFs = isMobile ? 8  : 11;
  const valueFs = isMobile ? 9  : 12;

  const sceneW = data.length * (barW + gap) - gap + padX * 2;
  const sceneH = chartH + floorH + 52;
  const containerH = isMobile ? 300 : 400;

  return (
    <div
      ref={wrapRef}
      className="relative w-full rounded-xl select-none overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #050d1a 0%, #071428 40%, #040e1f 70%, #060f1c 100%)",
        height: containerH,
        cursor: "grab",
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
      <style>{STYLES}</style>

      {/* AI background layers */}
      <CyberGrid />
      <AmbientGlow />
      <QuantumBeams />
      <HologramCubes />
      <EnergySphere />

      {/* 3D scene */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: isMobile ? 550 : 950 }}
      >
        <div style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: "preserve-3d",
          position: "relative",
          width: sceneW,
          height: sceneH,
        }}>
          {/* Floor grid */}
          <svg width={sceneW} height={floorH + 18} style={{ position: "absolute", bottom: 0, left: 0 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`}
                x1={0} y1={i * ((floorH + 18) / 5)} x2={sceneW} y2={i * ((floorH + 18) / 5)}
                stroke="rgba(99,179,237,0.22)" strokeWidth={0.7}
              />
            ))}
            {Array.from({ length: Math.floor(sceneW / 14) + 1 }).map((_, i) => (
              <line key={`v${i}`}
                x1={i * 14} y1={0} x2={i * 14} y2={floorH + 18}
                stroke="rgba(99,179,237,0.22)" strokeWidth={0.7}
              />
            ))}
          </svg>

          {/* Bars */}
          {data.map((d, i) => {
            const barH = Math.max(6, Math.round((d.value / 100) * chartH));
            const isHigh = d.value === maxVal;
            const isLow  = d.value < 75;
            const color     = isHigh ? "#10b981" : isLow ? "#f87171" : "#63b3ed";
            const colorDark = isHigh ? "#047857" : isLow ? "#b91c1c" : "#1e40af";
            const colorSide = isHigh ? "#065f46" : isLow ? "#991b1b" : "#1e3a8a";
            const x = padX + i * (barW + gap);

            return (
              <div key={d.label} style={{
                position: "absolute",
                left: x,
                bottom: floorH + 18,
                width: barW,
                height: barH,
                transformStyle: "preserve-3d",
              }}>
                {/* Front */}
                <div style={{
                  position: "absolute", width: barW, height: barH,
                  background: `linear-gradient(180deg, ${color}ee 0%, ${colorDark} 100%)`,
                  boxShadow: `0 0 8px 1px ${color}55`,
                }} />
                {/* Top */}
                <div style={{
                  position: "absolute", width: barW, height: depth,
                  background: color, top: 0,
                  transform: "rotateX(-90deg)", transformOrigin: "top",
                  boxShadow: `0 0 10px 2px ${color}88`,
                }} />
                {/* Right */}
                <div style={{
                  position: "absolute", width: depth, height: barH,
                  background: colorSide, left: barW,
                  transform: "rotateY(90deg)", transformOrigin: "left",
                }} />
                {/* Value */}
                <div style={{
                  position: "absolute",
                  top: valueFs === 9 ? -16 : -22,
                  left: 0, width: barW,
                  textAlign: "center",
                  color: "#e2e8f0",
                  fontSize: valueFs,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  textShadow: `0 0 8px ${color}, 0 1px 4px rgba(0,0,0,0.9)`,
                  pointerEvents: "none",
                }}>{d.value}</div>
                {/* Label */}
                <div style={{
                  position: "absolute",
                  bottom: -(floorH + 12),
                  left: "50%", transform: "translateX(-50%)",
                  color: "rgba(226,232,240,0.85)",
                  fontSize: labelFs,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: "nowrap",
                  textShadow: "0 1px 4px rgba(0,0,0,0.95)",
                  pointerEvents: "none",
                }}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      <div style={{
        position: "absolute", bottom: 8, right: 12,
        color: "rgba(99,179,237,0.55)",
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        pointerEvents: "none",
        letterSpacing: 0.5,
      }}>⟳ drag to rotate</div>
    </div>
  );
};

export default AttendanceChart3D;
