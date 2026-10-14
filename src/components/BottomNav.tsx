import React from 'react';
import { Home, Search, Plus, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'home' | 'search' | 'post' | 'activity' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  unreadCount = 67,
}) => {
  const { profile } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 border-t border-neutral-800/90 backdrop-blur-md px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Home size={22} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => onChangeTab('search')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'search' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Search size={22} strokeWidth={currentTab === 'search' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Search</span>
        </button>

        {/* Post (+ Button with signature TikTok cyan/red 3D outline) */}
        <button
          onClick={() => onChangeTab('post')}
          className="relative px-2 py-0.5 group focus:outline-none transition-transform active:scale-90"
          title="Post a 6 7 Video"
        >
          <div className="relative w-11 h-7 rounded-lg flex items-center justify-center">
            {/* Cyan background slice */}
            <div className="absolute inset-0 bg-cyan-400 rounded-lg -translate-x-1" />
            {/* Red accent slice */}
            <div className="absolute inset-0 bg-red-500 rounded-lg translate-x-1" />
            {/* White foreground block */}
            <div className="relative w-9 h-7 bg-white rounded-md flex items-center justify-center text-black font-black shadow-md">
              <Plus size={20} strokeWidth={3} className="text-black group-hover:rotate-90 transition-transform duration-300" />
            </div>
          </div>
          <span className="sr-only">Post 6 7</span>
        </button>

        {/* Activity */}
        <button
          onClick={() => onChangeTab('activity')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'activity' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div className="relative">
            <Bell size={22} strokeWidth={currentTab === 'activity' ? 2.5 : 2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-red-600 text-white text-[9px] font-black rounded-full min-w-4 text-center leading-tight shadow-[0_0_6px_#ef4444]">
                67
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Activity</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            currentTab === 'profile' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          {profile?.photoURL ? (
            <div className={`w-5.5 h-5.5 rounded-full overflow-hidden border ${currentTab === 'profile' ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-600'}`}>
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <User size={22} strokeWidth={currentTab === 'profile' ? 2.5 : 2} />
          )}
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
