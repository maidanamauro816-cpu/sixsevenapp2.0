import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowLeft, MessageCircle, Search, UserPlus, UserRound, UserMinus } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { searchUsers, openChatWith } from '../services/chats';
import { UserProfile } from '../types';
import { WhatsAppChat, chatFromDoc } from './WhatsAppChatList';

interface Props {
  onBack: () => void;
  onOpenChat: (chat: WhatsAppChat) => void;
}

export const ContactsView: React.FC<Props> = ({ onBack, onOpenChat }) => {
  const { profile } = useAuth();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    return onSnapshot(collection(db, 'users', profile.uid, 'contacts'), (snapshot) => {
      setContacts(snapshot.docs.map((item) => item.data() as UserProfile));
    }, (e) => {
      console.error('Contacts subscription failed:', e);
      setError('No se pudieron cargar los contactos. Revisá las reglas de Firestore.');
    });
  }, [profile?.uid]);

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

  const addContact = async (person: UserProfile) => {
    if (!profile) return;
    setAdding(person.uid);
    setError('');
    try {
      await setDoc(doc(db, 'users', profile.uid, 'contacts', person.uid), {
        uid: person.uid,
        displayName: person.displayName || 'Usuario SixSeven',
        username: person.username || '',
        photoURL: person.photoURL || '',
        addedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      setError('No se pudo agregar. Revisá las reglas de Firestore.');
    } finally {
      setAdding(null);
    }
  };

  const removeContact = async (person: UserProfile) => {
    if (!profile) return;
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'contacts', person.uid));
    } catch (e) {
      console.error(e);
      setError('No se pudo quitar el contacto.');
    }
  };

  const startChat = async (person: UserProfile) => {
    if (!profile) return;
    try {
      const chat = await openChatWith(profile, person);
      onOpenChat(chatFromDoc(chat, profile.uid));
    } catch (e) {
      console.error(e);
      setError('No se pudo abrir el chat.');
    }
  };

  const contactIds = new Set(contacts.map((person) => person.uid));
  return (
    <div className="fixed inset-0 z-50 bg-black text-white max-w-md mx-auto flex flex-col safe-top">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-neutral-900">
        <button aria-label="Volver" onClick={onBack} className="text-red-500"><ArrowLeft size={24} /></button>
        <div><h1 className="text-lg font-black">Amigos y contactos</h1><p className="text-xs text-neutral-500">Usuarios registrados en SixSeven</p></div>
      </header>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3.5 py-2 focus-within:border-red-600">
          <Search size={16} className="text-neutral-500" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar por nombre o @usuario" className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none" />
        </div>
      </div>
      {error && <p className="px-4 py-2 text-xs text-red-400">{error}</p>}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {term.trim().length >= 2 && <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Resultados de búsqueda</h2>}
        {busy && <p className="py-3 text-center text-sm text-neutral-500">Buscando usuarios…</p>}
        {!busy && term.trim().length >= 2 && results.length === 0 && !error && <p className="py-4 text-sm text-neutral-500">No encontramos usuarios con ese nombre.</p>}
        {results.map((person) => (
          <div key={person.uid} className="flex items-center gap-3 py-3 border-b border-neutral-900">
            <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
              {person.photoURL ? <img src={person.photoURL} alt="" className="w-full h-full object-cover" /> : <UserRound className="m-3 text-neutral-500" size={20} />}
            </div>
            <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{person.displayName}</p><p className="text-xs text-neutral-500 truncate">@{person.username}</p></div>
            {contactIds.has(person.uid) ? <span className="text-xs text-green-500">Agregado</span> : (
              <button onClick={() => addContact(person)} disabled={adding === person.uid} className="rounded-full bg-red-600/15 border border-red-800 px-3 py-2 text-red-300 text-xs font-bold disabled:opacity-50">
                <span className="flex items-center gap-1"><UserPlus size={14} /> {adding === person.uid ? 'Agregando' : 'Agregar'}</span>
              </button>
            )}
          </div>
        ))}
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 mt-6 mb-2">Mis contactos · {contacts.length}</h2>
        {contacts.length === 0 && <p className="py-4 text-sm text-neutral-500">Todavía no agregaste contactos. Buscá arriba personas que ya tengan una cuenta en SixSeven.</p>}
        {contacts.map((person) => (
          <div key={person.uid} className="flex items-center gap-3 py-3 border-b border-neutral-900">
            <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
              {person.photoURL ? <img src={person.photoURL} alt="" className="w-full h-full object-cover" /> : <UserRound className="m-3 text-neutral-500" size={20} />}
            </div>
            <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{person.displayName}</p><p className="text-xs text-neutral-500 truncate">@{person.username}</p></div>
            <button aria-label={`Chatear con ${person.displayName}`} onClick={() => startChat(person)} className="p-2 text-red-400"><MessageCircle size={19} /></button>
            <button aria-label={`Quitar a ${person.displayName}`} onClick={() => removeContact(person)} className="p-2 text-neutral-500"><UserMinus size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
