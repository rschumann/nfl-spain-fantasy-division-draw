import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore
} from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  useEmulators: boolean;
}

export interface FirebaseClientBundle {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let bundleInstance: FirebaseClientBundle | null = null;

export function getFirebaseClient(config: FirebaseClientConfig): FirebaseClientBundle {
  if (bundleInstance) return bundleInstance;

  const app =
    getApps().length === 0
      ? initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          appId: config.appId
        })
      : getApps()[0]!;

  const auth = getAuth(app);
  const db = getFirestore(app);

  if (config.useEmulators) {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
    } catch {
      // Emulators might already be connected in development
    }
  }

  bundleInstance = { app, auth, db };
  return bundleInstance;
}
