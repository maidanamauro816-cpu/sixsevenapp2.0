import React from 'react';
import { MessageCircle, Phone, Camera, Music2 } from 'lucide-react';
import { SixSevenOrb } from './SixSevenOrb';

export type WhatsAppTab = 'chats' | 'llamadas' | 'estados' | 'musica' | 'ia' | 'perfil';

interface BottomNavProps {
  currentTab: WhatsAppTab;
  onChangeTab: (tab: WhatsAppTab) => void;
}

const TABS = [
  { id: 'chats' as const, label: 'Chats', Icon: MessageCircle },
  { id: 'estados' as const, label: 'Estados', Icon: Camera },
  { id: 'ia' as const, label: 'IA', Icon: null },
  { id: 'llamadas' as const, label: 'Llamadas', Icon: Phone },
  { id: 'musica' as const, label: 'Música', Icon: Music2 },
];

export const WhatsAppBottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => (
  <nav aria-label="Navegación principal SixSeven" className="sx-bottom-nav fixed bottom-0 left-0 right-0 z-40 select-none bg-[var(--bottom-nav-bg,#000000)] px-1 pb-safe">
    <svg className="sx-bottom-nav-line pointer-events-none absolute left-0 top-0 h-10 w-full" viewBox="0 0 360 40" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 12 H122 C148 12 146 1 180 1 C214 1 212 12 238 12 H360" fill="none" stroke="#ff1a1a" strokeWidth="1.35" />
      <path d="M0 13 H122 C148 13 146 2 180 2 C214 2 212 13 238 13 H360" fill="none" stroke="#ff1a1a" strokeWidth="4" opacity=".12" />
    </svg>
    <div className="relative mx-auto grid max-w-md grid-cols-5 items-end gap-0 pt-1">
      {TABS.map(({ id, label, Icon }) => {
        const active = currentTab === id;
        if (id === 'ia') {
          return (
            <button key={id} onClick={() => onChangeTab(id)} aria-label="Abrir SixSeven IA" aria-current={active ? 'page' : undefined}
              className={`sx-orb-nav-button relative z-10 -mt-7 flex min-w-0 flex-col items-center justify-end pb-1 pt-0 transition-transform ${active ? 'scale-105' : 'hover:scale-105'}`}>
              <span className={`sx-orb-nav-halo flex h-[52px] w-[52px] items-center justify-center rounded-full bg-black ${active ? 'sx-orb-nav-active' : ''}`}>
                <SixSevenOrb size={45} label="Ojo central de SixSeven IA" />
              </span>
              <span className={`mt-0.5 text-[9px] font-semibold tracking-tight ${active ? 'text-[#ff2a2a]' : 'text-neutral-500'}`}>SixSeven IA</span>
            </button>
          );
        }
        if (!Icon) return null;
        return (
          <button key={id} onClick={() => onChangeTab(id)} aria-label={label} aria-current={active ? 'page' : undefined}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 px-0 pb-2 pt-2 transition-colors ${active ? 'text-[#ff2a2a]' : 'text-neutral-500 hover:text-neutral-300'}`}>
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} className={active ? 'drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]' : ''} />
            <span className="text-[9px] font-semibold tracking-tight">{label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
