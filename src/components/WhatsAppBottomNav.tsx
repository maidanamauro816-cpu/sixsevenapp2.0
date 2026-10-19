import React from 'react';
import { MessageCircle, Phone, Camera, Music2 } from 'lucide-react';
import { AIAssistantOrb } from './AIAssistantOrb';

export type WhatsAppTab = 'chats' | 'llamadas' | 'estados' | 'musica' | 'ia' | 'perfil';

interface BottomNavProps {
  currentTab: WhatsAppTab;
  onChangeTab: (tab: WhatsAppTab) => void;
}

const TABS = [
  { id: 'chats' as const, label: 'Chats', Icon: MessageCircle },
  { id: 'estados' as const, label: 'Estados', Icon: Camera },
  { id: 'ia' as const, label: 'SixSeven IA', Icon: null },
  { id: 'llamadas' as const, label: 'Llamadas', Icon: Phone },
  { id: 'musica' as const, label: 'Música', Icon: Music2 },
];

export const WhatsAppBottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black px-2 pt-2 pb-safe select-none">
    <svg aria-hidden="true" viewBox="0 0 100 28" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-7 pointer-events-none">
      <path d="M0 1 H39 C44 1 43 25 50 25 C57 25 56 1 61 1 H100" fill="none" stroke="#ff1a1a" strokeWidth=".65" vectorEffect="non-scaling-stroke" opacity=".9" />
    </svg>
    <div className="relative max-w-md mx-auto flex items-start justify-around gap-0">
      {TABS.map(({ id, label, Icon }) => {
        const active = currentTab === id;
        if (id === 'ia') return (
          <div key={id} className="relative -mt-4 flex flex-col items-center justify-start min-w-0 flex-1">
            <AIAssistantOrb compact onClick={() => onChangeTab('ia')} />
            <span className={`text-[9px] font-semibold mt-1 tracking-tight ${active ? 'text-[#ff2a2a]' : 'text-neutral-500'}`}>{label}</span>
          </div>
        );
        return (
          <button key={id} type="button" onClick={() => onChangeTab(id)} aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center pt-2 pb-1 px-1 cursor-pointer transition-colors ${active ? 'text-[#ff2a2a]' : 'text-neutral-500 hover:text-neutral-300'}`}>
            {Icon && <Icon size={21} strokeWidth={active ? 2.4 : 1.8} className={active ? 'drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]' : ''} />}
            <span className="text-[10px] font-semibold mt-1 tracking-tight">{label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
