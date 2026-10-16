import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  PhoneAuthProvider,
  signOut as fbSignOut,
  updateProfile as updateFirebaseProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { isNative } from '../native';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  setupPhoneRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneCode: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  boostAura67: (amount?: number) => Promise<void>;
  updateBio: (bio: string) => Promise<void>;
  updateProfilePhoto: (file: File) => Promise<string>;
  updateCoverPhoto: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load or initialize Firestore profile when Firebase auth user changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            // Completar campos de búsqueda en perfiles viejos
            const patch: Record<string, string> = {};
            if (!data.displayNameLower && data.displayName) patch.displayNameLower = data.displayName.toLowerCase();
            if (currentUser.phoneNumber && data.phoneNumber !== currentUser.phoneNumber) patch.phoneNumber = currentUser.phoneNumber;
            if (Object.keys(patch).length) {
              try {
                await updateDoc(userRef, patch);
              } catch (e) {
                console.warn('No se pudo completar el perfil:', e);
              }
            }
            setProfile({ ...data, ...patch });
          } else {
            const displayName =
              currentUser.displayName ||
              (currentUser.phoneNumber ? `Usuario ${currentUser.phoneNumber.slice(-4)}` : 'Usuario SixSeven');
            const baseHandle = (currentUser.displayName || '')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
              .slice(0, 15) || (currentUser.phoneNumber ? currentUser.phoneNumber.slice(-4) : 'user');
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              displayName,
              displayNameLower: displayName.toLowerCase(),
              username: `${baseHandle}_${currentUser.uid.slice(0, 4).toLowerCase()}`,
              photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}&backgroundColor=000000`,
              bio: 'Hola, estoy usando SixSeven',
              score67: 0,
              followersCount: 0,
              followingCount: 0,
              createdAt: new Date().toISOString(),
              ...(currentUser.phoneNumber ? { phoneNumber: currentUser.phoneNumber } : {}),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          // If Firestore read fails (e.g., offline or permissions), fallback to basic local profile
          console.warn('Could not sync user profile with Firestore:', err);
          setProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Usuario SixSeven',
            username: 'usuario',
            score67: 0,
            followersCount: 0,
            followingCount: 0,
            photoURL: currentUser.photoURL || undefined,
            bio: '',
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (isNative) {
        // En la app Android: selector nativo de cuentas de Google, luego se
        // entra a Firebase (JS) con el idToken para que Firestore vea la sesión.
        const result = await FirebaseAuthentication.signInWithGoogle();
        const idToken = result.credential?.idToken;
        if (!idToken) throw new Error('Google no devolvió un token válido.');
        await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const setupPhoneRecaptcha = (containerId: string): RecaptchaVerifier => {
    // En Android el SMS lo gestiona el plugin nativo (sin reCAPTCHA web).
    if (isNative) return {} as RecaptchaVerifier;
    // Reset any existing instance attached to window if needed
    const win = window as unknown as { recaptchaVerifier?: RecaptchaVerifier };
    if (win.recaptchaVerifier) {
      try {
        win.recaptchaVerifier.clear();
      } catch {
        // ignore
      }
    }
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired');
      },
    });
    win.recaptchaVerifier = verifier;
    return verifier;
  };

  const sendPhoneCode = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      if (isNative) {
        const verificationId = await new Promise<string>((resolve, reject) => {
          const handles: Array<{ remove: () => Promise<void> }> = [];
          const cleanup = () => handles.forEach((h) => h.remove().catch(() => undefined));
          (async () => {
            handles.push(
              await FirebaseAuthentication.addListener('phoneCodeSent', (event) => {
                cleanup();
                resolve(event.verificationId);
              })
            );
            handles.push(
              await FirebaseAuthentication.addListener('phoneVerificationFailed', (event) => {
                cleanup();
                reject(new Error(event.message));
              })
            );
            await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber });
          })().catch((e) => {
            cleanup();
            reject(e);
          });
        });
        const nativeResult = {
          verificationId,
          confirm: (verificationCode: string) =>
            signInWithCredential(auth, PhoneAuthProvider.credential(verificationId, verificationCode)),
        };
        return nativeResult as unknown as ConfirmationResult;
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Phone sign in error:', error);
      throw error;
    }
  };

  const confirmPhoneCode = async (confirmationResult: ConfirmationResult, code: string) => {
    try {
      await confirmationResult.confirm(code);
    } catch (error) {
      console.error('SMS verification code error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setProfile(null);
  };

  const updateBio = async (bio: string) => {
    if (!profile) return;
    const clean = bio.trim().slice(0, 200);
    setProfile({ ...profile, bio: clean });
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { bio: clean });
      } catch (err) {
        console.warn('No se pudo guardar la bio:', err);
      }
    }
  };

  const updateProfilePhoto = async (file: File): Promise<string> => {
    if (!user?.uid) throw new Error('Iniciá sesión para cambiar tu foto.');
    if (!file.type.startsWith('image/')) throw new Error('Elegí un archivo de imagen válido.');
    if (file.size > 10 * 1024 * 1024) throw new Error('La imagen supera los 10 MB. Elegí una más liviana.');
    const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const target = storageRef(storage, `users/${user.uid}/profile/avatar-${Date.now()}.${extension}`);
    const uploaded = await uploadBytes(target, file, { contentType: file.type || 'image/jpeg' });
    const url = await getDownloadURL(uploaded.ref);
    await updateFirebaseProfile(user, { photoURL: url });
    await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
    setProfile((current) => current ? { ...current, photoURL: url } : current);
    return url;
  };

  const updateCoverPhoto = async (file: File): Promise<string> => {
    if (!user?.uid) throw new Error('Iniciá sesión para cambiar la portada.');
    if (!file.type.startsWith('image/')) throw new Error('Elegí un archivo de imagen válido.');
    if (file.size > 10 * 1024 * 1024) throw new Error('La imagen supera los 10 MB. Elegí una más liviana.');
    const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const target = storageRef(storage, `users/${user.uid}/profile/cover-${Date.now()}.${extension}`);
    const uploaded = await uploadBytes(target, file, { contentType: file.type || 'image/jpeg' });
    const url = await getDownloadURL(uploaded.ref);
    await updateDoc(doc(db, 'users', user.uid), { coverURL: url });
    setProfile((current) => current ? { ...current, coverURL: url } : current);
    return url;
  };

  const boostAura67 = async (amount = 67) => {
    if (!profile) return;
    const newScore = (profile.score67 || 0) + amount;
    setProfile({ ...profile, score67: newScore });

    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { score67: newScore });
      } catch (err) {
        // Log gracefully
        console.warn('Score update delayed:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        setupPhoneRecaptcha,
        sendPhoneCode,
        confirmPhoneCode,
        signOut,
        boostAura67,
        updateBio,
        updateProfilePhoto,
        updateCoverPhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
