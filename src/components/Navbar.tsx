import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#ebdxc8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://lh3.googleusercontent.com/d/1CqgcO5wm3__QKSxeB7x6RagKMazKjNuf" 
              alt="Tiffany Cake Logo" 
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/100x40/f3f4f6/a8a29e?text=Logo";
              }}
            />
            <span className="text-[#4a3b32] font-semibold text-xl tracking-wide hidden sm:block">
              TIFFANY CAKE
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="text-[#4a3b32] hover:text-[#c4a485] transition-colors p-2 flex items-center gap-2 font-medium"
            >
              <UserCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
