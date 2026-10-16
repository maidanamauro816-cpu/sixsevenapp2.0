/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { WhatsAppBottomNav, WhatsAppTab } from './components/WhatsAppBottomNav';
import { WhatsAppChatList, WhatsAppChat } from './components/WhatsAppChatList';
import { WhatsAppChatRoom } from './components/WhatsAppChatRoom';
import { ComingSoon } from './components/ComingSoon';
import { MusicView } from './components/MusicView';
import { NewChatView } from './components/NewChatView';
import { useToast } from './components/Toast';
import { ProfileMenuView } from './components/ProfileMenuView';
import { MyProfileView } from './components/MyProfileView';
import { isNative } from './native';
import { StoriesCreateView } from './components/StoriesCreateView';
import { StoryStatus } from './components/MauroProfileBanner';
import { SixSevenEasterEgg } from './components/SixSevenEasterEgg';
import { PWAInstallButton } from './components/PWAInstallButton';
import { X, Heart, Plus } from 'lucide-react';
import { playLikePop } from './utils/audio';

function MainApp() {
  const { user } = useAuth();
  const { toast, show } = useToast();

  // Bottom Nav Tab: 'chats' | 'llamadas' | 'estados' | 'perfil'
  const [currentTab, setCurrentTab] = useState<WhatsAppTab>('chats');

  // Active chat room
  const [activeChat, setActiveChat] = useState<WhatsAppChat | null>(null);

  // Active story viewer
  const [viewingStory, setViewingStory] = useState<StoryStatus | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Story creator modal
  const [creatingStory, setCreatingStory] = useState(false);

  // Nuevo chat
  const [newChatOpen, setNewChatOpen] = useState(false);

  // Mi perfil (pantalla completa)
  const [showMyProfile, setShowMyProfile] = useState(false);

  // Easter egg
  const [easterEggOpen, setEasterEggOpen] = useState(false);

  // Handle Android hardware back button without unexpectedly exiting the app.
  React.useEffect(() => {
    if (!isNative) return;
    let active = true;
    const registration = CapacitorApp.addListener('backButton', () => {
      if (!active) return;
      if (viewingStory) { setViewingStory(null); return; }
      if (creatingStory) { setCreatingStory(false); return; }
      if (activeChat) { setActiveChat(null); return; }
      if (newChatOpen) { setNewChatOpen(false); return; }
      if (showMyProfile) { setShowMyProfile(false); return; }
      if (currentTab !== 'chats') { setCurrentTab('chats'); return; }
      // At the home screen, keep SixSeven open instead of exiting on one back press.
    });
    return () => {
      active = false;
      void registration.then((listener) => listener.remove());
    };
  }, [activeChat, viewingStory, creatingStory, newChatOpen, showMyProfile, currentTab]);

  // Auto advance timer for story viewer
  React.useEffect(() => {
    if (!viewingStory) {
      setStoryProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          setViewingStory(null);
          return 0;
        }
        return prev + 2.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [viewingStory]);

  // If user is not logged in, keep login screen
  if (!user) {
    return (
      <div className="relative min-h-screen w-full bg-[#000000] text-white selection:bg-red-600">
        {!isNative && <PWAInstallButton />}
        <LoginScreen onLoginSuccess={() => setCurrentTab('chats')} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white font-sans overflow-x-hidden selection:bg-red-600">
      {/* PWA In-App Install Banner */}
      {!isNative && <PWAInstallButton />}

      {/* Main Tab Screens */}
      <main className="w-full h-full">
        {/* 1. Chats Tab:  chat list with Mauro profile cover & horizontal stories at top */}
        {currentTab === 'chats' && (
          <WhatsAppChatList
            onOpenChat={(chat) => setActiveChat(chat)}
            onAddStory={() => show('Historias: próximamente')}
            onNewChat={() => setNewChatOpen(true)}
          />
        )}

        {currentTab === 'llamadas' && (
          <ComingSoon title="Llamadas" text="Las llamadas de voz y video llegan en una próxima versión." />
        )}

        {currentTab === 'estados' && (
          <ComingSoon title="Historias" text="Las historias llegan en una próxima versión." />
        )}

        {currentTab === 'musica' && <MusicView />}

        {/* Perfil: menú de cuenta */}
        {currentTab === 'perfil' && <ProfileMenuView onOpenProfile={() => setShowMyProfile(true)} />}
      </main>

      {/*  Bottom Navigation (4 Icons: Chats, Llamadas, Estados, Musica) */}
      <WhatsAppBottomNav currentTab={currentTab} onChangeTab={setCurrentTab} />

      {/* Mi perfil */}
      {showMyProfile && <MyProfileView onBack={() => setShowMyProfile(false)} />}

      {toast}

      {/* Nuevo chat */}
      {newChatOpen && (
        <NewChatView
          onBack={() => setNewChatOpen(false)}
          onOpenChat={(chat) => {
            setNewChatOpen(false);
            setActiveChat(chat);
          }}
        />
      )}

      {/* Chat abierto (pantalla completa) */}
      {activeChat && <WhatsAppChatRoom chat={activeChat} onBack={() => setActiveChat(null)} />}

      {/* Story Creator Modal */}
      {creatingStory && (
        <div className="fixed inset-0 z-50 bg-black">
          <StoriesCreateView
            onStoryPublished={() => {
              setCreatingStory(false);
              setCurrentTab('estados');
            }}
          />
          <button
            onClick={() => setCreatingStory(false)}
            className="fixed top-4 right-4 z-50 p-2 rounded-full bg-neutral-900 border border-neutral-800 text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Fullscreen  Status Story Viewer */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-150">
          <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between p-4 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-red-600 transition-all duration-100 ease-linear shadow-[0_0_8px_#ff0000]"
                style={{ width: `${storyProgress}%` }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pt-3 z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-red-500 p-0.5">
                  <img src={viewingStory.avatar} alt={viewingStory.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{viewingStory.name}</span>
                    <span className="text-[9px] bg-red-600 text-white font-black px-1 rounded">6 7</span>
                  </h3>
                  <p className="text-[10px] text-neutral-400">{viewingStory.time}</p>
                </div>
              </div>

              <button
                onClick={() => setViewingStory(null)}
                className="p-1 rounded-full text-white/80 hover:text-white bg-black/40"
              >
                <X size={20} />
              </button>
            </div>

            {/* Story Content */}
            <div className="my-auto text-center space-y-4 px-6 z-10">
              <div className="inline-flex items-baseline font-black text-8xl tracking-tighter leading-none select-none drop-shadow-[0_0_40px_rgba(255,0,0,0.85)] animate-pulse">
                <span className="text-white">6</span>
                <span className="text-[#ff0000] ml-1">7</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/70 border border-neutral-800 max-w-xs mx-auto text-xs text-neutral-200 leading-relaxed font-semibold">
                {viewingStory.textSnippet}
              </div>
            </div>

            {/* Reply bar */}
            <div className="flex items-center gap-2 pb-4 z-20">
              <input
                type="text"
                placeholder={`Responder a ${viewingStory.name}...`}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={() => {
                  playLikePop();
                  setViewingStory(null);
                }}
                className="p-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-red-500"
              >
                <Heart size={20} className="fill-red-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6 7 Easter Egg Celebration */}
      <SixSevenEasterEgg
        isOpen={easterEggOpen}
        onClose={() => setEasterEggOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
