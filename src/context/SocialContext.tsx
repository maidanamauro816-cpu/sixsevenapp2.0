import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import {
  FriendRequest, Friendship, friendsQuery, incomingQuery, outgoingQuery,
} from '../services/friends';

export type RelationState = 'friend' | 'incoming' | 'outgoing' | 'none';

interface SocialState {
  incoming: FriendRequest[]; // pendientes que me enviaron
  outgoing: FriendRequest[]; // pendientes que yo envié
  friends: Friendship[];
  relation: (uid: string) => RelationState;
  requestFrom: (uid: string) => FriendRequest | undefined;
  requestTo: (uid: string) => FriendRequest | undefined;
}

const SocialContext = createContext<SocialState | null>(null);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const uid = profile?.uid;
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);

  useEffect(() => {
    if (!uid) {
      setIncoming([]); setOutgoing([]); setFriends([]);
      return;
    }
    const onErr = (name: string) => (e: unknown) => console.warn(`No se pudo leer ${name}:`, e);
    const mapReq = (snap: any) => snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as FriendRequest);
    const u1 = onSnapshot(incomingQuery(uid), (s) => setIncoming(mapReq(s).filter((r: FriendRequest) => r.status === 'pending')), onErr('solicitudes'));
    const u2 = onSnapshot(outgoingQuery(uid), (s) => setOutgoing(mapReq(s).filter((r: FriendRequest) => r.status === 'pending')), onErr('enviadas'));
    const u3 = onSnapshot(
      friendsQuery(uid),
      (s) => setFriends(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Friendship)),
      onErr('amigos')
    );
    return () => { u1(); u2(); u3(); };
  }, [uid]);

  const value = useMemo<SocialState>(() => {
    const requestFrom = (other: string) => incoming.find((r) => r.from === other);
    const requestTo = (other: string) => outgoing.find((r) => r.to === other);
    return {
      incoming, outgoing, friends, requestFrom, requestTo,
      relation: (other) =>
        friends.some((f) => f.users.includes(other)) ? 'friend'
          : requestFrom(other) ? 'incoming'
          : requestTo(other) ? 'outgoing'
          : 'none',
    };
  }, [incoming, outgoing, friends]);

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial debe usarse dentro de SocialProvider');
  return ctx;
}
