import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Music, Wand2, Video, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { playSixSevenSound, playSuccessChime, playBassDrop } from '../utils/audio';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  onRequestLogin: () => void;
}

const TEMPLATES: {
  id: Post['canvasAnimationType'];
  title: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: 'spinning_numbers',
    title: 'Spinning 6 7 (6+1=67)',
    emoji: '🌀',
    description: '3D rotating giant white 6 and neon red 7 with laser rays',
  },
  {
    id: 'glitch_matrix',
    title: '6 7 Glitch Brainrot',
    emoji: '👾',
    description: 'Digital cyber matrix rain with RGB split & 67,000% warning',
  },
  {
    id: 'meme_battle',
    title: '6 vs 7 Battle Arena',
    emoji: '🥊',
    description: 'Epic boxing showdown uniting into the ultimate 6 7',
  },
  {
    id: 'six_seven_dance',
    title: '6 7 Dance Rave',
    emoji: '🕺',
    description: 'Animated club dancer with colorful sound equalizer bars',
  },
  {
    id: 'drill_beat',
    title: 'Drill Sub-Bass Drop',
    emoji: '⚡',
    description: 'Dark drill aesthetic with explosive red strobe lighting',
  },
];

const SOUND_TRACKS = [
  '6 7 Phonk Drill Anthem (Speed Up) 🎵',
  '6 7 Beat Drop - Kid Sigma Edition 💥',
  'Sigma 6 7 Remix - TikTok Cut 🔥',
  '6 7 Dance Club Banga - Kid Drill 🎧',
  'Secret 6 7 Bass Boost (Echo) 🔊',
];

const POPULAR_HASHTAGS = ['#67meme', '#sixseven', '#67challenge', '#viral', '#brainrot', '#math67'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  onRequestLogin,
}) => {
  const { user, profile, boostAura67 } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<Post['canvasAnimationType']>('spinning_numbers');
  const [caption, setCaption] = useState('When the whole squad hits the 6 7 combo 🔥 #67meme #sixseven');
  const [soundTitle, setSoundTitle] = useState(SOUND_TRACKS[0]);
  const [selectedSticker, setSelectedSticker] = useState('🔥 6 7 ON TOP');
  const [posting, setPosting] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Live Canvas Preview
  useEffect(() => {
    if (!isOpen) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 - 15;

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);

      if (selectedTemplate === 'spinning_numbers') {
        // Red glowing center
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const bounce = Math.sin(tick * 0.1) * 10;
        ctx.font = '900 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;
        ctx.fillText('6', cx - 25, cy + bounce);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('7', cx + 30, cy + bounce);

        ctx.font = '700 14px Inter, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText('6 + 1 = 6 7', cx, cy + 50);

      } else if (selectedTemplate === 'glitch_matrix') {
        ctx.font = '900 56px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#22c55e';
        ctx.fillText('6 7', cx + (Math.random() - 0.5) * 4, cy);
        ctx.font = '700 12px Inter, sans-serif';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('CYBER BRAINROT', cx, cy + 45);

      } else if (selectedTemplate === 'meme_battle') {
        ctx.font = '900 48px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('6 🥊', cx - 40, cy);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('7 👑', cx + 45, cy);

      } else if (selectedTemplate === 'six_seven_dance') {
        const sway = Math.sin(tick * 0.15) * 15;
        ctx.font = '900 56px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🕺', cx + sway, cy);
        ctx.font = '900 24px Inter, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('6 7', cx + sway, cy + 40);

      } else {
        ctx.font = '900 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 25;
        ctx.fillText('6 7', cx, cy);
      }

      // Sticker overlay
      if (selectedSticker) {
        ctx.font = '800 13px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(selectedSticker, cx, h - 30);
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen, selectedTemplate, selectedSticker]);

  if (!isOpen) return null;

  const handleHashtagClick = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => `${prev.trim()} ${tag}`);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    if (!user) {
      onRequestLogin();
      return;
    }

    setPosting(true);
    playSixSevenSound();

    const newPostId = `post_${Date.now()}`;
    const newPost: Post = {
      id: newPostId,
      authorId: user.uid,
      authorName: profile?.displayName || user.displayName || '6 7 Creator',
      authorHandle: profile?.username || 'sixseven_star',
      authorPhoto: profile?.photoURL || user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=67',
      caption: caption.trim(),
      soundTitle,
      memeTag: '#67meme',
      likesCount: 67,
      commentsCount: 6,
      sharesCount: 7,
      viewsCount: 670,
      createdAt: new Date().toISOString(),
      canvasAnimationType: selectedTemplate,
      userLiked: true,
    };

    // Save to Firestore
    try {
      const postsRef = collection(db, 'posts');
      await addDoc(postsRef, {
        authorId: newPost.authorId,
        authorName: newPost.authorName,
        authorHandle: newPost.authorHandle,
        authorPhoto: newPost.authorPhoto,
        caption: newPost.caption,
        soundTitle: newPost.soundTitle,
        memeTag: newPost.memeTag,
        likesCount: newPost.likesCount,
        commentsCount: newPost.commentsCount,
        sharesCount: newPost.sharesCount,
        viewsCount: newPost.viewsCount,
        canvasAnimationType: newPost.canvasAnimationType,
        createdAt: newPost.createdAt,
      });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    // Reward aura points
    boostAura67(670);
    playBassDrop();
    playSuccessChime();

    // Celebration confetti
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#ffffff', '#fbbf24', '#38bdf8'],
    });

    onPostCreated(newPost);
    setPosting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl max-h-[90vh] overflow-y-auto text-white shadow-[0_0_50px_rgba(239,68,68,0.25)] p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="flex items-baseline font-black text-2xl tracking-tighter leading-none select-none">
              <span className="text-white">6</span>
              <span className="text-red-500 ml-0.5">7</span>
            </div>
            <span className="text-sm font-extrabold text-neutral-100">Create Viral Post</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePublish} className="mt-4 space-y-4">
          {/* Live Preview Canvas & Animation Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Video size={14} className="text-red-400" />
              <span>1. Choose 6 7 Video Animation Style</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(tpl.id);
                    playSixSevenSound();
                  }}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    selectedTemplate === tpl.id
                      ? 'bg-red-950/70 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{tpl.emoji}</span>
                    <span className="text-xs font-bold text-white truncate">{tpl.title}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{tpl.description}</p>
                </button>
              ))}
            </div>

            {/* Canvas Live Preview Box */}
            <div className="mt-2 relative w-full h-36 bg-black rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              <canvas ref={previewCanvasRef} width={340} height={144} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-red-500/40 text-[10px] font-black text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE PREVIEW
              </div>
            </div>
          </div>

          {/* Meme Sticker Badges */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Wand2 size={14} className="text-amber-400" />
              <span>2. Add 6 7 Meme Sticker</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['🔥 6 7 ON TOP', '🗿 SIGMA 67', '🐐 GOAT NUMBER', '💥 6+1=67', '⚡ BRAINROT'].map((stk) => (
                <button
                  key={stk}
                  type="button"
                  onClick={() => setSelectedSticker(stk)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                    selectedSticker === stk
                      ? 'bg-red-600 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Track Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Music size={14} className="text-cyan-400" />
              <span>3. Select Meme Audio Track</span>
            </label>
            <select
              value={soundTitle}
              onChange={(e) => setSoundTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              {SOUND_TRACKS.map((snd, idx) => (
                <option key={idx} value={snd}>
                  {snd}
                </option>
              ))}
            </select>
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-red-400" />
              <span>4. Caption & Viral Hashtags</span>
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={300}
              placeholder="What's your 6 7 moment? #67meme #sixseven"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 resize-none"
            />
            {/* Quick Hashtags */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {POPULAR_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleHashtagClick(tag)}
                  className="text-[10px] font-bold text-neutral-400 hover:text-red-400 bg-neutral-900/60 px-2 py-0.5 rounded border border-neutral-800"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={posting || !caption.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {posting ? (
              <span>Publishing 6 7 Clip...</span>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Post 6 7 Video (+670 Aura Points) 🚀</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
