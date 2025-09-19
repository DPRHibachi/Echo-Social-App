import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
  UserCredential
} from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  echoId: string | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  rotateEchoId: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [echoId, setEchoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const generateEchoId = () => {
    return `Echo${Math.floor(Math.random() * 10000)}`;
  };

  const updateUserEchoId = async (userId: string, newEchoId: string) => {
    await setDoc(doc(db, 'users', userId), {
      echoId: newEchoId,
      lastRotated: new Date()
    }, { merge: true });
    setEchoId(newEchoId);
  };

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newEchoId = generateEchoId();
      await updateUserEchoId(userCredential.user.uid, newEchoId);
    } catch (error: any) {
      console.error('Error during signup:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error during password reset:', error);
      throw error;
    }
  };

  const rotateEchoId = async () => {
    if (currentUser) {
      try {
        const newEchoId = generateEchoId();
        await updateUserEchoId(currentUser.uid, newEchoId);
      } catch (error: any) {
        console.error('Error during Echo ID rotation:', error);
        throw error;
      }
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. User:', user); // Log user state
      setCurrentUser(user);

      let unsubscribeFirestore: () => void = () => {}; // Initialize unsubscribe variable

      if (user?.uid) { // Explicitly check for user and uid
        // Listen for real-time updates to the user document
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setEchoId(userData.echoId || null); // Set echoId, handle missing field
          } else {
            // User document doesn't exist, create it with a new Echo ID
            const newEchoId = generateEchoId();
            updateUserEchoId(user.uid, newEchoId); // Use the existing helper to create/update
            setEchoId(newEchoId);
          }
          setLoading(false); // Set loading to false after initial data load
        }, (error) => {
          console.error('Error fetching user data in real-time:', error);
          setLoading(false); // Also set loading to false on error
        });

      } else {
        // User is logged out or user/uid is not available yet
        setEchoId(null);
        setLoading(false);
      }
      // Cleanup Firestore listener when auth state changes or component unmounts
       return () => { 
           unsubscribeFirestore();
       };
    });

    // Cleanup Auth state listener on component unmount
    return () => unsubscribeAuth();
  }, [auth]); // Depend on auth instance

  const value = {
    currentUser,
    echoId,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    rotateEchoId
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 