import React, { useEffect, useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { openChatWith, searchUsers } from '../services/chats';
import { UserProfile } from '../types';
import { WhatsAppChat, chatFromDoc } from './WhatsAppChatList';

interface Props {
  onBack: () => void;
  onOpenChat: (chat: WhatsAppChat) => void;
}

export const NewChatView: React.FC<Props> = ({ onBack, onOpenChat }) => {
  const { profile } = useAuth();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    setBusy(true);
    const handle = setTimeout(async () => {
      try {
        setError(null);
        setResults(await searchUsers(term, profile.uid));
      } catch (e) {
        console.error(e);
        setError('No se pudo buscar. Revisá tu conexión.');
      } finally {
        setBusy(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [term, profile]);

  const start = async (other: UserProfile) => {
    if (!profile) return;
    try {
      const doc = await openChatWith(profile, other);
      onOpenChat(chatFromDoc(doc, profile.uid));
    } catch (e) {
      console.error(e);
      setError('No se pudo abrir el chat.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white max-w-md mx-auto flex flex-col safe-top">
      <header className="flex items-center gap-2 px-2 py-3 border-b border-neutral-900">
        <button onClick={onBack} className="p-1 text-[#ff2a2a] cursor-pointer"><ChevronLeft size={26} /></button>
        <h1 className="text-base font-bold">Nuevo chat</h1>
      </header>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 focus-within:border-red-600">
          <Search size={15} className="text-neutral-500" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Nombre, @usuario o +número de teléfono"
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {error && <p className="text-center text-xs text-red-400 py-3">{error}</p>}
        {busy && <p className="text-center text-xs text-neutral-500 py-3">Buscando...</p>}
        {!busy && term.trim().length >= 2 && results.length === 0 && !error && (
          <p className="text-center text-xs text-neutral-500 px-8 py-6">
            No encontramos a nadie. La persona tiene que haber entrado antes a SixSeven.
          </p>
        )}
        {results.map((u) => (
          <button key={u.uid} onClick={() => start(u)} className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-neutral-900 text-left cursor-pointer active:bg-neutral-950">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
              {u.photoURL && <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{u.displayName}</p>
              <p className="text-xs text-neutral-500 truncate">@{u.username}</p>
            </div>
          </button>
        ))}
        {term.trim().length < 2 && (
          <p className="text-center text-xs text-neutral-500 px-8 py-6">
            Escribí al menos 2 letras, o el número completo con código de país (ej. +54 376 ...).
          </p>
        )}
      </div>
    </div>
  );
};
