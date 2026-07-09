import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
// 1. IMPOR LOGO KAMU DI SINI (Sesuaikan format filenya .png / .svg)
import logoAgri from '../assets/react.png'; // Ganti 'react.svg' dengan nama file logomu asli, misal 'logo.png'

export default function Layout() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_profile');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* PERBAIKAN UTAMA: Bungkus Logo & Teks dengan Link ke /dashboard */}
            <Link to="/dashboard" className="flex items-center gap-3 group focus:outline-none">
              {/* Gambar Logo */}
              <img 
                src={logoAgri} 
                alt="Logo Sumut Agri" 
                className="h-8 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
              {/* Teks Judul (Sengaja disembunyikan di HP dengan 'hidden' dan muncul di layar kecil ke atas dengan 'sm:block') */}
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">
                  Sumut Agri
                </h1>
                <span className="text-green-200 text-sm hidden md:inline font-normal border-l border-green-700 pl-2">
                  Dashboard Admin
                </span>
              </div>
            </Link>

            {/* Sisi Kanan: Menu untuk Desktop (Laptop) */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="hover:text-green-200 transition text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/pengguna" className="hover:text-green-200 transition text-sm font-medium">
                Pengguna
              </Link>
              <Link to="/komoditas" className="hover:text-green-200 transition text-sm font-medium">
                Komoditas
              </Link>
              <span className="text-green-300 text-sm font-medium border-l border-green-700 pl-4">
                {userProfile.email || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm font-semibold transition shadow-sm"
              >
                Keluar
              </button>
            </div>

            {/* Tombol Hamburger (Hanya Muncul di HP/Tablet) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-green-200 focus:outline-none p-1"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Menu Dropdown untuk HP */}
          {isMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-green-700 flex flex-col gap-3 pb-2">
              <Link 
                to="/dashboard" 
                onClick={() => setIsMenuOpen(false)}
                className="hover:bg-green-700 px-3 py-2 rounded transition text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/pengguna" 
                onClick={() => setIsMenuOpen(false)}
                className="hover:bg-green-700 px-3 py-2 rounded transition text-sm font-medium"
              >
                Pengguna
              </Link>
              <Link 
                to="/komoditas" 
                onClick={() => setIsMenuOpen(false)}
                className="hover:bg-green-700 px-3 py-2 rounded transition text-sm font-medium"
              >
                Komoditas
              </Link>
              
              <div className="border-t border-green-700 my-1"></div>
              
              <div className="px-3 py-1 text-green-300 text-sm font-medium truncate">
                {userProfile.email || 'Admin'}
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 mx-3 my-1 py-2 rounded text-sm font-semibold transition shadow-sm text-center"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Konten halaman */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}