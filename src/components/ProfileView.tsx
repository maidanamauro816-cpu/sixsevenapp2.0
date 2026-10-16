import React, { useState } from 'react';
import { LogOut, Sparkles, Heart, Grid, Share2, Edit3, Flame, Shield, User, Download, Smartphone, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { playSixSevenSound, playSuccessChime } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ProfileViewProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onRequestLogin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  posts,
  onSelectPost,
  onRequestLogin,
}) => {
  const { user, profile, signOut, boostAura67, updateProfilePhoto } = useAuth();
  const [tab, setTab] = useState<'posts' | 'liked'>('posts');
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || 'Certified 6 7 Meme Master 🔥 6 7 on top!');
  const [copiedShare, setCopiedShare] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!user || !profile) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white pt-24 pb-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-900 border-2 border-red-500/50 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          6 7
        </div>
        <h2 className="text-xl font-black text-white">Join the 6 7 Community!</h2>
        <p className="text-xs text-neutral-400 mt-2 max-w-xs">
          Sign in to post your own 6 7 viral clips, earn aura points, like, comment, and flex your meme status.
        </p>
        <button
          onClick={onRequestLogin}
          className="mt-6 w-full max-w-xs py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all active:scale-95"
        >
          Sign In with Google or Phone 🔥
        </button>
      </div>
    );
  }

  const userPosts = posts.filter((p) => p.authorId === user.uid);
  const likedPosts = posts.filter((p) => p.userLiked);

  const handleProfilePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]; event.currentTarget.value = '';
    if (!file) return;
    setPhotoBusy(true); setPhotoError('');
    try { await updateProfilePhoto(file); playSuccessChime(); }
    catch (error) { setPhotoError(error instanceof Error ? error.message : 'No se pudo guardar la foto.'); }
    finally { setPhotoBusy(false); }
  };

  const handleShareProfile = () => {
    playSixSevenSound();
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSaveBio = () => {
    setEditingBio(false);
    playSuccessChime();
    boostAura67(67);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white pt-16 pb-24 px-4 overflow-y-auto">
      {/* Top Profile Header */}
      <div className="flex flex-col items-center text-center">
        {/* Avatar with Glowing 6 7 Ring */}
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleProfilePhoto(event)} />
        <div className="relative mb-3">
          <div className="w-22 h-22 rounded-full border-2 border-red-500 p-0.5 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <img
              src={profile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
              alt={profile.displayName}
              className="w-full h-full object-cover rounded-full bg-neutral-900"
            />
          </div>
          <button type="button" onClick={() => photoInputRef.current?.click()} disabled={photoBusy} aria-label="Cambiar foto de perfil" className="absolute -bottom-1 -right-2 bg-red-600 text-white p-2 rounded-full border-2 border-black shadow-md disabled:opacity-60"><Camera size={14}/></button>
          <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-black shadow-md">6 7</span>
        </div>

        {photoError && <p role="alert" className="mb-2 text-[11px] text-red-300">{photoError}</p>}
        {photoBusy && <p className="mb-2 text-[11px] text-neutral-300">Subiendo foto…</p>}

        {/* Name & Handle */}
        <h2 className="text-base font-black text-white flex items-center gap-1.5">
          <span>{profile.displayName}</span>
          <span className="text-xs bg-red-600/80 px-1 py-0.2 rounded text-white font-bold">PRO</span>
        </h2>
        <p className="text-xs font-semibold text-neutral-400">@{profile.username}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4 py-2 border-y border-neutral-900 w-full justify-center text-center">
          <div>
            <p className="text-sm font-black text-white">{profile.followingCount || 6}</p>
            <p className="text-[10px] font-semibold text-neutral-500">Following</p>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div>
            <p className="text-sm font-black text-white">{profile.followersCount || 67}K</p>
            <p className="text-[10px] font-semibold text-neutral-500">Followers</p>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div>
            <p className="text-sm font-black text-red-500 flex items-center justify-center gap-0.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>{profile.score67 || 6767}</span>
            </p>
            <p className="text-[10px] font-semibold text-neutral-500">6 7 Aura</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-3 w-full">
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                maxLength={200}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
              />
              <button
                onClick={handleSaveBio}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
              >
                Save Bio
              </button>
            </div>
          ) : (
            <p className="text-xs text-neutral-300 max-w-xs mx-auto leading-relaxed">
              {bioText}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 w-full justify-center">
          <button
            onClick={() => setEditingBio(!editingBio)}
            className="flex-1 max-w-[130px] py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit3 size={13} />
            <span>Edit Bio</span>
          </button>

          <button
            onClick={handleShareProfile}
            className="flex-1 max-w-[130px] py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 size={13} />
            <span>{copiedShare ? 'Copied! 🔥' : 'Share 6 7'}</span>
          </button>

          <button
            onClick={signOut}
            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Install PWA Button if available */}
        {!isInstalled && isInstallable && (
          <button
            onClick={install}
            className="mt-3 w-full max-w-[270px] py-2 px-3 rounded-xl bg-red-600/90 hover:bg-red-600 border border-red-500/60 text-white text-xs font-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
          >
            <Download size={14} />
            <span>Install SixSeven App 📲</span>
          </button>
        )}
      </div>

      {/* Tabs: My Clips vs Liked Clips */}
      <div className="flex border-b border-neutral-800 mt-6 mb-3">
        <button
          onClick={() => setTab('posts')}
          className={`flex-1 py-2 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            tab === 'posts' ? 'border-red-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Grid size={15} />
          <span>My 6 7 Posts ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setTab('liked')}
          className={`flex-1 py-2 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            tab === 'liked' ? 'border-red-500 text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Heart size={15} />
          <span>Liked Clips ({likedPosts.length})</span>
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {(tab === 'posts' ? userPosts : likedPosts).map((post) => (
          <button
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="relative aspect-3/4 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-900 hover:border-red-500/50 transition-all flex flex-col justify-end p-1.5 text-left group"
          >
            <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
              <span className="text-2xl font-black text-neutral-700 group-hover:text-red-500 transition-colors">
                6 7
              </span>
            </div>
            <div className="relative z-10 text-[9px] font-black text-white flex items-center gap-0.5 bg-black/70 px-1 py-0.5 rounded">
              <Flame size={9} className="text-red-500" />
              <span>{post.likesCount}</span>
            </div>
          </button>
        ))}

        {(tab === 'posts' ? userPosts : likedPosts).length === 0 && (
          <div className="col-span-3 py-10 text-center text-neutral-500 text-xs">
            {tab === 'posts'
              ? 'No 6 7 posts yet! Tap the + button below to create your first clip! 🚀'
              : 'No liked clips yet! Double tap any video in the feed to like it ❤️'}
          </div>
        )}
      </div>
    </div>
  );
};
