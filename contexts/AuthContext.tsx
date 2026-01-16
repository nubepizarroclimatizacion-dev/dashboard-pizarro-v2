
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { auth, useMockAuth } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

// --- Auth Context Shape ---
interface AuthContextType {
  currentUser: any | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// --- Auth Provider Component ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (useMockAuth) {
        // MOCK MODE: Check local storage for persistence
        const storedUser = localStorage.getItem('pizarro_mock_user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing mock user", e);
                localStorage.removeItem('pizarro_mock_user');
            }
        }
        setLoading(false);
        return () => {};
    }

    // REAL MODE: Firebase listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const email = `${username.toLowerCase().trim()}@pizarro.local`;

    if (useMockAuth) {
        // MOCK MODE: Simulate login
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        // Basic validation simulation
        if (!password || password.length < 4) {
             // Simulate a Firebase error code
             throw { code: 'auth/wrong-password' }; 
        }

        const mockUser = {
            uid: 'mock-user-id-' + Date.now(),
            email: email,
            displayName: username,
            emailVerified: true,
            isAnonymous: false,
            phoneNumber: null,
            photoURL: null,
            providerId: 'mock',
            metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
        };

        localStorage.setItem('pizarro_mock_user', JSON.stringify(mockUser));
        setCurrentUser(mockUser);
        return;
    }

    // REAL MODE
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    if (useMockAuth) {
        // MOCK MODE
        await new Promise(resolve => setTimeout(resolve, 500));
        localStorage.removeItem('pizarro_mock_user');
        setCurrentUser(null);
        return;
    }

    // REAL MODE
    await signOut(auth);
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (useMockAuth) {
        // MOCK MODE
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (newPassword.length < 6) {
             throw { code: 'auth/weak-password', message: 'Password should be at least 6 characters' };
        }
        // Success (no-op)
        return;
    }

    // REAL MODE
    if (!auth.currentUser) {
      throw new Error("No hay un usuario autenticado.");
    }
    
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
    
    // Re-authenticate user before updating password for security reasons
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    await firebaseUpdatePassword(auth.currentUser, newPassword);
  }, []);
  
  const value = useMemo(() => ({
    currentUser,
    loading,
    login,
    logout,
    updatePassword,
  }), [currentUser, loading, login, logout, updatePassword]);

  if (loading) {
    return null; 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook to use Auth Context ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
