import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-[#4a3b32] text-[#f4ecd8] py-8 text-center mt-12">
        <p className="font-sm opacity-80">© {new Date().getFullYear()} Tiffany Cake. All rights reserved.</p>
      </footer>
    </div>
  );
}
