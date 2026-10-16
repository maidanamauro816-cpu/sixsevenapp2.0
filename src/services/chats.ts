import {
  addDoc, collection, doc, getDoc, getDocs, increment, limit, orderBy, query,
  serverTimestamp, setDoc, updateDoc, where, Timestamp,
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { uploadFileWithTimeout } from './mediaUpload';
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

export type ChatMediaType = 'image' | 'video' | 'audio' | 'gif';

export interface MessageDoc {
  id: string;
  senderId: string;
  text: string;
  createdAt?: Timestamp | null;
  mediaUrl?: string;
  mediaType?: ChatMediaType;
  mediaName?: string;
  mimeType?: string;
}

export const chatIdFor = (a: string, b: string) => [a, b].sort().join('_');

const memberOf = (u: Pick<UserProfile, 'displayName' | 'photoURL'>): ChatMember => ({
  name: u.displayName || 'Usuario',
  photo: u.photoURL || '',
});

/** Abre (y crea si hace falta) el chat 1 a 1 entre yo y otra persona. */
export async function openChatWith(me: Pick<UserProfile, 'uid' | 'displayName' | 'photoURL'>, other: Pick<UserProfile, 'uid' | 'displayName' | 'photoURL'>): Promise<ChatDoc> {
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


/** Sube un archivo a Firebase Storage y guarda un mensaje multimedia en Firestore. */
export async function sendMediaMessage(
  chatId: string, myUid: string, otherUid: string, file: File, mediaType: ChatMediaType
) {
  if (file.size > 50 * 1024 * 1024) throw new Error('El archivo supera los 50 MB.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) || `media-${Date.now()}`;
  const objectPath = `users/${myUid}/chat-media/${chatId}/${Date.now()}_${safeName}`;
  const objectRef = ref(storage, objectPath);
  await uploadFileWithTimeout(objectRef, file, {
    contentType: file.type || 'application/octet-stream',
    customMetadata: { ownerUid: myUid, chatId },
  });
  const mediaUrl = await getDownloadURL(objectRef);
  const preview = mediaType === 'image' ? '📷 Foto' : mediaType === 'video' ? '🎬 Video' : mediaType === 'audio' ? '🎤 Nota de voz' : 'GIF';
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: myUid, text: '', mediaUrl, mediaType, mediaName: safeName,
    mimeType: file.type || '', createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: preview, lastSender: myUid, updatedAt: serverTimestamp(),
    [`unread.${otherUid}`]: increment(1),
  });
}

/** Envía un GIF mediante su URL directa (por ejemplo, un enlace .gif/.webp de Tenor). */
export async function sendRemoteGifMessage(chatId: string, myUid: string, otherUid: string, mediaUrl: string) {
  const url = new URL(mediaUrl);
  if (!['http:', 'https:'].includes(url.protocol) || !/\.(gif|webp)$/i.test(url.pathname)) {
    throw new Error('El enlace debe ser una URL directa de GIF.');
  }
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: myUid, text: '', mediaUrl: url.toString(), mediaType: 'gif',
    mediaName: 'GIF', mimeType: 'image/gif', createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: 'GIF', lastSender: myUid, updatedAt: serverTimestamp(),
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
  const raw = term.trim().toLowerCase();
  if (raw.length < 2) return [];
  const nameTerm = raw.replace(/^@+/, '').trim();
  const usernameTerm = nameTerm.replace(/\s+/g, '');
  const users = collection(db, 'users');
  const range = (field: string, value: string) =>
    getDocs(query(users, where(field, '>=', value), where(field, '<=', value + '\uf8ff'), limit(20)));

  // Buscar por nombre normalizado y por @usuario; también contemplar perfiles antiguos
  // que todavía no tengan displayNameLower sincronizado.
  const jobs: Promise<import('firebase/firestore').QuerySnapshot>[] = [
    range('username', usernameTerm),
  ];
  if (nameTerm) {
    jobs.push(range('displayNameLower', nameTerm));
    const originalCase = nameTerm.charAt(0).toUpperCase() + nameTerm.slice(1);
    jobs.push(range('displayName', originalCase));
  }

  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.replace(/\D/g, '').length >= 7) {
    const phone = digits.startsWith('+') ? digits : `+${digits}`;
    jobs.push(getDocs(query(users, where('phoneNumber', '==', phone), limit(10))));
  }

  const results = await Promise.allSettled(jobs);
  const rejected = results.filter((result) => result.status === 'rejected');
  if (rejected.length === results.length) {
    console.error('Todas las búsquedas de usuarios fallaron:', rejected);
    throw new Error('No se pudo consultar la lista de usuarios. Revisá la conexión y las reglas de Firestore.');
  }

  const found = new Map<string, UserProfile>();
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      result.value.forEach((item) => {
        const user = item.data() as UserProfile;
        if (user.uid && user.uid !== myUid) found.set(user.uid, user);
      });
    } else {
      console.warn('Una variante de búsqueda de usuarios falló:', result.reason);
    }
  });

  return [...found.values()].sort((a, b) => {
    const aUser = (a.username || '').toLowerCase();
    const bUser = (b.username || '').toLowerCase();
    const aExact = aUser === usernameTerm ? 0 : 1;
    const bExact = bUser === usernameTerm ? 0 : 1;
    return aExact - bExact || aUser.localeCompare(bUser);
  }).slice(0, 25);
}
