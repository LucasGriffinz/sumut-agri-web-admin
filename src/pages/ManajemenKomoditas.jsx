import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function ManajemenKomoditas() {
  const [komoditas, setKomoditas] = useState([]);
  const [nama, setNama] = useState('');
  const [satuan, setSatuan] = useState('kg');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');

  const fetchData = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/komoditas/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error('Gagal memuat data komoditas dari database');

      const data = await res.json();
      setKomoditas(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // ✅ SUDAH DIPERBAIKI: Menggunakan fungsi setter 'setLoading' yang benar agar tidak crash

    try {
      const res = await fetch(`${API_BASE}/api/komoditas/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nama_komoditas: nama, satuan, deskripsi }),
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Gagal menambahkan komoditas baru');
      }

      setNama('');
      setSatuan('kg');
      setDeskripsi('');
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Judul adaptif */}
      <h2 className="text-xl sm:text-2xl font-bold text-green-800 tracking-tight">Manajemen Jenis Komoditas</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs sm:text-sm mt-4">
          {error}
        </div>
      )}

      {/* Form layout dengan CSS Grid adaptif */}
      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-5 rounded-xl shadow grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        {/* Input Nama Komoditas */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 sm:hidden">Nama Komoditas</label>
          <input
            required
            type="text"
            value={nama}
            onChange={e => setNama(e.target.value)}
            placeholder="Nama komoditas (misal: Cabai Merah)"
            className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm bg-gray-50/30"
          />
        </div>
        
        {/* Input Satuan */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 sm:hidden">Satuan</label>
          <input
            required
            type="text"
            value={satuan}
            onChange={e => setSatuan(e.target.value)}
            placeholder="Satuan"
            className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-base sm:text-sm bg-gray-50/30"
          />
        </div>
        
        {/* Input Deskripsi */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 sm:hidden">Deskripsi</label>
          <input
            type="text"
            value={deskripsi}
            onChange={e => setDeskripsi(e.target.value)}
            placeholder="Deskripsi opsional komoditas..."
            className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm bg-gray-50/30"
          />
        </div>
        
        {/* Tombol Submit */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-semibold py-2.5 sm:py-2 px-5 rounded-lg hover:bg-green-800 transition duration-200 disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? 'Menyimpan...' : 'Tambah'}
          </button>
        </div>
      </form>

      {/* Tabel Tampilan Data */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto subpixel-antialiased">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Komoditas</th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Satuan Kerja</th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi Tambahan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {komoditas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 sm:px-6 text-center text-gray-400 italic">
                    Belum ada jenis komoditas terdaftar di database lokal.
                  </td>
                </tr>
              ) : (
                komoditas.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3.5 sm:px-6 whitespace-nowrap font-medium text-gray-900">{k.nama_komoditas}</td>
                    <td className="px-4 py-3.5 sm:px-6 whitespace-nowrap text-gray-600">{k.satuan}</td>
                    <td className="px-4 py-3.5 sm:px-6 text-gray-500 max-w-[180px] sm:max-w-xs truncate">{k.deskripsi || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}