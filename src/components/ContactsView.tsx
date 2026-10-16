import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, MessageCircle, Search, UserPlus, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { searchUsers, openChatWith } from '../services/chats';
import {
  acceptFriendRequest, cancelFriendRequest, declineFriendRequest, FriendRequest, sendFriendRequest,
} from '../services/friends';
import { UserProfile } from '../types';
import { WhatsAppChat, chatFromDoc } from './WhatsAppChatList';

interface Props {
  onBack: () => void;
  onOpenChat: (chat: WhatsAppChat) => void;
}

const Pic: React.FC<{ src?: string }> = ({ src }) => (
  <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
    {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <UserRound className="text-neutral-500" size={20} />}
  </div>
);

export const ContactsView: React.FC<Props> = ({ onBack, onOpenChat }) => {
  const { profile } = useAuth();
  const { incoming, outgoing, friends, relation, requestFrom } = useSocial();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!profile || term.trim().length < 2) {
      setResults([]);
      setBusy(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setBusy(true);
      setError('');
      try {
        const found = await searchUsers(term, profile.uid);
        if (!cancelled) setResults(found);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('No se pudo buscar usuarios. Revisá tu conexión.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [term, profile?.uid]);

  const run = async (key: string, fn: () => Promise<void>, fail: string) => {
    setWorking(key);
    setError('');
    setInfo('');
    try { await fn(); } catch (e) { console.error(e); setError(fail); } finally { setWorking(null); }
  };

  const openChat = (uid: string, name: string, photo: string) =>
    run(uid, async () => {
      if (!profile) return;
      const chat = await openChatWith(profile, { uid, displayName: name, photoURL: photo });
      onOpenChat(chatFromDoc(chat, profile.uid));
    }, 'No se pudo abrir el chat.');

  const accept = (r: FriendRequest) =>
    run(r.id, async () => {
      if (!profile) return;
      onOpenChat(chatFromDoc(await acceptFriendRequest(r, profile), profile.uid));
    }, 'No se pudo aceptar. Revisá tu conexión y las reglas de Firestore.');

  const add = (person: UserProfile) =>
    run(person.uid, async () => {
      if (!profile) return;
      await sendFriendRequest(profile, person);
      setInfo(`Solicitud enviada a ${person.displayName}. Cuando la acepte, ya pueden chatear.`);
    }, 'No se pudo enviar la solicitud. Revisá las reglas de Firestore.');

  return (
    <div className="fixed inset-0 z-50 bg-black text-white max-w-md mx-auto flex flex-col safe-top">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-neutral-900">
        <button aria-label="Volver" onClick={onBack} className="text-red-500"><ArrowLeft size={24} /></button>
        <div><h1 className="text-lg font-black">Amigos y solicitudes</h1><p className="text-xs text-neutral-500">Buscá por nombre o @usuario</p></div>
      </header>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 focus-within:border-red-600">
          <Search size={16} className="text-neutral-500" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar por nombre, @usuario o +teléfono" className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none" />
        </div>
      </div>
      {error && <p className="px-4 py-2 text-xs text-red-400">{error}</p>}
      {info && <p className="px-4 py-2 text-xs text-emerald-400">{info}</p>}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {term.trim().length >= 2 && <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Resultados de búsqueda</h2>}
        {busy && <p className="py-3 text-center text-sm text-neutral-500">Buscando usuarios…</p>}
        {!busy && term.trim().length >= 2 && results.length === 0 && !error && (
          <p className="py-4 text-sm text-neutral-500">No encontramos a nadie. La persona tiene que haber entrado antes a SixSeven. Probá con su @usuario exacto (lo ve en Mi perfil).</p>
        )}
        {results.map((person) => {
          const rel = relation(person.uid);
          return (
            <div key={person.uid} className="flex items-center gap-3 py-3 border-b border-neutral-900">
              <Pic src={person.photoURL} />
              <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{person.displayName}</p><p className="text-xs text-neutral-500 truncate">@{person.username}</p></div>
              {rel === 'friend' && <button onClick={() => openChat(person.uid, person.displayName, person.photoURL || '')} className="rounded-full bg-red-600 px-3 py-2 text-xs font-bold">Chatear</button>}
              {rel === 'incoming' && <button disabled={working === person.uid} onClick={() => { const r = requestFrom(person.uid); if (r) accept(r); }} className="rounded-full bg-red-600 px-3 py-2 text-xs font-bold disabled:opacity-50">Aceptar</button>}
              {rel === 'outgoing' && <span className="text-xs text-neutral-500">Solicitud enviada</span>}
              {rel === 'none' && (
                <button onClick={() => add(person)} disabled={working === person.uid} className="rounded-full bg-red-600/15 border border-red-800 px-3 py-2 text-red-300 text-xs font-bold disabled:opacity-50">
                  <span className="flex items-center gap-1"><UserPlus size={14} /> {working === person.uid ? 'Enviando' : 'Agregar'}</span>
                </button>
              )}
            </div>
          );
        })}

        <h2 className="text-xs uppercase tracking-wider text-neutral-500 mt-6 mb-2">Solicitudes recibidas {incoming.length > 0 && `· ${incoming.length}`}</h2>
        {incoming.length === 0 && <p className="py-2 text-sm text-neutral-600">No tenés solicitudes nuevas.</p>}
        {incoming.map((r) => (
          <div key={r.id} className="flex items-center gap-3 py-3 border-b border-neutral-900">
            <Pic src={r.fromPhoto} />
            <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{r.fromName}</p><p className="text-xs text-neutral-500 truncate">@{r.fromUsername} quiere ser tu amigo/a</p></div>
            <button aria-label="Aceptar" disabled={working === r.id} onClick={() => accept(r)} className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center disabled:opacity-50"><Check size={18} /></button>
            <button aria-label="Rechazar" disabled={working === r.id} onClick={() => run(r.id, () => declineFriendRequest(r), 'No se pudo rechazar.')} className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center disabled:opacity-50"><X size={18} /></button>
          </div>
        ))}

        {outgoing.length > 0 && (
          <>
            <h2 className="text-xs uppercase tracking-wider text-neutral-500 mt-6 mb-2">Enviadas</h2>
            {outgoing.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-3 border-b border-neutral-900">
                <Pic src={r.toPhoto} />
                <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{r.toName}</p><p className="text-xs text-neutral-500 truncate">@{r.toUsername} · pendiente</p></div>
                <button disabled={working === r.id} onClick={() => run(r.id, () => cancelFriendRequest(r), 'No se pudo cancelar.')} className="rounded-full bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-xs disabled:opacity-50">Cancelar</button>
              </div>
            ))}
          </>
        )}

        <h2 className="text-xs uppercase tracking-wider text-neutral-500 mt-6 mb-2">Mis amigos · {friends.length}</h2>
        {friends.length === 0 && <p className="py-2 text-sm text-neutral-600">Cuando alguien acepte tu solicitud aparece acá.</p>}
        {friends.map((f) => {
          const otherUid = f.users.find((u) => u !== profile?.uid) || '';
          const m = f.members?.[otherUid];
          return (
            <div key={f.id} className="flex items-center gap-3 py-3 border-b border-neutral-900">
              <Pic src={m?.photo} />
              <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{m?.name || 'Usuario'}</p><p className="text-xs text-neutral-500 truncate">@{m?.username}</p></div>
              <button aria-label={`Chatear con ${m?.name}`} onClick={() => openChat(otherUid, m?.name || 'Usuario', m?.photo || '')} className="p-2 text-red-400"><MessageCircle size={19} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
