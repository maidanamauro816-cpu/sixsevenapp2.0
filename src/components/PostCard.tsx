import React, { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Music, Check, Plus, Volume2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { playLikePop, playBassDrop, playSixSevenSound } from '../utils/audio';

interface PostCardProps {
  post: Post;
  isActive: boolean;
  onOpenComments: (post: Post) => void;
  onLikeToggle: (postId: string, newLikedState: boolean) => void;
  onShare: (post: Post) => void;
  onRequestLogin: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isActive,
  onOpenComments,
  onLikeToggle,
  onShare,
  onRequestLogin,
}) => {
  const { user, boostAura67 } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(post.userLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [lastTap, setLastTap] = useState(0);

  // Sync state with post prop
  useEffect(() => {
    setIsLiked(post.userLiked || false);
    setLikesCount(post.likesCount);
  }, [post.userLiked, post.likesCount]);

  // High-energy 60fps Canvas Animation Player
  useEffect(() => {
    if (!isActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const type = post.canvasAnimationType || 'spinning_numbers';

    // Set canvas dimensions
    const updateSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = canvas.parentElement?.clientHeight || 640;
    };
    updateSize();

    // Floating particles for scene
    const particles: { x: number; y: number; speed: number; char: string; size: number; color: string }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1.5 + Math.random() * 3,
        char: Math.random() > 0.5 ? '6' : '7',
        size: 14 + Math.random() * 24,
        color: Math.random() > 0.5 ? '#ef4444' : '#ffffff',
      });
    }

    const render = () => {
      if (!isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }
      tick++;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Pure black canvas background with dynamic laser grids
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      if (type === 'spinning_numbers') {
        // Dynamic radial laser grid
        const pulse = Math.sin(tick * 0.1) * 20;
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220 + pulse);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        grad.addColorStop(0.5, 'rgba(185, 28, 28, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Rotating rays
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tick * 0.02);
        for (let i = 0; i < 12; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const angle = (i * Math.PI) / 6;
          ctx.lineTo(Math.cos(angle) * 400, Math.sin(angle) * 400);
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
        ctx.restore();

        // Giant 3D Bouncing "6" and "7"
        const bounceY = Math.sin(tick * 0.12) * 18;
        const scale = 1 + Math.sin(tick * 0.08) * 0.1;

        ctx.save();
        ctx.translate(cx, cy + bounceY);
        ctx.scale(scale, scale);

        // Glow behind
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 35 + Math.sin(tick * 0.2) * 15;

        ctx.font = '900 120px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // "6" in White
        ctx.fillStyle = '#ffffff';
        ctx.fillText('6', -45, 0);

        // "7" in Red
        ctx.fillStyle = '#ef4444';
        ctx.fillText('7', 55, 0);

        ctx.restore();

        // Banner text: "6 + 1 = 6 7!"
        ctx.save();
        ctx.font = '800 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
        ctx.fillText('💥 6 + 1 = 6 7 💥', cx, cy + 95);
        ctx.restore();

      } else if (type === 'glitch_matrix') {
        // Digital cyber 6 7 matrix rain
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, w, h);

        particles.forEach((p) => {
          p.y += p.speed;
          if (p.y > h) p.y = -20;
          ctx.font = `900 ${p.size}px monospace`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fillText(p.char, p.x, p.y);
        });

        // Center Glitch Box
        const jitterX = (Math.random() - 0.5) * 6;
        const jitterY = (Math.random() - 0.5) * 6;

        ctx.save();
        ctx.translate(cx + jitterX, cy + jitterY);
        ctx.font = '900 110px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Red shadow pass
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillText('6 7', -5, 0);

        // Cyan shadow pass
        ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
        ctx.fillText('6 7', 5, 0);

        // White foreground
        ctx.fillStyle = '#ffffff';
        ctx.fillText('6 7', 0, 0);
        ctx.restore();

        // Meme Warning Tag
        ctx.font = '800 16px Inter, sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ BRAINROT OVERLOAD: 67,000% ⚠️', cx, cy + 85);

      } else if (type === 'meme_battle') {
        // 6 VS 7 Epic Boxing Arena
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, w, h);

        // Lightning in background
        if (tick % 25 < 3) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.fillRect(0, 0, w, h);
        }

        // Left Fighter: 6
        const leftBob = Math.sin(tick * 0.15) * 15;
        ctx.save();
        ctx.translate(cx - 75, cy + leftBob);
        ctx.font = '900 95px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.fillText('6', 0, 0);
        ctx.font = '700 24px Inter, sans-serif';
        ctx.fillText('🥊', 25, -20);
        ctx.restore();

        // Center VS
        ctx.font = '900 32px Inter, sans-serif';
        ctx.fillStyle = '#eab308';
        ctx.textAlign = 'center';
        ctx.fillText('VS', cx, cy);

        // Right Fighter: 7
        const rightBob = Math.cos(tick * 0.15) * 15;
        ctx.save();
        ctx.translate(cx + 75, cy + rightBob);
        ctx.font = '900 95px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 25;
        ctx.fillText('7', 0, 0);
        ctx.font = '700 24px Inter, sans-serif';
        ctx.fillText('👑', 0, -55);
        ctx.restore();

        // Synergy Banner
        ctx.font = '800 20px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('THEY UNITE INTO: 6 7 🔥', cx, cy + 90);

      } else if (type === 'six_seven_dance') {
        // Dance Club Beat & Equalizer
        const bars = 16;
        const barWidth = w / bars;
        for (let i = 0; i < bars; i++) {
          const barHeight = Math.abs(Math.sin(tick * 0.15 + i * 0.4)) * 120 + 20;
          ctx.fillStyle = i % 2 === 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(i * barWidth, h - barHeight - 120, barWidth - 3, barHeight);
        }

        // Dancing Character
        const sway = Math.sin(tick * 0.2) * 20;
        ctx.save();
        ctx.translate(cx + sway, cy);
        ctx.font = '900 100px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 30;
        ctx.fillText('🕺', 0, 0);
        ctx.font = '900 48px Inter, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('6 7', 0, 60);
        ctx.restore();

        // Combo Counter
        ctx.font = '900 24px Inter, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('COMBO: 67x STREAK ✨', cx, cy - 80);

      } else {
        // drill_beat: dark sub-bass strobe
        const strobe = tick % 15 < 2 ? 0.4 : 0.05;
        ctx.fillStyle = `rgba(239, 68, 68, ${strobe})`;
        ctx.fillRect(0, 0, w, h);

        ctx.font = '900 115px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 40;
        ctx.fillText('6 7', cx, cy);

        ctx.font = '800 20px Inter, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('⚡ DRILL BASS DROP ⚡', cx, cy + 80);
      }

      // Floating 6 7 numbers in foreground
      particles.slice(0, 15).forEach((p) => {
        p.y -= p.speed * 0.8;
        if (p.y < -20) p.y = h + 20;
        ctx.font = `900 ${p.size * 0.7}px Inter, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText(p.char, p.x, p.y);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, isPlaying, post.canvasAnimationType]);

  // Double-tap to heart
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (now - lastTap < 350) {
      // Double Tap!
      if (!isLiked) {
        handleLikeClick();
      } else {
        playLikePop();
        boostAura67(67);
      }
      // Trigger heart animation
      const heartId = Date.now();
      setFloatingHearts((prev) => [...prev, { id: heartId, x: clickX, y: clickY }]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 1000);

      // Mini confetti
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#ef4444', '#ffffff', '#fbbf24'],
      });
    } else {
      // Single Tap toggles play/pause
      setIsPlaying((prev) => !prev);
    }
    setLastTap(now);
  };

  const handleLikeClick = () => {
    if (!user) {
      onRequestLogin();
      return;
    }
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    if (newLiked) {
      playLikePop();
      playBassDrop();
      boostAura67(67);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#ef4444', '#ffffff'],
      });
    }
    onLikeToggle(post.id, newLiked);
  };

  const handleFollowClick = () => {
    if (!user) {
      onRequestLogin();
      return;
    }
    setIsFollowing((prev) => !prev);
    playSixSevenSound();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="relative w-full h-[calc(100vh-56px)] max-w-md mx-auto bg-black flex flex-col justify-end overflow-hidden select-none snap-start">
      {/* Dynamic Video Simulation Canvas */}
      <div
        onClick={handleScreenClick}
        className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center"
      >
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* Play/Pause indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-white ml-1" />
            </div>
          </div>
        )}

        {/* Floating Hearts from double taps */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            style={{ left: heart.x, top: heart.y }}
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
          >
            <div className="flex flex-col items-center">
              <Heart size={70} className="text-red-500 fill-red-500 drop-shadow-[0_0_20px_#ef4444]" />
              <span className="text-xs font-black text-amber-300 drop-shadow-md bg-black/80 px-2 py-0.5 rounded-full mt-1">
                +67 AURA! 🔥
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top 6 7 Watermark */}
      <div className="absolute top-14 left-4 z-20 pointer-events-none flex items-center gap-1.5 opacity-80">
        <span className="text-xs font-black tracking-widest text-neutral-400 bg-black/60 px-2 py-0.5 rounded border border-neutral-800">
          #67VIRAL
        </span>
      </div>

      {/* Right Side Action Rail (TikTok Style) */}
      <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-4 text-white">
        {/* Creator Avatar with Follow Button */}
        <div className="relative mb-2">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg bg-neutral-900">
            <img
              src={post.authorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorId}`}
              alt={post.authorName}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleFollowClick}
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
              isFollowing ? 'bg-neutral-800 border border-neutral-600' : 'bg-red-600 border border-white hover:scale-110'
            }`}
          >
            {isFollowing ? <Check size={12} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
          </button>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="flex flex-col items-center group active:scale-80 transition-transform focus:outline-none"
        >
          <div
            className={`p-2.5 rounded-full transition-colors ${
              isLiked
                ? 'bg-red-600/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
          >
            <Heart
              size={28}
              className={`transition-all ${
                isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'
              }`}
            />
          </div>
          <span className="text-xs font-extrabold mt-1 text-white drop-shadow">
            {formatNumber(likesCount)}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => onOpenComments(post)}
          className="flex flex-col items-center group active:scale-80 transition-transform focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
            <MessageCircle size={28} className="text-white" />
          </div>
          <span className="text-xs font-extrabold mt-1 text-white drop-shadow">
            {formatNumber(post.commentsCount)}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onShare(post)}
          className="flex flex-col items-center group active:scale-80 transition-transform focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
            <Share2 size={26} className="text-white" />
          </div>
          <span className="text-xs font-extrabold mt-1 text-white drop-shadow">
            {formatNumber(post.sharesCount)}
          </span>
        </button>

        {/* Spinning Vinyl Sound Disc */}
        <button
          onClick={playSixSevenSound}
          className="mt-2 group active:scale-90 transition-transform focus:outline-none"
          title="6 7 Sound Disc"
        >
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-neutral-900 to-neutral-700 border-2 border-neutral-800 flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-lg">
            <div className="w-4 h-4 rounded-full bg-red-600 border border-white flex items-center justify-center">
              <span className="text-[7px] font-black text-white">67</span>
            </div>
            {/* Grooves */}
            <div className="absolute inset-1 rounded-full border border-neutral-600/30 pointer-events-none" />
          </div>
        </button>
      </div>

      {/* Bottom Content Info Overlay */}
      <div className="relative z-30 px-4 pb-20 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
        <div className="max-w-[80%] space-y-1.5">
          {/* Creator Tag & Verified 6 7 Badge */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white tracking-tight hover:underline cursor-pointer">
              @{post.authorHandle}
            </span>
            <span className="text-[10px] font-black bg-red-600 text-white px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-[0_0_6px_#ef4444]">
              <Sparkles size={9} />
              <span>6 7 PRO</span>
            </span>
          </div>

          {/* Caption */}
          <p className="text-xs text-neutral-100 font-medium leading-relaxed drop-shadow line-clamp-3">
            {post.caption}
          </p>

          {/* Sound / Music marquee */}
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 pt-1">
            <Music size={13} className="text-red-400 shrink-0" />
            <div className="overflow-hidden whitespace-nowrap w-52">
              <p className="inline-block animate-[marquee_12s_linear_infinite]">
                {post.soundTitle} • SixSeven Original Viral Beat • 6 7 ON REPEAT 🔥
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Video Progress Line */}
      <div className="absolute bottom-14 left-0 right-0 h-0.5 bg-neutral-800 z-30">
        <div className="h-full bg-red-500 w-full animate-pulse shadow-[0_0_6px_#ef4444]" />
      </div>
    </div>
  );
};
