// lib/store/authStore.ts
import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, authReady, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { sendWelcomeEmail } from '@/lib/services/emailService';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  initialize: () => () => void;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  updateUserProfile: (data: Partial<UserData>) => Promise<{ success: boolean; error?: string }>;
}

// Helper function for error messages
function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'You already have an account. Please login.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/missing-password': 'Please enter your password.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Google sign-in popup was blocked by the browser.',
    'auth/internal-error': 'Google sign-in could not start. Please check your connection and try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using another sign-in method.',
    'auth/unauthorized-domain': 'This domain is not authorized for Google sign-in.',
  };
  return messages[code] || 'An error occurred. Please try again.';
}

let authListener: (() => void) | null = null;
let authListenerStarting = false;
let authSubscriberCount = 0;

const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,

    initialize: () => {
      authSubscriberCount += 1;

      if (!authListener && !authListenerStarting) {
        authListenerStarting = true;
        set({ loading: true });

        void authReady.then(() => {
          if (authSubscriberCount === 0) return;

          authListener = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
              const now = new Date().toISOString();
              const basicUser: UserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
                photoURL: firebaseUser.photoURL || null,
                createdAt: now,
                updatedAt: now,
              };

              set({ user: basicUser, isAuthenticated: true, loading: false, error: null });

              void getDoc(doc(db, 'users', firebaseUser.uid))
                .then((userDoc) => {
                  if (!userDoc.exists() || auth.currentUser?.uid !== firebaseUser.uid) return;
                  const userData = userDoc.data();
                  set({
                    user: {
                      ...basicUser,
                      displayName: firebaseUser.displayName || userData.displayName || basicUser.displayName,
                      photoURL: firebaseUser.photoURL || userData.photoURL || null,
                      createdAt: userData.createdAt || basicUser.createdAt,
                      updatedAt: userData.updatedAt || basicUser.updatedAt,
                    },
                  });
                })
                .catch(() => undefined);
            } else {
              set({ user: null, isAuthenticated: false, loading: false, error: null });
            }
          });
        }).finally(() => {
          authListenerStarting = false;
        });
      }

      return () => {
        authSubscriberCount = Math.max(0, authSubscriberCount - 1);
        if (authSubscriberCount === 0 && authListener) {
          authListener();
          authListener = null;
        }
      };
    },

    signUp: async (name: string, email: string, password: string) => {
      set({ loading: true, error: null });
      
      try {
        await authReady;
        const normalizedEmail = email.trim();
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const firebaseUser = userCredential.user;
        
        await updateProfile(firebaseUser, { displayName: name });
        
        const userData = {
          uid: firebaseUser.uid,
          displayName: name,
          email: normalizedEmail,
          photoURL: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        void setDoc(doc(db, 'users', firebaseUser.uid), userData)
          .catch(() => undefined);

        // Email delivery must not prevent a successful account registration.
        void sendWelcomeEmail({ name, email: normalizedEmail })
          .catch((emailError) => console.error('Welcome email error:', emailError));
        
        const user: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: name,
          photoURL: null,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        };
        
        set({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        
        return { success: true };
      } catch (error: any) {
        const errorMessage = getAuthErrorMessage(error.code);
        set({ error: errorMessage, loading: false });
        return { success: false, error: errorMessage };
      }
    },

    signIn: async (email: string, password: string) => {
      set({ loading: true, error: null });
      
      try {
        await authReady;
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCredential.user;
        const now = new Date().toISOString();
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
            photoURL: firebaseUser.photoURL || null,
            createdAt: now,
            updatedAt: now,
          },
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        
        return { success: true };
      } catch (error: any) {
        const errorMessage = getAuthErrorMessage(error.code);
        set({ error: errorMessage, loading: false });
        return { success: false, error: errorMessage };
      }
    },

    // ✅ Google Login - NEW
    googleLogin: async () => {
      set({ loading: true, error: null });
      
      try {
        await authReady;
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const userCredential = await signInWithPopup(auth, provider);
        const firebaseUser = userCredential.user;
        const now = new Date().toISOString();
        const user: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
          photoURL: firebaseUser.photoURL || null,
          createdAt: now,
          updatedAt: now,
        };

        set({ user, isAuthenticated: true, loading: false, error: null });
        void getDoc(doc(db, 'users', firebaseUser.uid))
          .then((userDoc) => {
            if (!userDoc.exists()) {
              return setDoc(doc(db, 'users', firebaseUser.uid), {
                ...user,
                createdAt: now,
                updatedAt: now,
              });
            }
          })
          .catch(() => undefined);
        
        return { success: true };
      } catch (error: any) {
        console.error('Google login error:', error);
        const errorMessage = getAuthErrorMessage(error.code);
        set({ error: errorMessage, loading: false });
        return { success: false, error: errorMessage };
      }
    },

    logout: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    },

    resetPassword: async (email: string) => {
      set({ loading: true, error: null });
      
      try {
        await sendPasswordResetEmail(auth, email.trim(), {
          url: `${window.location.origin}/login`,
          handleCodeInApp: true,
        });
        set({ loading: false });
        return { success: true };
      } catch (error: any) {
        const errorMessage = getAuthErrorMessage(error.code);
        set({ error: errorMessage, loading: false });
        return { success: false, error: errorMessage };
      }
    },

    updateUserProfile: async (data: Partial<UserData>) => {
      set({ loading: true, error: null });
      
      try {
        const { user } = get();
        if (!user) {
          throw new Error('No user logged in');
        }
        
        await updateDoc(doc(db, 'users', user.uid), {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        
        set({
          user: { ...user, ...data, updatedAt: new Date().toISOString() },
          loading: false,
        });
        
        return { success: true };
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update profile';
        set({ error: errorMessage, loading: false });
        return { success: false, error: errorMessage };
      }
    },

    clearError: () => set({ error: null }),
  })
);

export default useAuthStore;
