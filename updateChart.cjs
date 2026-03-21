const fs = require('fs');
const filepath = 'd:/smart-staff-insight-main/src/components/AttendanceChart3D.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const newBgCode = `// ── Unique 3D Cybernetic AI live background ─────────────────────────────────────
const STYLES = \`
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
\`;

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
        top: \`\${15 + i * 14}%\`,
        left: 0, right: 0,
        height: '1px',
        background: \`linear-gradient(90deg, transparent, \${i % 2 === 0 ? '#a855f7' : '#06b6d4'}, transparent)\`,
        animation: \`quantumBeam \${4 + i}s infinite ease-in-out \${i * 0.7}s\`,
        opacity: 0,
        pointerEvents: 'none',
        boxShadow: \`0 0 8px \${i % 2 === 0 ? 'rgba(168, 85, 247, 0.8)' : 'rgba(6, 182, 212, 0.8)'}\`
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
          left: \`\${5 + i * 9}%\`,
          width: size, height: size,
          border: \`1px solid \${i % 2 === 0 ? 'rgba(168, 85, 247, 0.6)' : 'rgba(6, 182, 212, 0.6)'}\`,
          background: i % 2 === 0 ? 'rgba(168, 85, 247, 0.1)' : 'rgba(6, 182, 212, 0.1)',
          boxShadow: \`0 0 10px \${i % 2 === 0 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(6, 182, 212, 0.4)'}\`,
          animation: \`floatCube \${8 + (i % 4) * 2}s infinite linear \${i % 3}s\`,
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
          border: \`1.5px solid \${i % 2 === 0 ? 'rgba(168,85,247,0.25)' : 'rgba(6,182,212,0.25)'}\`,
          transform: \`rotateX(\${i * 36}deg) rotateY(\${i * 36}deg)\`,
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
);`;

const split1 = content.split('// ── Unique AI styles (different from HOD chart) ───────────────────────────────');
const beforeStyles = split1[0];
const split2 = split1[1].split('// ── Main Chart Component ───────────────────────────────────────────────────────');
const afterComponents = '// ── Main Chart Component ───────────────────────────────────────────────────────' + split2[1];

const renderSearchRegex = /<HexGrid \/>[\s\S]*?<ScanLines \/>/;
const replacedRender = afterComponents.replace(
  renderSearchRegex,
  `<CyberGrid />
      <AmbientGlow />
      <QuantumBeams />
      <HologramCubes />
      <EnergySphere />`
);

const finalContent = beforeStyles + newBgCode + '\n\n' + replacedRender;

fs.writeFileSync(filepath, finalContent);
console.log('Successfully updated.');
