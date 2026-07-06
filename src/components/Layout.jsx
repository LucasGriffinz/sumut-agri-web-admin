import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  
  // PERBAIKAN 1: Sesuaikan pembacaan profil dengan kunci 'user_profile' dari Login.jsx yang baru
  const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');

  const handleLogout = () => {
    // PERBAIKAN 2: Hapus token utama dan profil secara permanen dari browser device ini
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_profile');

    // Tambahan Opsional: Jika ingin memastikan semua data development lama bersih total, aktifkan baris di bawah:
    // localStorage.clear();

    // PERBAIKAN 3: Gunakan opsi replace: true agar user tidak bisa menekan tombol 'Back' browser
    navigate('/login', { replace: true });

    // PERBAIKAN 4: Paksa browser memuat ulang memori (clear state cache React di RAM)
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-green-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">Sumut Agri</h1>
            <span className="text-green-200 text-sm hidden sm:inline">
              Dashboard Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="hover:text-green-200 transition text-sm">
              Dashboard
            </Link>
            <Link to="/pengguna" className="hover:text-green-200 transition text-sm">
              Pengguna
            </Link>
            <Link to="/komoditas" className="hover:text-green-200 transition text-sm">
              Komoditas
            </Link>
            {/* Menampilkan email admin atau nama dari local storage */}
            <span className="text-green-300 text-sm font-medium">
              {userProfile.email || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold transition shadow-sm"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* Konten halaman */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}