'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

type AppUser = {
  uid: string;
  email: string | null;
  name: string | null;
  emailVerified: boolean;
};

type AuthResult =
  | { success: true }
  | { success: false; message: string };

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  resendVerification: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(user: FirebaseUser): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    emailVerified: user.emailVerified,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      await reload(firebaseUser);
      setUser(mapUser(firebaseUser));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      await reload(cred.user);

      if (!cred.user.emailVerified) {
        await signOut(auth);
        return {
          success: false,
          message: 'Please verify your email before signing in.',
        };
      }

      const token = await cred.user.getIdToken(true);

      const syncRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!syncRes.ok) {
        await signOut(auth);
        return {
          success: false,
          message: 'Your account could not be synced. Please try again.',
        };
      }

      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      });

      if (!sessionRes.ok) {
        await signOut(auth);
        return {
          success: false,
          message: 'Failed to create login session. Please try again.',
        };
      }

      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential') {
        return { success: false, message: 'Invalid email or password.' };
      }

      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ): Promise<AuthResult> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(cred.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });

      await sendEmailVerification(cred.user);

      const token = await cred.user.getIdToken(true);

      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
        }),
      });

      if (!res.ok) {
        return {
          success: false,
          message: 'Account created, but profile sync failed.',
        };
      }

      await signOut(auth);

      return {
        success: true,
      };
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        return {
          success: false,
          message: 'An account with this email already exists.',
        };
      }

      if (err?.code === 'auth/weak-password') {
        return {
          success: false,
          message: 'Password must be at least 6 characters.',
        };
      }

      return {
        success: false,
        message: 'Something went wrong. Please try again.',
      };
    }
  };

  const resendVerification = async (): Promise<AuthResult> => {
    try {
      if (!auth.currentUser) {
        return { success: false, message: 'No signed-in user found.' };
      }

      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch {
      return { success: false, message: 'Failed to resend verification email.' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    await signOut(auth);
  };

  const getIdToken = async () => {
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      getIdToken,
      resendVerification,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}