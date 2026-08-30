import { onAuthStateChanged } from 'firebase/auth';
import { db as publicDb, storage as publicStorage } from './config';
import { adminAuth, adminDb, adminStorage } from './adminConfig';

// Shared services are used by both the public site and the admin panel. Keep
// their Firebase client aligned with the active admin session when one exists.
export let activeDb = adminAuth.currentUser ? adminDb : publicDb;
export let activeStorage = adminAuth.currentUser ? adminStorage : publicStorage;

export function setAdminOperationClient(isAdmin: boolean) {
  activeDb = isAdmin ? adminDb : publicDb;
  activeStorage = isAdmin ? adminStorage : publicStorage;
}

if (typeof window !== 'undefined') {
  onAuthStateChanged(adminAuth, (admin) => {
    setAdminOperationClient(Boolean(admin));
  });
}
