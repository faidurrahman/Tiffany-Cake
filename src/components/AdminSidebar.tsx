import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShoppingBag, Settings, Wallet } from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('tiffany_auth');
    navigate('/');
  };

  const navClasses = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      isActive 
        ? 'bg-[#4a3b32] text-white shadow-md' 
        : 'text-[#8c7b70] hover:bg-[#f4ecd8] hover:text-[#4a3b32]'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-[#ebdxc8] hidden lg:flex flex-col shadow-sm">
      <div className="h-24 flex items-center justify-center border-b border-[#ebdxc8]">
        <img 
          src="https://lh3.googleusercontent.com/d/1CqgcO5wm3__QKSxeB7x6RagKMazKjNuf" 
          alt="Tiffany Cake Logo" 
          className="h-12 w-auto object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/100x40/f3f4f6/a8a29e?text=Logo";
          }}
        />
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        <NavLink to="/admin/pos" className={navClasses}>
          <LayoutDashboard className="w-5 h-5" />
          Menu Kasir (POS)
        </NavLink>
        <NavLink to="/admin/kas" className={navClasses}>
          <Wallet className="w-5 h-5" />
          Buku Kas
        </NavLink>
        <NavLink to="/admin/products" className={navClasses}>
          <ShoppingBag className="w-5 h-5" />
          Kelola Produk
        </NavLink>
        <NavLink to="/admin/settings" className={navClasses}>
          <Settings className="w-5 h-5" />
          Pengaturan Web
        </NavLink>
      </div>

      <div className="p-4 border-t border-[#ebdxc8]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
