import {
  collection, deleteDoc, doc, getDoc, query, serverTimestamp, setDoc, updateDoc, where, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { openChatWith } from './chats';

type Basic = Pick<UserProfile, 'uid' | 'displayName' | 'photoURL' | 'username'>;

export interface FriendRequest {
  id: string;
  from: string;
  to: string;
  fromName: string;
  fromPhoto: string;
  fromUsername: string;
  toName: string;
  toPhoto: string;
  toUsername: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: Timestamp | null;
}

export interface Friendship {
  id: string;
  users: [string, string];
  members: Record<string, { name: string; photo: string; username: string }>;
}

export const pairId = (a: string, b: string) => [a, b].sort().join('_');
export const requestId = (from: string, to: string) => `${from}_${to}`;

export const incomingQuery = (uid: string) => query(collection(db, 'friendRequests'), where('to', '==', uid));
export const outgoingQuery = (uid: string) => query(collection(db, 'friendRequests'), where('from', '==', uid));
export const friendsQuery = (uid: string) => query(collection(db, 'friendships'), where('users', 'array-contains', uid));

/** Envía una solicitud de amistad / chat. */
export async function sendFriendRequest(me: Basic, other: Basic) {
  const ref = doc(db, 'friendRequests', requestId(me.uid, other.uid));
  const old = await getDoc(ref);
  if (old.exists()) await deleteDoc(ref); // solicitud vieja (rechazada, etc.)
  await setDoc(ref, {
    from: me.uid,
    to: other.uid,
    fromName: me.displayName || 'Usuario',
    fromPhoto: me.photoURL || '',
    fromUsername: me.username || '',
    toName: other.displayName || 'Usuario',
    toPhoto: other.photoURL || '',
    toUsername: other.username || '',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Acepta: queda la amistad y se abre el chat. Devuelve el id del chat. */
export async function acceptFriendRequest(req: FriendRequest, me: Basic) {
  await updateDoc(doc(db, 'friendRequests', req.id), { status: 'accepted', updatedAt: serverTimestamp() });
  const users = [req.from, req.to].sort();
  await setDoc(doc(db, 'friendships', pairId(req.from, req.to)), {
    users,
    members: {
      [req.from]: { name: req.fromName, photo: req.fromPhoto, username: req.fromUsername },
      [req.to]: { name: req.toName, photo: req.toPhoto, username: req.toUsername },
    },
    createdAt: serverTimestamp(),
  });
  return openChatWith(me, { uid: req.from, displayName: req.fromName, photoURL: req.fromPhoto });
}

export const declineFriendRequest = (req: FriendRequest) =>
  updateDoc(doc(db, 'friendRequests', req.id), { status: 'declined', updatedAt: serverTimestamp() });

export const cancelFriendRequest = (req: FriendRequest) => deleteDoc(doc(db, 'friendRequests', req.id));
