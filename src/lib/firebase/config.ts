import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Keep admin authentication in a separate Firebase app. Auth persistence is
// scoped by app name, so an admin login cannot replace the public user session
// in this tab or any other tab.
const adminApp = getApps().find((candidate) => candidate.name === 'admin')
  ?? initializeApp(firebaseConfig, 'admin');
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

// Creating another admin signs that new account into the Auth instance used
// for creation. Use a third isolated app so the acting admin stays signed in.
const adminCreationApp = getApps().find((candidate) => candidate.name === 'admin-creation')
  ?? initializeApp(firebaseConfig, 'admin-creation');
const adminCreationAuth = getAuth(adminCreationApp);

export {
  app,
  auth,
  db,
  storage,
  adminApp,
  adminAuth,
  adminDb,
  adminStorage,
  adminCreationAuth,
};

