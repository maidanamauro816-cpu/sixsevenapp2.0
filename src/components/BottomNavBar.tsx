import React from 'react';
import { Home, MessageCircle, PlusCircle, Phone, Music2 } from 'lucide-react';

export type MainTab = 'inicio' | 'chat' | 'historias' | 'llamadas' | 'musica';

interface BottomNavBarProps {
  currentTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  unreadChats?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onChangeTab,
  unreadChats = 6,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 border-t border-neutral-900/90 backdrop-blur-md px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Inicio (house icon) */}
        <button
          onClick={() => onChangeTab('inicio')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'inicio' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Home
            size={22}
            strokeWidth={currentTab === 'inicio' ? 2.5 : 2}
            className={currentTab === 'inicio' ? 'text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]' : ''}
          />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Inicio</span>
        </button>

        {/* 2. Chat (message bubble) */}
        <button
          onClick={() => onChangeTab('chat')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'chat' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className="relative">
            <MessageCircle
              size={22}
              strokeWidth={currentTab === 'chat' ? 2.5 : 2}
              className={currentTab === 'chat' ? 'text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]' : ''}
            />
            {unreadChats > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#ff0000] text-white text-[9px] font-black rounded-full min-w-4 text-center leading-tight shadow-[0_0_6px_#ff0000]">
                {unreadChats}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Chat</span>
        </button>

        {/* 3. Historias (plus circle / stories) */}
        <button
          onClick={() => onChangeTab('historias')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'historias' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className="relative p-0.5">
            <PlusCircle
              size={24}
              strokeWidth={currentTab === 'historias' ? 2.5 : 2}
              className={currentTab === 'historias' ? 'text-[#ff0000] drop-shadow-[0_0_10px_#ff0000]' : 'text-neutral-400 group-hover:text-white'}
            />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Historias</span>
        </button>

        {/* 4. Llamadas (phone icon) */}
        <button
          onClick={() => onChangeTab('llamadas')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'llamadas' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Phone
            size={22}
            strokeWidth={currentTab === 'llamadas' ? 2.5 : 2}
            className={currentTab === 'llamadas' ? 'text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]' : ''}
          />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Llamadas</span>
        </button>

        {/* 5. Música (music note icon - Canserbero) */}
        <button
          onClick={() => onChangeTab('musica')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'musica' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className="relative">
            <Music2
              size={22}
              strokeWidth={currentTab === 'musica' ? 2.5 : 2}
              className={currentTab === 'musica' ? 'text-[#ff0000] animate-bounce drop-shadow-[0_0_10px_#ff0000]' : ''}
            />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight text-center">
            Música
          </span>
        </button>
      </div>
    </nav>
  );
};
