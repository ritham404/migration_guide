'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, Plus, LogOut, Menu, X } from 'lucide-react';
import { useMigrationStore, MigrationChat } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { deleteChat, renamChat } from '@/lib/firestore';
import Link from 'next/link';

interface SidebarProps {
  currentChat: MigrationChat | null;
  onSelectChat: (chat: MigrationChat) => void;
  onNewChat: () => void;
}

export function Sidebar({ currentChat, onSelectChat, onNewChat }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { chats, deleteChat: deleteFromStore } = useMigrationStore();
  const { user, logout } = useAuth();

  const handleDelete = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      deleteFromStore(chatId);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleRename = async (chatId: string) => {
    if (!editTitle.trim()) return;
    try {
      await renamChat(chatId, editTitle);
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        onSelectChat({ ...chat, title: editTitle });
      }
      setEditingId(null);
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-700 p-2 rounded-lg text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 flex flex-col md:static md:translate-x-0 z-40"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">MA</span>
            </div>
            <div>
              <h1 className="text-white font-bold">Migration</h1>
              <p className="text-xs text-slate-400">Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="m-4 flex items-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>New Migration</span>
        </motion.button>

        {/* Divider */}
        <div className="px-4">
          <div className="h-px bg-slate-700"></div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs text-slate-500 font-semibold px-2 mb-3">HISTORY</p>
          <AnimatePresence>
            {chats.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No chats yet</p>
            ) : (
              chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`group relative mb-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChat?.id === chat.id
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {editingId === chat.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full bg-slate-600 text-white rounded px-2 py-1 text-sm focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div
                        onClick={() => onSelectChat(chat)}
                        className="flex-1 truncate text-sm"
                      >
                        {chat.title}
                      </div>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(chat.id);
                            setEditTitle(chat.title);
                          }}
                          className="p-1 hover:bg-slate-600 rounded"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(chat.id);
                          }}
                          className="p-1 hover:bg-red-600/20 rounded text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* User Section */}
        <div className="border-t border-slate-700 p-4 space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 md:hidden z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
}
