import { useEffect } from 'react';
import create from 'zustand';
import { useRouter } from 'next/router';
import { auth, authProvider, db } from '@/firebase';
import User from '@/models/User';

const useStore = create((set) => ({
  user: null,
  isLoggingIn: false,
  isLoading: true,
  finishLoading: () => set({ isLogging: false, isLoading: false }),
  setUser: (user) => set({ user: user ? new User(user) : null }),
  login: () => auth.signInWithRedirect(authProvider)
}));

export default function useAuth() {
  const { user, isLoggingIn, finishLoading, setUser, login, isLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((rawUser) => {
      if (!rawUser) {
        router.push('/login');
        setUser(null);
        return finishLoading();
      }
      return db
        .collection('users')
        .doc(rawUser.uid)
        .onSnapshot((doc) => {
          const userData = doc.data();
          if (!userData) return null;
          setUser(userData);
          return finishLoading();
        });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && user.isPending) router.push('/pending');
  }, [user, isLoading]);

  const logout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return { user, logout, login, isLoading, isLoggingIn };
}
