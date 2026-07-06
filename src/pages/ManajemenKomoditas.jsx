import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://127.0.0.1:8000';

export default function ManajemenKomoditas() {
  const [komoditas, setKomoditas] = useState([]);
  const [nama, setNama] = useState('');
  const [satuan, setSatuan] = useState('kg');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Ambil token dari localStorage
  const token = localStorage.getItem('admin_token');

  const fetchData = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/komoditas/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Masuk melewati satpam API
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
    // Jalankan Route Guard: Jika tidak ada token, tendang kembali ke login
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/komoditas/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Autentikasi role tertinggi (ADMIN)
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

      // Reset Form Inputs jika sukses
      setNama('');
      setSatuan('kg');
      setDeskripsi('');
      
      // Refresh daftar tabel dengan data baru dari PostgreSQL lokal
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-800">Manajemen Jenis Komoditas</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form Input Komoditas Baru */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            required
            type="text"
            value={nama}
            onChange={e => setNama(e.target.value)}
            placeholder="Nama komoditas (misal: Cabai Merah)"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="w-24">
          <input
            required
            type="text"
            value={satuan}
            onChange={e => setSatuan(e.target.value)}
            placeholder="Satuan"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
          />
        </div>
        <div className="flex-[2] min-w-[250px]">
          <input
            type="text"
            value={deskripsi}
            onChange={e => setDeskripsi(e.target.value)}
            placeholder="Deskripsi opsional komoditas..."
            className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-800 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Tambah'}
        </button>
      </form>

      {/* Tabel Tampilan Data dari PostgreSQL */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Komoditas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan Kerja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi Tambahan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {komoditas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-400 italic">
                    Belum ada jenis komoditas terdaftar di database lokal.
                  </td>
                </tr>
              ) : (
                komoditas.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{k.nama_komoditas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{k.satuan}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{k.deskripsi || '-'}</td>
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