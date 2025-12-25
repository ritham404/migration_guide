import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Query,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { MigrationChat, Message } from './store';

// Collection references
const CHATS_COLLECTION = 'migration_chats';
const MESSAGES_SUB_COLLECTION = 'messages';

// Chat operations
export const createChat = async (
  userId: string,
  title: string
): Promise<MigrationChat> => {
  const chatId = doc(collection(db, CHATS_COLLECTION)).id;
  const now = new Date();

  const chat: MigrationChat = {
    id: chatId,
    userId,
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  await setDoc(doc(db, CHATS_COLLECTION, chatId), {
    userId,
    title,
    createdAt: now,
    updatedAt: now,
  });

  return chat;
};

export const getChat = async (chatId: string): Promise<MigrationChat | null> => {
  const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId));

  if (!chatDoc.exists()) {
    return null;
  }

  const data = chatDoc.data();
  const messagesCol = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUB_COLLECTION);
  const messagesSnapshot = await getDocs(
    query(messagesCol, orderBy('timestamp', 'asc'))
  );

  const messages: Message[] = messagesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      role: data.role,
      content: data.content,
      timestamp: data.timestamp?.toDate?.() || new Date(),
      file: data.file,
      migrationResult: data.migrationResult,
    };
  });

  return {
    id: chatId,
    userId: data.userId,
    title: data.title,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    messages,
  };
};

export const getUserChats = async (userId: string): Promise<MigrationChat[]> => {
  // Query by userId only (no composite index needed)
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const chats: MigrationChat[] = [];

  for (const chatDoc of snapshot.docs) {
    const data = chatDoc.data();
    const messagesCol = collection(db, CHATS_COLLECTION, chatDoc.id, MESSAGES_SUB_COLLECTION);
    const messagesSnapshot = await getDocs(
      query(messagesCol, orderBy('timestamp', 'asc'))
    );

    const messages: Message[] = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        content: data.content,
        timestamp: data.timestamp?.toDate?.() || new Date(),
        file: data.file,
        migrationResult: data.migrationResult,
      };
    });

    chats.push({
      id: chatDoc.id,
      userId: data.userId,
      title: data.title,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      messages,
    });
  }

  // Sort by updatedAt in descending order (most recent first)
  return chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

export const updateChat = async (
  chatId: string,
  updates: Partial<MigrationChat>
): Promise<void> => {
  const { messages, ...dataToUpdate } = updates;
  await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
    ...dataToUpdate,
    updatedAt: new Date(),
  });
};

export const deleteChat = async (chatId: string): Promise<void> => {
  await deleteDoc(doc(db, CHATS_COLLECTION, chatId));
};

// Message operations
export const addMessage = async (
  chatId: string,
  message: Omit<Message, 'id'>
): Promise<Message> => {
  const messageId = doc(collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUB_COLLECTION)).id;

  const messageWithId = {
    ...message,
    id: messageId,
  };

  // Build message object, only including defined fields (Firestore doesn't allow undefined)
  const messageData: any = {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
  };

  // Only add optional fields if they exist
  if (message.file) {
    messageData.file = message.file;
  }
  if (message.migrationResult) {
    messageData.migrationResult = message.migrationResult;
  }

  await setDoc(
    doc(db, CHATS_COLLECTION, chatId, MESSAGES_SUB_COLLECTION, messageId),
    messageData
  );

  // Update chat's updatedAt
  await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
    updatedAt: new Date(),
  });

  return messageWithId;
};

export const updateMessage = async (
  chatId: string,
  messageId: string,
  updates: Partial<Message>
): Promise<void> => {
  await updateDoc(
    doc(db, CHATS_COLLECTION, chatId, MESSAGES_SUB_COLLECTION, messageId),
    updates
  );
};

// Utility functions
export const renamChat = async (chatId: string, title: string): Promise<void> => {
  await updateChat(chatId, { title });
};
