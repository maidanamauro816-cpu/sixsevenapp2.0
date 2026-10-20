import React, { useId, useState } from 'react';

interface SixSevenOrbProps {
  size?: number;
  className?: string;
  listening?: boolean;
  label?: string;
}

/** Orbe IA: ojo tecnológico rojo animado. El logotipo S/corona se mantiene separado. */
export const SixSevenOrb: React.FC<SixSevenOrbProps> = ({
  size = 52, className = '', listening = false, label = 'Ojo de SixSeven IA',
}) => {
  const uid = useId().replace(/:/g, '');
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}
      className={`sx-sixseven-orb sx-ai-eye ${listening ? 'sx-orb-listening' : ''} ${className}`}
      style={{ flex: '0 0 auto', overflow: 'visible', cursor: 'pointer' }}
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width - .5) * 12;
        const y = ((event.clientY - box.top) / box.height - .5) * 12;
        setPupil({ x, y });
      }}
      onPointerLeave={() => setPupil({ x: 0, y: 0 })}>
      <defs>
        <radialGradient id={`eye-glass-${uid}`} cx="30%" cy="22%" r="80%">
          <stop offset="0%" stopColor="#555b63" stopOpacity=".9"/>
          <stop offset="42%" stopColor="#111318" stopOpacity=".96"/>
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <radialGradient id={`eye-iris-${uid}`}>
          <stop offset="0%" stopColor="#080000"/>
          <stop offset="38%" stopColor="#65040b"/>
          <stop offset="68%" stopColor="#ff1828"/>
          <stop offset="86%" stopColor="#69000b"/>
          <stop offset="100%" stopColor="#100000"/>
        </radialGradient>
        <filter id={`eye-glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id={`eye-clip-${uid}`}><circle cx="50" cy="50" r="44"/></clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill="#000" stroke="#ff2638" strokeWidth="2.4" filter={`url(#eye-glow-${uid})`}/>
      <circle cx="50" cy="50" r="43.5" fill={`url(#eye-glass-${uid})`} stroke="#ff6470" strokeOpacity=".6" strokeWidth="1"/>
      <g clipPath={`url(#eye-clip-${uid})`}>
        <circle cx="50" cy="50" r="36" fill="none" stroke="#ff2434" strokeWidth="1.5" opacity=".8"/>
        <circle cx="50" cy="50" r="31" fill="none" stroke="#a30a19" strokeWidth="2" strokeDasharray="2 3" className="sx-eye-rotate"/>
        <circle cx="50" cy="50" r="25" fill={`url(#eye-iris-${uid})`} stroke="#ff4553" strokeWidth="1.6" filter={`url(#eye-glow-${uid})`}/>
        {Array.from({length:32}, (_,i) => <path key={i} d="M50 23 L50 29" transform={`rotate(${i*11.25} 50 50)`} stroke="#ff737d" strokeWidth={i%2 ? ".7" : "1.3"} opacity=".8"/>)}
        <g transform={`translate(${pupil.x} ${pupil.y})`}>
          <ellipse cx="50" cy="50" rx="8.5" ry="19" fill="#000" stroke="#ff1c30" strokeWidth="2" filter={`url(#eye-glow-${uid})`}/>
          <ellipse cx="47" cy="43" rx="2" ry="5" fill="#fff" opacity=".55"/>
        </g>
        <path d="M18 39 Q50 5 82 39" fill="none" stroke="#fff" strokeOpacity=".26" strokeWidth="2"/>
      </g>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth=".8"/>
    </svg>
  );
};
