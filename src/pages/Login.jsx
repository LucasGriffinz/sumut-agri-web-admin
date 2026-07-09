import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

// Ganti fungsi parseJwt lama dengan versi super aman ini
const parseJwt = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Gagal melakukan parse JWT token:", e);
    return null;
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    loading(true);

    try {
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
      
      const decodedToken = parseJwt(data.access_token);
      const userRole = decodedToken?.role;

      if (userRole !== 'ADMIN') {
        throw new Error('Akses ditolak. Halaman ini hanya diperuntukkan bagi Administrator.');
      }

      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('user_profile', JSON.stringify({
        email: cleanEmail,
        role: userRole
      }));

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // PERBAIKAN 1: Tambahkan px-4 agar card tidak menempel ke pinggir layar HP
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* PERBAIKAN 2: Padding dinamis (p-6 di HP, p-8 di laptop) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-green-700 mb-6 tracking-tight">
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
              // PERBAIKAN 3: py-2.5 agar area ketukan keyboard HP lebih nyaman & text-base mencegah auto-zoom di iOS
              className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm bg-gray-50/50"
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
              className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm bg-gray-50/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 text-xs sm:text-sm bg-red-50 p-2.5 rounded border border-red-200 leading-relaxed animate-fadeIn">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-50 text-sm sm:text-base shadow-sm mt-2"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="mt-6 text-center text-[11px] sm:text-xs text-gray-400 leading-relaxed">
          Sistem Pemantauan Komoditas Pertanian Sumatera Utara
        </p>
      </div>
    </div>
  );
}