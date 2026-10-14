import React, { useState } from 'react';
import { Search, Flame, TrendingUp, Trophy, Sparkles, Play } from 'lucide-react';
import { Post } from '../types';
import { playSixSevenSound, playBassDrop } from '../utils/audio';

interface SearchExploreProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

const TRENDING_TAGS = [
  { tag: '#67meme', postsCount: '6.7M', hot: true },
  { tag: '#sixseven', postsCount: '3.67M', hot: true },
  { tag: '#67challenge', postsCount: '674K', hot: false },
  { tag: '#67brainrot', postsCount: '867K', hot: true },
  { tag: '#67dance', postsCount: '467K', hot: false },
  { tag: '#math67', postsCount: '267K', hot: false },
];

const TOP_CREATORS = [
  { rank: 1, name: 'Kai_67', handle: 'kai_sixseven', aura: '670,000', photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80' },
  { rank: 2, name: 'MemeGod_67', handle: 'memegod67', aura: '467,000', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
  { rank: 3, name: 'Skibidi_67', handle: 'skibidi67', aura: '367,000', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80' },
  { rank: 4, name: 'Mia_67', handle: 'mia67dance', aura: '267,000', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
];

export const SearchExplore: React.FC<SearchExploreProps> = ({ posts, onSelectPost }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = posts.filter(
    (p) =>
      p.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authorHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white pt-16 pb-24 px-4 overflow-y-auto">
      {/* Search Input */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search 6 7 memes, creators, sounds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Trending 6 7 Tags */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-red-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300">
            Trending 6 7 Hashtags
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TRENDING_TAGS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchTerm(item.tag);
                playSixSevenSound();
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-900 hover:border-red-500/50 transition-all text-left group"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-extrabold text-white group-hover:text-red-400">
                    {item.tag}
                  </span>
                  {item.hot && <Flame size={12} className="text-red-500 animate-pulse" />}
                </div>
                <span className="text-[10px] text-neutral-500">{item.postsCount} posts</span>
              </div>
              <span className="text-xs font-black text-red-500/80">6 7</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top 6 7 Meme Kings Leaderboard */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300">
              6 7 Aura Leaderboard
            </h3>
          </div>
          <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
            TOP KINGS
          </span>
        </div>

        <div className="space-y-2">
          {TOP_CREATORS.map((c) => (
            <div
              key={c.rank}
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-900"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 text-center font-black text-xs ${
                    c.rank === 1
                      ? 'text-amber-400'
                      : c.rank === 2
                      ? 'text-neutral-300'
                      : c.rank === 3
                      ? 'text-amber-600'
                      : 'text-neutral-500'
                  }`}
                >
                  #{c.rank}
                </span>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-800">
                  <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">@{c.handle}</p>
                  <p className="text-[10px] text-neutral-400">{c.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-black text-red-400">
                <Sparkles size={12} className="text-amber-400" />
                <span>{c.aura} Aura</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viral 6 7 Clips Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Play size={16} className="text-red-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300">
            Viral 6 7 Clips ({filteredPosts.length})
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => {
                playBassDrop();
                onSelectPost(post);
              }}
              className="relative aspect-3/4 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-red-500/50 transition-all group flex flex-col justify-end p-2.5 text-left"
            >
              {/* Animated thumbnail indicator */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-neutral-800 group-hover:text-red-600/60 transition-colors">
                  6 7
                </span>
              </div>

              {/* Bottom Info */}
              <div className="relative z-20 space-y-0.5">
                <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                  {post.caption}
                </p>
                <div className="flex items-center justify-between text-[10px] text-red-400 font-extrabold pt-1">
                  <span>@{post.authorHandle}</span>
                  <span>🔥 {post.likesCount}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
