// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuth, getUserProfile } from '../firebase/authService';
import { subscribeToUser } from '../firebase/firestoreService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub;
    const authUnsub = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Subscribe to live profile updates
        unsub = subscribeToUser(firebaseUser.uid, (profileData) => {
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
        if (unsub) unsub();
      }
    });
    return () => {
      authUnsub();
      if (unsub) unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
