import {
  addDoc, collection, doc, getDoc, getDocs, increment, limit, orderBy, query,
  serverTimestamp, setDoc, updateDoc, where, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

export interface ChatMember {
  name: string;
  photo: string;
}

export interface ChatDoc {
  id: string;
  participants: [string, string];
  members: Record<string, ChatMember>;
  lastMessage: string;
  lastSender: string;
  updatedAt?: Timestamp | null;
  unread?: Record<string, number>;
}

export interface MessageDoc {
  id: string;
  senderId: string;
  text: string;
  createdAt?: Timestamp | null;
}

export const chatIdFor = (a: string, b: string) => [a, b].sort().join('_');

const memberOf = (u: Pick<UserProfile, 'displayName' | 'photoURL'>): ChatMember => ({
  name: u.displayName || 'Usuario',
  photo: u.photoURL || '',
});

/** Abre (y crea si hace falta) el chat 1 a 1 entre yo y otra persona. */
export async function openChatWith(me: UserProfile, other: UserProfile): Promise<ChatDoc> {
  const id = chatIdFor(me.uid, other.uid);
  const ref = doc(db, 'chats', id);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id, ...(snap.data() as Omit<ChatDoc, 'id'>) };
  const participants = [me.uid, other.uid].sort() as [string, string];
  const data = {
    participants,
    members: { [me.uid]: memberOf(me), [other.uid]: memberOf(other) },
    lastMessage: '',
    lastSender: '',
    updatedAt: serverTimestamp(),
    unread: { [me.uid]: 0, [other.uid]: 0 },
  };
  await setDoc(ref, data);
  return { id, ...(data as unknown as Omit<ChatDoc, 'id'>) };
}

export async function sendMessage(chatId: string, myUid: string, otherUid: string, text: string) {
  const clean = text.trim().slice(0, 2000);
  if (!clean) return;
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: myUid,
    text: clean,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: clean.slice(0, 200),
    lastSender: myUid,
    updatedAt: serverTimestamp(),
    [`unread.${otherUid}`]: increment(1),
  });
}

export async function markRead(chatId: string, myUid: string) {
  try {
    await updateDoc(doc(db, 'chats', chatId), { [`unread.${myUid}`]: 0 });
  } catch (e) {
    console.warn('No se pudo marcar como leído:', e);
  }
}

export const messagesQuery = (chatId: string) =>
  query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'), limit(300));

export const myChatsQuery = (uid: string) =>
  query(collection(db, 'chats'), where('participants', 'array-contains', uid));

/** Busca personas por nombre, usuario o número de teléfono exacto (+54...). */
export async function searchUsers(term: string, myUid: string): Promise<UserProfile[]> {
  const t = term.trim().toLowerCase();
  if (t.length < 2) return [];
  const users = collection(db, 'users');
  const range = (field: string, value: string) =>
    getDocs(query(users, where(field, '>=', value), where(field, '<=', value + ''), limit(15)));

  const jobs = [range('displayNameLower', t), range('username', t.replace(/^@/, ''))];
  const digits = t.replace(/[^\d+]/g, '');
  if (digits.replace(/\D/g, '').length >= 7) {
    const phone = digits.startsWith('+') ? digits : `+${digits}`;
    jobs.push(getDocs(query(users, where('phoneNumber', '==', phone), limit(5))));
  }
  const results = await Promise.allSettled(jobs);
  const found = new Map<string, UserProfile>();
  results.forEach((r) => {
    if (r.status === 'fulfilled') r.value.forEach((d) => found.set(d.id, d.data() as UserProfile));
    else console.warn('Búsqueda parcial falló:', r.reason);
  });
  found.delete(myUid);
  return [...found.values()];
}
