'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useMigrationStore, MigrationChat } from '@/lib/store';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { createChat, getUserChats } from '@/lib/firestore';
import { Loader } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { currentChat, setCurrentChat, setChats, addChat } = useMigrationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const chats = await getUserChats(user.uid);
      setChats(chats);
      if (chats.length > 0) {
        setCurrentChat(chats[0]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const title = `Migration - ${new Date().toLocaleDateString()}`;
      const newChat = await createChat(user.uid, title);
      addChat(newChat);
      setCurrentChat(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader className="animate-spin text-blue-400" size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-900">
      <Sidebar
        currentChat={currentChat}
        onSelectChat={setCurrentChat}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="animate-spin text-blue-400" size={40} />
          </div>
        ) : currentChat ? (
          <ChatWindow chat={currentChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to Cloud Migration Assistant
              </h2>
              <p className="text-slate-400 mb-6">
                Create a new migration project to get started
              </p>
              <button
                onClick={handleNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Start New Migration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
