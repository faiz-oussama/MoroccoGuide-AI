import LoadingScreen from '@/components/ui/LoadingScreen';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { app } from './firebase';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  
  const loginUser = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (email, password, displayName) => {
    try {
      // First create the user account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Then update their profile with the display name
      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }
      
      // Sign out immediately after creating the user
      await signOut(auth);
      return result.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const value = {
    user,
    loading,
    setLoading,
    loginUser,
    logoutUser,
    createUser
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
}