'use client';

import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

export default function DebugAuth() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyCYvx1mVGqftSrTIYam-lF3PTtWKqrweZc",
    authDomain: "migrate-346c7.firebaseapp.com",
    projectId: "migrate-346c7",
    storageBucket: "migrate-346c7.firebasestorage.app",
    messagingSenderId: "754673176878",
    appId: "1:754673176878:web:09504ac908aeac8e586abf",
  };

  const testAuth = async () => {
    setLoading(true);
    setResult('Testing...');
    try {
      const app = initializeApp(firebaseConfig, { name: 'test' });
      const auth = getAuth(app);

      // Try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setResult(`✅ Sign In Success: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.code} - ${error.message}`);
    }
    setLoading(false);
  };

  const testSignUp = async () => {
    setLoading(true);
    setResult('Testing...');
    try {
      const app = initializeApp(firebaseConfig, { name: 'test-signup' });
      const auth = getAuth(app);
      const testEmail = `test-${Date.now()}@example.com`;

      // Try to sign up
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, password);
      setResult(`✅ Sign Up Success: ${userCredential.user.email}`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.code} - ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-md mx-auto bg-slate-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Firebase Auth Debug</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={testSignUp}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-medium py-2 rounded transition-colors"
          >
            Test Sign Up
          </button>

          <button
            onClick={testAuth}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2 rounded transition-colors"
          >
            Test Sign In
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-slate-700 rounded text-white text-sm font-mono whitespace-pre-wrap break-words">
            {result}
          </div>
        )}

        <p className="text-xs text-slate-400 mt-6">
          Check browser console (F12) for detailed error information
        </p>
      </div>
    </div>
  );
}
