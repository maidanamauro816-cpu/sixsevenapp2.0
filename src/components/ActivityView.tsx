import React from 'react';
import { Flame, Bell, Heart, MessageCircle, UserPlus, Sparkles, Zap, Award } from 'lucide-react';
import { ActivityNotification } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/initialPosts';
import { useAuth } from '../context/AuthContext';
import { playSixSevenSound, playSuccessChime } from '../utils/audio';

export const ActivityView: React.FC = () => {
  const { profile, boostAura67 } = useAuth();
  const notifications = INITIAL_NOTIFICATIONS;

  const handleClaimDaily = () => {
    playSixSevenSound();
    playSuccessChime();
    boostAura67(67);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white pt-16 pb-24 px-4 overflow-y-auto">
      {/* 6 7 Daily Streak & Aura Banner */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-neutral-900 to-neutral-950 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Flame size={22} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>6 7 Streak: 67 Days!</span>
                <span className="text-amber-400">🔥</span>
              </h2>
              <p className="text-[11px] text-neutral-400">Never miss the daily 6 7 ritual</p>
            </div>
          </div>

          <button
            onClick={handleClaimDaily}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-transform"
          >
            +67 Aura
          </button>
        </div>

        {/* Progress bar to Level 67 */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-bold text-neutral-400 mb-1">
            <span>Aura Rank: Level 67 Sigma</span>
            <span className="text-red-400">{profile?.score67 || 670} / 6767 XP</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full w-[67%]" />
          </div>
        </div>
      </div>

      {/* Notifications Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-red-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300">
            6 7 Notifications
          </h3>
        </div>
        <span className="text-[10px] font-bold text-neutral-400">All Activity</span>
      </div>

      {/* Notification Items */}
      <div className="space-y-2.5">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => playSixSevenSound()}
            className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-900 hover:border-red-500/40 transition-colors cursor-pointer"
          >
            {/* Actor Avatar with Type Icon Badge */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-800">
                <img
                  src={item.actorPhoto || 'https://api.dicebear.com/7.x/bottts/svg?seed=67'}
                  alt={item.actorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                {item.type === 'like' && <Heart size={9} className="text-red-500 fill-red-500" />}
                {item.type === 'comment' && <MessageCircle size={9} className="text-cyan-400" />}
                {item.type === 'follow' && <UserPlus size={9} className="text-emerald-400" />}
                {item.type === 'badge' && <Award size={9} className="text-amber-400" />}
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-200 leading-tight">
                <span className="font-extrabold text-white">@{item.actorName} </span>
                {item.message}
              </p>
              <span className="text-[10px] text-neutral-500 mt-0.5 inline-block">{item.timeAgo}</span>
            </div>

            {/* Aura Points Tag */}
            <div className="flex items-center gap-0.5 text-[11px] font-black text-amber-400 shrink-0">
              <Sparkles size={11} />
              <span>+{item.points67}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
