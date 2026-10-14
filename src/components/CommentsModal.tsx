import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Flame } from 'lucide-react';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { playLikePop, playSuccessChime, playSixSevenSound } from '../utils/audio';

interface CommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestLogin: () => void;
}

const DEFAULT_MEME_COMMENTS: Comment[] = [
  {
    id: 'c1',
    postId: '',
    authorId: 'u1',
    authorName: 'Mauro',
    authorPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    text: '¡El 6 7 es eterno! Y la música de Canserbero en la app quedó increíble 🔥',
    createdAt: 'Hace 2m',
    likesCount: 67,
  },
  {
    id: 'c2',
    postId: '',
    authorId: 'u2',
    authorName: 'Sofia_67',
    authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    text: '6 + 1 = 67 sin discusión alguna 😭🗿',
    createdAt: 'Hace 15m',
    likesCount: 674,
  },
  {
    id: 'c3',
    postId: '',
    authorId: 'u3',
    authorName: 'Lucas_Sigma',
    authorPhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    text: 'Es Épico de Canserbero sonando de fondo mientras scrolleo SixSeven 👑',
    createdAt: 'Hace 1h',
    likesCount: 670,
  },
];

const MEME_QUICK_STICKS = [
  '6 7 🗿',
  'SIXSEVEN EN LA CIMA 🔥',
  '6 + 1 = 67 🤯',
  'CANSERBERO 🎙️',
  'W 67 RATIO 🐐',
  '6 7 6 7 6 7 💯',
];

export const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  isOpen,
  onClose,
  onRequestLogin,
}) => {
  const { user, profile, boostAura67 } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(DEFAULT_MEME_COMMENTS);
  const [submitting, setSubmitting] = useState(false);

  // Sync / Listen to Firestore comments if post exists
  useEffect(() => {
    if (!post || !isOpen) return;

    try {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Comment, 'id'>),
            }));
            setComments(fetched);
          } else {
            setComments(DEFAULT_MEME_COMMENTS.map((c) => ({ ...c, postId: post.id })));
          }
        },
        (error) => {
          console.warn('Realtime comments snapshot notice:', error);
        }
      );

      return () => unsubscribe();
    } catch {
      setComments(DEFAULT_MEME_COMMENTS.map((c) => ({ ...c, postId: post.id })));
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (directText || commentText).trim();
    if (!textToSend) return;

    if (!user) {
      onRequestLogin();
      return;
    }

    setSubmitting(true);
    const newComment: Comment = {
      id: `local_${Date.now()}`,
      postId: post.id,
      authorId: user.uid,
      authorName: profile?.displayName || user.displayName || 'Fan del 6 7',
      authorPhoto: profile?.photoURL || user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=67',
      text: textToSend,
      createdAt: 'Justo ahora',
      likesCount: 1,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
    playSuccessChime();
    boostAura67(67);

    try {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      await addDoc(commentsRef, {
        postId: post.id,
        authorId: user.uid,
        authorName: newComment.authorName,
        authorPhoto: newComment.authorPhoto,
        text: textToSend,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore comment fallback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStick = (sticker: string) => {
    playSixSevenSound();
    handleSubmit(undefined, sticker);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="flex-1" onClick={onClose} />

      <div className="relative w-full max-w-md mx-auto bg-neutral-950 border-t border-neutral-800 rounded-t-3xl max-h-[75vh] flex flex-col shadow-2xl pb-safe">
        {/* Handle bar */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-neutral-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">
              Comentarios ({post.commentsCount + comments.length})
            </span>
            <span className="text-[10px] font-black bg-red-600 text-white px-1.5 py-0.2 rounded">
              6 7
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white bg-neutral-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Meme Stickers Bar */}
        <div className="px-3 py-2 border-b border-neutral-900/60 overflow-x-auto flex gap-1.5 no-scrollbar bg-black/40">
          {MEME_QUICK_STICKS.map((sticker, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickStick(sticker)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-neutral-900 hover:bg-red-950/80 border border-neutral-800 hover:border-red-500/50 text-neutral-200 hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              {sticker}
            </button>
          ))}
        </div>

        {/* Comments Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0">
                <img
                  src={comment.authorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.authorId}`}
                  alt={comment.authorName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-neutral-200">
                    @{comment.authorName.toLowerCase().replace(/\s+/g, '_')}
                  </span>
                  <span className="text-[10px] text-neutral-500">{comment.createdAt}</span>
                </div>
                <p className="text-neutral-100 font-medium mt-0.5 break-words">
                  {comment.text}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-400 font-semibold">
                  <button className="hover:text-red-400">Responder</button>
                  <span>•</span>
                  <span className="text-red-400 font-bold flex items-center gap-0.5">
                    <Flame size={11} /> 67 aura
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  playLikePop();
                  boostAura67(6);
                }}
                className="flex flex-col items-center text-neutral-400 hover:text-red-500 pt-1 shrink-0 group active:scale-80 cursor-pointer"
              >
                <Heart size={14} className="group-hover:fill-red-500" />
                <span className="text-[10px] font-bold mt-0.5">
                  {comment.likesCount || 67}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Input Area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-900 bg-neutral-950 flex items-center gap-2">
          {user ? (
            <>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
                <img
                  src={profile?.photoURL || user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=67'}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="text"
                placeholder="Añadir comentario del 6 7... #canserbero"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={300}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="p-2 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold transition-transform active:scale-90 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onRequestLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold text-center"
            >
              Inicia sesión para comentar en SixSeven 🔥
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
