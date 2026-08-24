import {
  collection,
  query,
  orderBy,
  limitToLast,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore';

export interface ChatMessage {
  readonly id: string;
  readonly uid: string;
  readonly teamId: string;
  readonly body: string;
  readonly createdAt: Date | null;
}

function mapDocToMessage(doc: QueryDocumentSnapshot<DocumentData>): ChatMessage {
  const data = doc.data();
  const ts = data['createdAt'];
  const createdAt = ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
  return {
    id: doc.id,
    uid: String(data['uid'] || ''),
    teamId: String(data['teamId'] || ''),
    body: String(data['body'] || ''),
    createdAt
  };
}

export function subscribeToMessages(
  db: Firestore,
  roomId: string,
  onUpdate: (messages: readonly ChatMessage[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limitToLast(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs = snapshot.docs.map(mapDocToMessage);
      onUpdate(msgs);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function sendMessage(
  db: Firestore,
  roomId: string,
  uid: string,
  teamId: string,
  body: string
): Promise<void> {
  const messagesRef = collection(db, 'rooms', roomId, 'messages');
  await addDoc(messagesRef, {
    uid,
    teamId,
    body: body.trim(),
    createdAt: serverTimestamp()
  });
}
