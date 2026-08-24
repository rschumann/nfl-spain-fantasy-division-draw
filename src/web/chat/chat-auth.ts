import { signInAnonymously, type Auth, type User } from 'firebase/auth';

export async function ensureAnonymousAuth(auth: Auth): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export function getCurrentUid(auth: Auth): string | null {
  return auth.currentUser?.uid ?? null;
}
