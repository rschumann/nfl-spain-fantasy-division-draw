import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

describe('Firestore Security Rules (Task 07)', () => {
  let testEnv: RulesTestEnvironment;
  const roomId = 'nfl-spain-26-27';
  const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'nfl-spain-draw-local',
      firestore: { rules, host: '127.0.0.1', port: 8080 }
    });
  });

  afterAll(async () => {
    if (testEnv) await testEnv.cleanup();
  });

  beforeEach(async () => {
    if (testEnv) await testEnv.clearFirestore();
  });

  it('denies unauthenticated read and write', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    const msgRef = doc(unauthDb, `rooms/${roomId}/messages/msg-1`);
    await assertFails(getDoc(msgRef));
    await assertFails(setDoc(msgRef, { body: 'test' }));
  });

  it('allows authenticated user to read and write valid message in approved room', async () => {
    const authDb = testEnv.authenticatedContext('user-123').firestore();
    const msgRef = doc(authDb, `rooms/${roomId}/messages/msg-1`);

    await assertSucceeds(
      setDoc(msgRef, {
        uid: 'user-123',
        teamId: 'madrid-steelers',
        body: 'Hola liga!',
        createdAt: serverTimestamp()
      })
    );
    await assertSucceeds(getDoc(msgRef));
  });

  it('denies reading from unauthorized rooms or other collections', async () => {
    const authDb = testEnv.authenticatedContext('user-123').firestore();
    await assertFails(getDoc(doc(authDb, 'rooms/other-room/messages/msg-1')));
    await assertFails(getDoc(doc(authDb, 'secrets/admin-key')));
  });

  it('denies message creation with mismatched UID or unknown team', async () => {
    const authDb = testEnv.authenticatedContext('user-123').firestore();
    const msgRef1 = doc(authDb, `rooms/${roomId}/messages/msg-bad-uid`);
    await assertFails(
      setDoc(msgRef1, {
        uid: 'attacker-uid',
        teamId: 'madrid-steelers',
        body: 'Impersonation attempt',
        createdAt: serverTimestamp()
      })
    );

    const msgRef2 = doc(authDb, `rooms/${roomId}/messages/msg-bad-team`);
    await assertFails(
      setDoc(msgRef2, {
        uid: 'user-123',
        teamId: 'invalid-team-xyz',
        body: 'Invalid team',
        createdAt: serverTimestamp()
      })
    );
  });

  it('denies extra keys, invalid length, update and delete operations', async () => {
    const authDb = testEnv.authenticatedContext('user-123').firestore();
    const msgRef = doc(authDb, `rooms/${roomId}/messages/msg-extra`);
    await assertFails(
      setDoc(msgRef, {
        uid: 'user-123',
        teamId: 'madrid-steelers',
        body: 'Test',
        createdAt: serverTimestamp(),
        admin: true
      })
    );

    await assertFails(
      setDoc(msgRef, {
        uid: 'user-123',
        teamId: 'madrid-steelers',
        body: 'x'.repeat(501),
        createdAt: serverTimestamp()
      })
    );

    await assertFails(updateDoc(msgRef, { body: 'Updated text' }));
    await assertFails(deleteDoc(msgRef));
  });
});
