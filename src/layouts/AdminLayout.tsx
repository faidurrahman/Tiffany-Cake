import React from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  const isAuthenticated = localStorage.getItem('tiffany_auth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('tiffany_auth');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-[#ebdxc8] shadow-sm h-16 flex items-center justify-between px-4 lg:hidden sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img 
              src="https://lh3.googleusercontent.com/d/1CqgcO5wm3__QKSxeB7x6RagKMazKjNuf" 
              alt="Tiffany Cake Logo" 
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/100x40/f3f4f6/a8a29e?text=Logo";
              }}
            />
            <span className="font-bold text-[#4a3b32]">Tiffany Admin</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#ebdxc8] flex justify-around items-center h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <NavLink 
          to="/admin/pos" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#4a3b32]' : 'text-[#8c7b70]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
          <span className="text-[10px] font-medium">POS</span>
        </NavLink>
        <NavLink 
          to="/admin/kas" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#4a3b32]' : 'text-[#8c7b70]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
          <span className="text-[10px] font-medium">Kas</span>
        </NavLink>
        <NavLink 
          to="/admin/products" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#4a3b32]' : 'text-[#8c7b70]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span className="text-[10px] font-medium">Produk</span>
        </NavLink>
        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#4a3b32]' : 'text-[#8c7b70]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <span className="text-[10px] font-medium">Pengaturan</span>
        </NavLink>
      </div>
    </div>
  );
}
