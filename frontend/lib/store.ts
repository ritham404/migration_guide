import { create } from 'zustand';

export interface MigrationChat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  file?: {
    name: string;
    type: string;
    size: number;
  };
  migrationResult?: {
    workspace: string;
    report: string;
  };
}

interface MigrationStore {
  currentChat: MigrationChat | null;
  chats: MigrationChat[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentChat: (chat: MigrationChat | null) => void;
  setChats: (chats: MigrationChat[]) => void;
  addChat: (chat: MigrationChat) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  deleteChat: (chatId: string) => void;
  updateChat: (chat: MigrationChat) => void;
}

export const useMigrationStore = create<MigrationStore>((set) => ({
  currentChat: null,
  chats: [],
  loading: false,
  error: null,

  setCurrentChat: (chat) => set({ currentChat: chat }),
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
  addMessage: (message) =>
    set((state) => {
      if (!state.currentChat) return state;
      return {
        currentChat: {
          ...state.currentChat,
          messages: [...state.currentChat.messages, message],
          updatedAt: new Date(),
        },
        chats: state.chats.map((chat) =>
          chat.id === state.currentChat?.id
            ? {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
              }
            : chat
        ),
      };
    }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  deleteChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
    })),
  updateChat: (chat) =>
    set((state) => ({
      chats: state.chats.map((c) => (c.id === chat.id ? chat : c)),
      currentChat: state.currentChat?.id === chat.id ? chat : state.currentChat,
    })),
}));
