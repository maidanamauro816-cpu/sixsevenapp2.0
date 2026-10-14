import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Sparkles, Volume2, VolumeX, Flame } from 'lucide-react';
import { StoriesBar } from './StoriesBar';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { playLikePop, playBassDrop, playSixSevenSound, memeBeat } from '../utils/audio';
import confetti from 'canvas-confetti';

interface InstagramFeedProps {
  posts: Post[];
  onOpenComments: (post: Post) => void;
  onLikeToggle: (postId: string, liked: boolean) => void;
  onShare: (post: Post) => void;
  onAddStory: () => void;
  onTriggerEasterEgg: () => void;
}

export const InstagramFeed: React.FC<InstagramFeedProps> = ({
  posts,
  onOpenComments,
  onLikeToggle,
  onShare,
  onAddStory,
  onTriggerEasterEgg,
}) => {
  const { user, boostAura67 } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [soundActive, setSoundActive] = useState(memeBeat.getPlaying());

  const toggleSound = () => {
    const isPlaying = memeBeat.toggle();
    setSoundActive(isPlaying);
  };

  const handleDoubleTap = (postId: string, e: React.MouseEvent) => {
    playLikePop();
    playBassDrop();
    boostAura67(67);
    onLikeToggle(postId, true);

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: ['#ff0000', '#ffffff', '#fbbf24'],
    });
  };

  const toggleBookmark = (postId: string) => {
    playSixSevenSound();
    setSavedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#000000] text-white pt-2 pb-24 overflow-x-hidden">
      {/* 1. TOP HEADER: Big logo "6 7" glowing red, centered at the top */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-neutral-900/80 px-4 pt-3 pb-2.5 flex flex-col items-center">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-full border transition-all ${
              soundActive
                ? 'bg-red-600 border-red-500 text-white animate-pulse'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Música 6 7"
          >
            {soundActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Centered Big Logo "6 7" with glowing red effect */}
          <button
            onClick={() => {
              playSixSevenSound();
              onTriggerEasterEgg();
            }}
            className="flex flex-col items-center group focus:outline-none cursor-pointer"
          >
            <div className="inline-flex items-baseline font-black tracking-tighter leading-none select-none text-4xl drop-shadow-[0_0_20px_rgba(255,0,0,0.85)] group-hover:scale-105 transition-transform">
              <span className="text-white">6</span>
              <span className="text-[#ff0000] ml-1 drop-shadow-[0_0_15px_#ff0000]">7</span>
            </div>
            {/* 2. Text "SixSeven" bold white, and small subtitle "La casa del 6 7 🔥" in gray */}
            <span className="text-sm font-extrabold text-white tracking-tight -mt-0.5">
              SixSeven
            </span>
            <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
              <span>La casa del 6 7</span>
              <span className="text-red-500">🔥</span>
            </span>
          </button>

          <button
            onClick={onTriggerEasterEgg}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[11px] font-black text-red-400 hover:bg-red-900/60 cursor-pointer"
            title="Activar 6 7 Hyperblast"
          >
            <Flame size={13} className="text-red-500 animate-spin" />
            <span>6 7!</span>
          </button>
        </div>
      </header>

      {/* TOP BAR: Horizontal stories bar like Instagram */}
      <StoriesBar onAddStory={onAddStory} />

      {/* MIDDLE: Feed of posts/reels vertical like TikTok/Instagram */}
      <div className="divide-y divide-neutral-900/90">
        {posts.map((post) => {
          const isLiked = post.userLiked || false;
          const isSaved = !!savedPosts[post.id];

          return (
            <article key={post.id} className="py-3 bg-black">
              {/* Post Header: Avatar, Username, Badge, More */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#ff0000] to-neutral-700">
                    <img
                      src={post.authorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorId}`}
                      alt={post.authorName}
                      className="w-full h-full object-cover rounded-full bg-neutral-900"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                        {post.authorHandle || post.authorName.toLowerCase()}
                      </span>
                      <span className="text-[9px] font-black bg-red-600 text-white px-1 py-0.2 rounded">
                        6 7
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      {post.soundTitle || 'Audio original • 6 7'}
                    </p>
                  </div>
                </div>

                <button className="text-neutral-400 hover:text-white p-1">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Post Media: Visual 6 7 dynamic canvas / meme box with double-tap */}
              <div
                onDoubleClick={(e) => handleDoubleTap(post.id, e)}
                className="relative w-full aspect-square bg-gradient-to-b from-neutral-950 via-neutral-900 to-black overflow-hidden flex items-center justify-center cursor-pointer select-none border-y border-neutral-900"
              >
                {/* Visual Graphic Representation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative inline-flex items-baseline font-black text-8xl tracking-tighter leading-none select-none drop-shadow-[0_0_40px_rgba(255,0,0,0.8)] animate-pulse">
                    <span className="text-white">6</span>
                    <span className="text-[#ff0000] ml-2">7</span>
                  </div>

                  <div className="mt-4 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 font-extrabold text-xs shadow-lg">
                    {post.memeTag || '#67meme'}
                  </div>

                  <p className="mt-3 text-sm font-bold text-neutral-100 max-w-xs leading-snug drop-shadow">
                    {post.caption}
                  </p>
                </div>

                {/* Double Tap Hint */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 border border-neutral-800 text-[10px] text-neutral-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>Doble toque para dar like</span>
                </div>
              </div>

              {/* Actions Bar: Heart, Comment, Send, Bookmark */}
              <div className="px-3 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        playLikePop();
                        onLikeToggle(post.id, !isLiked);
                      }}
                      className="transition-transform active:scale-75 cursor-pointer"
                    >
                      <Heart
                        size={24}
                        className={isLiked ? 'text-[#ff0000] fill-[#ff0000] drop-shadow-[0_0_10px_#ff0000]' : 'text-white hover:text-red-500'}
                      />
                    </button>

                    <button
                      onClick={() => onOpenComments(post)}
                      className="text-white hover:text-neutral-300 transition-transform active:scale-75 cursor-pointer"
                    >
                      <MessageCircle size={24} />
                    </button>

                    <button
                      onClick={() => onShare(post)}
                      className="text-white hover:text-neutral-300 transition-transform active:scale-75 cursor-pointer"
                    >
                      <Send size={22} className="-rotate-12" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className="text-white hover:text-neutral-300 transition-transform active:scale-75 cursor-pointer"
                  >
                    <Bookmark size={24} className={isSaved ? 'text-[#ff0000] fill-[#ff0000]' : ''} />
                  </button>
                </div>

                {/* Likes count: "Les gusta a mauro_67 y 6,767 personas más" */}
                <div className="mt-2 text-xs font-bold text-white">
                  Les gusta a <span className="hover:underline cursor-pointer">mauro_67</span> y{' '}
                  <span className="text-red-400">
                    {post.likesCount ? post.likesCount.toLocaleString() : '6,767'} personas más
                  </span>
                </div>

                {/* Caption in Spanish */}
                <div className="mt-1 text-xs text-neutral-200 leading-snug">
                  <span className="font-extrabold text-white mr-1.5">
                    {post.authorHandle || post.authorName.toLowerCase()}
                  </span>
                  <span>{post.caption}</span>
                </div>

                {/* Comments Link */}
                <button
                  onClick={() => onOpenComments(post)}
                  className="mt-1 text-xs text-neutral-500 hover:text-neutral-400 font-medium block"
                >
                  Ver los {post.commentsCount || 67} comentarios
                </button>

                {/* Time Ago in Spanish */}
                <p className="mt-1 text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                  HACE 6 MINUTOS • SIXSEVEN ORIGINAL
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
