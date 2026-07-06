import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fungsi pembantu untuk membaca payload di dalam Token JWT tanpa library tambahan
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // PERBAIKAN 1: Paksa email menjadi huruf kecil (.toLowerCase()) agar tidak sensitif huruf kapital
      const cleanEmail = email.toLowerCase();

      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Login gagal');
      }

      const data = await response.json();
      
      // Bongkar token untuk melihat isi role asli dari PostgreSQL lokal
      const decodedToken = parseJwt(data.access_token);
      const userRole = decodedToken?.role; // Mengambil klaim "role" di JWT

      // PERBAIKAN 2: Validasi Role. Jika bukan ADMIN, cegat di sini dan lempar error
      if (userRole !== 'ADMIN') {
        throw new Error('Akses ditolak. Halaman ini hanya diperuntukkan bagi Administrator.');
      }

      // Jika dia sukses dan benar seorang ADMIN, simpan token ke browser
      localStorage.setItem('admin_token', data.access_token);

      localStorage.setItem('user_profile', JSON.stringify({
        email: cleanEmail,
        role: userRole
      }));

      // Selamat datang Admin, silakan masuk ke dashboard utama
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Admin Sumut Agri
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@sumutagri.id"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          Sistem Pemantauan Komoditas Pertanian Sumatera Utara
        </p>
      </div>
    </div>
  );
}