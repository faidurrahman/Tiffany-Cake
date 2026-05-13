import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'tri123') {
      localStorage.setItem('tiffany_auth', 'true');
      setLoginError('');
      navigate('/admin/pos');
    } else {
      setLoginError('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#f4ecd8] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md relative z-10 border border-[#fdfbf7]">
        <div className="flex flex-col items-center mb-10">
          <img 
            src="https://lh3.googleusercontent.com/d/1CqgcO5wm3__QKSxeB7x6RagKMazKjNuf" 
            alt="Tiffany Cake Logo" 
            className="h-20 w-auto object-contain mb-6"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/100x40/f3f4f6/a8a29e?text=Logo";
            }}
          />
          <h1 className="text-2xl font-bold text-[#4a3b32]" style={{ fontFamily: "'Playfair Display', serif" }}>Admin Portal</h1>
          <p className="text-[#8c7b70] text-sm mt-2">Silakan masuk untuk mengelola sistem</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {loginError && (
            <div className="bg-[#fef2f2] text-[#b91c1c] p-3 rounded-xl text-sm font-medium text-center border border-[#fee2e2]">
              {loginError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-[#4a3b32] mb-1.5">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#c4a485]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border border-[#ebdxc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c4a485] focus:border-transparent transition-all text-[#4a3b32]"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a3b32] mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#c4a485]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border border-[#ebdxc8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c4a485] focus:border-transparent transition-all text-[#4a3b32]"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4a3b32] hover:bg-[#342a23] text-white font-medium py-3.5 rounded-xl transition-colors mt-8 shadow-md"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
