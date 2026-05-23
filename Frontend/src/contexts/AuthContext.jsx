import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { createUser, getUser } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase user
  const [dbUser, setDbUser] = useState(null);    // Backend user data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Try to fetch user from backend
        try {
          const backendUser = await getUser(firebaseUser.uid);
          setDbUser(backendUser);
        } catch {
          // User doesn't exist in backend yet — that's ok
          setDbUser(null);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login with Google popup
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Register in backend if not exists (idempotent)
    try {
      await createUser({
        id: firebaseUser.uid,
        nombreCompleto: firebaseUser.displayName || 'Usuario',
        username: firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
      });
    } catch (err) {
      console.error('Error registering user in backend:', err);
    }

    // Always fetch the full user profile to ensure dbUser has the complete structure
    try {
      const fullUser = await getUser(firebaseUser.uid);
      setDbUser(fullUser);
    } catch (err) {
      console.error('Error fetching full user profile after Google login:', err);
      setDbUser(null);
    }

    return firebaseUser;
  };

  // Login with email/password
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    try {
      const backendUser = await getUser(result.user.uid);
      setDbUser(backendUser);
    } catch { /* ignore */ }
    return result.user;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setDbUser(null);
  };

  // Refresh backend user data
  const refreshUser = async () => {
    if (user) {
      try {
        const backendUser = await getUser(user.uid);
        setDbUser(backendUser);
      } catch { /* ignore */ }
    }
  };

  const value = {
    user,         // Firebase Auth user (uid, email, displayName, photoURL)
    dbUser,       // Backend user (full profile with hobbies, events)
    loading,
    loginWithGoogle,
    loginWithEmail,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
