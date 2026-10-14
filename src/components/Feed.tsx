import React, { useRef, useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { Radio, Users, Sparkles, MessageCircle, Heart, Flame } from 'lucide-react';
import { playSixSevenSound } from '../utils/audio';

interface FeedProps {
  posts: Post[];
  activeTab: 'following' | 'foryou' | 'live';
  onOpenComments: (post: Post) => void;
  onLikeToggle: (postId: string, newLikedState: boolean) => void;
  onShare: (post: Post) => void;
  onRequestLogin: () => void;
}

export const Feed: React.FC<FeedProps> = ({
  posts,
  activeTab,
  onOpenComments,
  onLikeToggle,
  onShare,
  onRequestLogin,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Live Stream Simulation State
  const [liveChat, setLiveChat] = useState<string[]>([
    '🔥 6 7 ON TOP OF THE WORLD',
    'YOOOO WHO ELSE IS IN 6 7 HYPE MODE?!',
    '6 + 1 = 67 NEVER FORGET',
    'W STREAM BRO 🐐',
    'DROP A 6 IN THE CHAT',
    '7 7 7 7 7 7 7 7 7',
    '6 7 RATIO GOATED',
  ]);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [liveLikes, setLiveLikes] = useState(67400);

  // Filter posts based on activeTab
  const displayPosts = activeTab === 'following'
    ? posts.slice(0, 3)
    : posts;

  // Handle scroll detection for snap
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const index = Math.round(scrollTop / itemHeight);
    if (index !== activeIndex && index >= 0 && index < displayPosts.length) {
      setActiveIndex(index);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(displayPosts.length - 1, activeIndex + 1);
        containerRef.current.scrollTo({ top: next * containerRef.current.clientHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(0, activeIndex - 1);
        containerRef.current.scrollTo({ top: prev * containerRef.current.clientHeight, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, displayPosts.length]);

  // Live Stream chat random generation
  useEffect(() => {
    if (activeTab !== 'live') return;
    const liveInterval = setInterval(() => {
      const memeTexts = [
        '6 7 6 7 6 7 🔥',
        'SIGMA 67 SPOTTED 🗿',
        'BRO SAID 6 7 IN REAL LIFE 😭',
        '6 7 6 7 6 7 6 7 6 7',
        'W 6 7',
        'LEVEL 67 REACHED ✨',
        '🐐 GOAT MOMENT',
      ];
      const randomText = memeTexts[Math.floor(Math.random() * memeTexts.length)];
      setLiveChat((prev) => [...prev.slice(-12), randomText]);
      setLiveLikes((prev) => prev + 67);
    }, 2000);

    return () => clearInterval(liveInterval);
  }, [activeTab]);

  const handleSendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveChatInput.trim()) return;
    setLiveChat((prev) => [...prev, liveChatInput.trim()]);
    setLiveChatInput('');
    playSixSevenSound();
  };

  if (activeTab === 'live') {
    return (
      <div className="relative w-full h-screen max-w-md mx-auto bg-black flex flex-col justify-between pt-16 pb-20 px-3 overflow-hidden select-none">
        {/* Live Broadcast Header */}
        <div className="flex items-center justify-between z-20">
          <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 rounded-full px-3 py-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black text-white">LIVE: 6 7 ARENA</span>
            <span className="text-[10px] text-red-400 font-bold bg-red-950 px-1.5 py-0.2 rounded border border-red-500/30">
              67,420 viewers
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-black/60 px-2.5 py-1 rounded-full border border-neutral-800">
            <Flame size={14} className="text-red-500" />
            <span>{liveLikes.toLocaleString()} Likes</span>
          </div>
        </div>

        {/* Live Visual Stage */}
        <div className="my-auto text-center space-y-3 z-10">
          <div className="relative inline-flex items-baseline font-black text-8xl tracking-tighter leading-none select-none drop-shadow-[0_0_40px_rgba(239,68,68,0.9)] animate-pulse">
            <span className="text-white">6</span>
            <span className="text-red-500 ml-1">7</span>
          </div>
          <p className="text-xs font-extrabold text-neutral-300 uppercase tracking-widest">
            Viral 6 7 Non-Stop Meme Stream 🔥
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold">
            <Radio size={14} className="animate-pulse text-red-400" />
            <span>Broadcasting 6 7 Beats 24/7</span>
          </div>
        </div>

        {/* Live Chat Overlay */}
        <div className="z-20 space-y-2">
          {/* Chat message stream */}
          <div className="max-h-40 overflow-y-auto space-y-1.5 mask-gradient text-xs">
            {liveChat.slice(-5).map((msg, idx) => (
              <div key={idx} className="bg-black/70 backdrop-blur-xs px-3 py-1 rounded-xl border border-neutral-900 inline-block text-neutral-200 max-w-[90%]">
                <span className="font-extrabold text-red-400">@fan67: </span>
                <span className="font-semibold">{msg}</span>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendLiveMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Send 6 7 chant to stream..."
              value={liveChatInput}
              onChange={(e) => setLiveChatInput(e.target.value)}
              className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)] active:scale-95"
            >
              6 7!
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative w-full h-screen max-w-md mx-auto bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
    >
      {displayPosts.map((post, idx) => (
        <PostCard
          key={post.id}
          post={post}
          isActive={idx === activeIndex}
          onOpenComments={onOpenComments}
          onLikeToggle={onLikeToggle}
          onShare={onShare}
          onRequestLogin={onRequestLogin}
        />
      ))}
    </div>
  );
};
