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
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

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
    'auth/email-already-in-use': 'This email is already registered. Please login.',
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
    'auth/account-exists-with-different-credential': 'An account already exists with this email using another sign-in method.',
    'auth/unauthorized-domain': 'This domain is not authorized for Google sign-in.',
  };
  return messages[code] || 'An error occurred. Please try again.';
}

const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,

    initialize: () => {
      set({ loading: true });
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};
            
            const user: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userData.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
              photoURL: firebaseUser.photoURL || userData.photoURL || null,
              createdAt: userData.createdAt || new Date().toISOString(),
              updatedAt: userData.updatedAt || new Date().toISOString(),
            };
            
            set({
              user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error('Error fetching user data:', error);
            const user: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
              photoURL: firebaseUser.photoURL || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            set({
              user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          }
        } else {
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      });

      return unsubscribe;
    },

    signUp: async (name: string, email: string, password: string) => {
      set({ loading: true, error: null });
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        await updateProfile(firebaseUser, { displayName: name });
        
        const userData = {
          uid: firebaseUser.uid,
          displayName: name,
          email: email,
          photoURL: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          const user: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || userData.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
            photoURL: firebaseUser.photoURL || userData.photoURL || null,
            createdAt: userData.createdAt || new Date().toISOString(),
            updatedAt: userData.updatedAt || new Date().toISOString(),
          };
          
          set({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } catch (error) {
          const user: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
            photoURL: firebaseUser.photoURL || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        }
        
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
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const firebaseUser = userCredential.user;
        
        // Check if user exists in Firestore, if not create
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (!userDoc.exists()) {
            // Create new user document
            const userData = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          }
          
          const userDocData = (await getDoc(doc(db, 'users', firebaseUser.uid))).data() || {};
          
          const user: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || userDocData.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
            photoURL: firebaseUser.photoURL || userDocData.photoURL || null,
            createdAt: userDocData.createdAt || new Date().toISOString(),
            updatedAt: userDocData.updatedAt || new Date().toISOString(),
          };
          
          set({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          
        } catch (error) {
          // If Firestore fails, still set user with basic info
          console.error('Error fetching/creating user data:', error);
          const user: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
            photoURL: firebaseUser.photoURL || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        }
        
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
        await sendPasswordResetEmail(auth, email, {
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