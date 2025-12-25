'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Send, Loader, Download, Eye, AlertCircle, X } from 'lucide-react';
import { useMigrationStore, Message, MigrationChat } from '@/lib/store';
import { addMessage } from '@/lib/firestore';
import { checkBackendHealth, getBackendUrl } from '@/lib/backend';

interface ChatWindowProps {
  chat: MigrationChat;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [viewingResult, setViewingResult] = useState<any | null>(null);
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file'); // Toggle between file upload and URL input
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addMessage: addMessageToStore } = useMigrationStore();

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await checkBackendHealth();
      setBackendAvailable(isAvailable);
    };
    checkBackend();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() && !file) return;

    setLoading(true);

    try {
      // Determine if we're processing a file or a URL
      const isGitHubUrl = inputMode === 'url' && input.trim().includes('github.com');

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: isGitHubUrl ? `GitHub Repository: ${input.trim()}` : input,
        timestamp: new Date(),
        file: file
          ? {
              name: file.name,
              type: file.type,
              size: file.size,
            }
          : undefined,
      };

      await addMessage(chat.id, userMessage);
      addMessageToStore(userMessage);

      // Process migration
      if (isGitHubUrl) {
        // Handle GitHub URL
        try {
          const backendUrl = getBackendUrl();
          console.log('Attempting to fetch from:', `${backendUrl}/migrate/url`);
          
          const response = await fetch(`${backendUrl}/migrate/url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source_url: input.trim(),
              include_suggestions: false,
            }),
          });

          if (!response.ok) {
            let errorDetail = `${response.status} ${response.statusText}`;
            try {
              const errorData = await response.json();
              errorDetail = errorData.detail || errorDetail;
            } catch {
              // Couldn't parse error response
            }
            throw new Error(`Backend error: ${errorDetail}`);
          }

          const result = await response.json();

          // Add assistant response with migration results
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Migration completed successfully!\n\nWorkspace: ${result.workspace}\n\nReport:\n${result.report}`,
            timestamp: new Date(),
            migrationResult: result,
          };

          await addMessage(chat.id, assistantMessage);
          addMessageToStore(assistantMessage);
        } catch (fetchError) {
          console.error('Backend fetch error:', fetchError);
          const errorMsg = fetchError instanceof Error ? fetchError.message : 'Failed to connect to backend';
          
          // Add error message
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `❌ Migration Error: ${errorMsg}\n\n⚠️ The backend server doesn't seem to be running or the GitHub URL is invalid.\n\nTo fix this, open a terminal and run:\n\ncd backend\npython -m uvicorn server:app --reload\n\nMake sure the GitHub URL is valid and the repository is accessible.`,
            timestamp: new Date(),
          };
          await addMessage(chat.id, errorMessage);
          addMessageToStore(errorMessage);
        }
      } else if (file) {
        // Handle file upload
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('include_suggestions', 'false');

          const backendUrl = getBackendUrl();
          console.log('Attempting to fetch from:', `${backendUrl}/migrate/file`);
          console.log('FormData contents:', { file: file.name, file_type: file.type, file_size: file.size });
          
          const response = await fetch(`${backendUrl}/migrate/file`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            let errorDetail = `${response.status} ${response.statusText}`;
            try {
              const errorData = await response.json();
              errorDetail = errorData.detail || errorDetail;
            } catch {
              // Couldn't parse error response
            }
            throw new Error(`Backend error: ${errorDetail}`);
          }

          const result = await response.json();

          // Add assistant response with migration results
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Migration completed successfully!\n\nWorkspace: ${result.workspace}\n\nReport:\n${result.report}`,
            timestamp: new Date(),
            migrationResult: result,
          };

          await addMessage(chat.id, assistantMessage);
          addMessageToStore(assistantMessage);
        } catch (fetchError) {
          console.error('Backend fetch error:', fetchError);
          const errorMsg = fetchError instanceof Error ? fetchError.message : 'Failed to connect to backend';
          
          // Add error message
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `❌ Migration Error: ${errorMsg}\n\n⚠️ The backend server doesn't seem to be running.\n\nTo fix this, open a terminal and run:\n\ncd backend\npython -m uvicorn server:app --reload\n\nThen try uploading again.`,
            timestamp: new Date(),
          };
          await addMessage(chat.id, errorMessage);
          addMessageToStore(errorMessage);
        }
      } else {
        // No file or URL
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: inputMode === 'url' 
            ? 'Please enter a valid GitHub repository URL' 
            : 'Please upload a ZIP file to start the migration.',
          timestamp: new Date(),
        };
        await addMessage(chat.id, assistantMessage);
        addMessageToStore(assistantMessage);
      }

      setInput('');
      setFile(null);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
      };
      await addMessage(chat.id, errorMessage);
      addMessageToStore(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {chat.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-lg rounded-tr-none'
                    : 'bg-slate-700 text-slate-100 rounded-lg rounded-tl-none'
                } p-4`}
              >
                <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>

                {message.file && (
                  <div className="mt-3 text-xs bg-black/20 rounded p-2">
                    📎 {message.file.name}
                  </div>
                )}

                {message.migrationResult && (
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => {
                        const element = document.createElement('a');
                        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(message.migrationResult?.report || ''));
                        element.setAttribute('download', 'migration-report.txt');
                        element.style.display = 'none';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Download size={12} />
                      Download
                    </button>
                    <button 
                      onClick={() => message.migrationResult && setViewingResult(message.migrationResult)}
                      className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Eye size={12} />
                      View
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-700 rounded-lg rounded-tl-none p-4 flex items-center gap-2">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm text-slate-100">Processing migration...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-600 p-4">
        {/* Backend Status Warning */}
        {backendAvailable === false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400">
              <p className="font-medium">Backend server offline</p>
              <p className="text-xs opacity-75 mt-1">Start it with: python -m uvicorn server:app --reload</p>
            </div>
          </motion.div>
        )}

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-slate-700 rounded-lg p-3 flex items-center justify-between"
          >
            <span className="text-sm text-slate-200">📎 {file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Input Mode Tabs */}
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setInputMode('file');
              setInput('');
              setFile(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📁 Upload ZIP
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode('url');
              setInput('');
              setFile(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🔗 GitHub URL
          </button>
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          {inputMode === 'file' && (
            <label className="flex-shrink-0 cursor-pointer">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".zip,.rar,.7z"
                className="hidden"
              />
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                <Upload size={20} className="text-blue-400" />
              </div>
            </label>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputMode === 'url' ? 'https://github.com/user/repo' : 'Describe your migration needs...'}
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !file)}
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 transition-colors"
          >
            {loading ? (
              <Loader size={20} className="animate-spin text-white" />
            ) : (
              <Send size={20} className="text-white" />
            )}
          </button>
        </form>

        {/* Report Viewer Modal */}
        <AnimatePresence>
          {viewingResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setViewingResult(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  <h2 className="text-xl font-bold text-white">Migration Report</h2>
                  <button
                    onClick={() => setViewingResult(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300 mb-2">Workspace</h3>
                      <p className="text-sm text-slate-100 font-mono bg-slate-900 p-3 rounded">
                        {viewingResult.workspace}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-300 mb-2">Migration Report</h3>
                      <pre className="text-xs text-slate-100 bg-slate-900 p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap break-words">
                        {viewingResult.report}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 p-6 border-t border-slate-700 bg-slate-900">
                  <button
                    onClick={() => {
                      const element = document.createElement('a');
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(viewingResult.report));
                      element.setAttribute('download', 'migration-report.txt');
                      element.style.display = 'none';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download Report
                  </button>
                  <button
                    onClick={() => setViewingResult(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
