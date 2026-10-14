import React from 'react';
import { MessageCircle, Phone, Camera, User } from 'lucide-react';

export type WhatsAppTab = 'chats' | 'llamadas' | 'estados' | 'perfil';

interface BottomNavProps {
  currentTab: WhatsAppTab;
  onChangeTab: (tab: WhatsAppTab) => void;
}

const TABS: { id: WhatsAppTab; label: string; Icon: typeof MessageCircle }[] = [
  { id: 'chats', label: 'Chats', Icon: MessageCircle },
  { id: 'llamadas', label: 'Llamadas', Icon: Phone },
  { id: 'estados', label: 'Historias', Icon: Camera },
  { id: 'perfil', label: 'Perfil', Icon: User },
];

export const WhatsAppBottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-red-950/70 px-3 pt-1.5 pb-safe select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {TABS.map(({ id, label, Icon }) => {
          const active = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => onChangeTab(id)}
              className={`flex flex-col items-center justify-center py-1 px-4 cursor-pointer transition-colors ${
                active ? 'text-[#ff2a2a]' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? 'drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]' : ''}
              />
              <span className="text-[10px] font-semibold mt-1 tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
