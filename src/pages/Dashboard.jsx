import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Dashboard() {
  const [komoditas, setKomoditas] = useState([]);
  const [hargaHarian, setHargaHarian] = useState([]);
  const [produksi, setProduksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Cek proteksi sesi login Admin
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 2. Suntikkan Header Authorization Bearer ke semua request
        const fetchOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Masuk melewati require_admin di backend
          }
        };

        const [resKomoditas, resHarga, resProduksi] = await Promise.all([
          fetch(`${API_BASE}/api/komoditas/`, fetchOptions),
          fetch(`${API_BASE}/api/harga/`, fetchOptions),
          fetch(`${API_BASE}/api/produksi/`, fetchOptions),
        ]);

        // Jika token kedaluwarsa atau ditolak database lokal
        if (resKomoditas.status === 401 || resHarga.status === 401 || resProduksi.status === 401) {
          localStorage.removeItem('admin_token');
          navigate('/login');
          throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
        }

        if (!resKomoditas.ok || !resHarga.ok || !resProduksi.ok) {
          throw new Error('Gagal mengambil data dari database lokal');
        }

        const dataKomoditas = await resKomoditas.json();
        const dataHarga = await resHarga.json();
        const dataProduksi = await resProduksi.json();

        setKomoditas(dataKomoditas);
        setHargaHarian(dataHarga);
        setProduksi(dataProduksi);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-lg animate-pulse">Memuat data dari PostgreSQL...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-green-800">Dashboard Admin</h1>

      {/* Kartu Statistik Sederhana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Komoditas</p>
          <p className="text-3xl font-bold text-green-700">{komoditas.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Data Harga Tersimpan</p>
          <p className="text-3xl font-bold text-blue-700">{hargaHarian.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Produksi Tercatat</p>
          <p className="text-3xl font-bold text-yellow-700">{produksi.length}</p>
        </div>
      </div>

      {/* Tabel Komoditas & Harga Terkini */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            📋 Daftar Komoditas & Harga Terkini
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komoditas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Terbaru</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Update</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {komoditas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">Belum ada data komoditas</td>
                </tr>
              )}
              {komoditas.map((k) => {
                const hargaTerbaru = hargaHarian
                  .filter((h) => h.id_komoditas === k.id)
                  .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))[0];
                return (
                  <tr key={k.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{k.nama_komoditas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{k.satuan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hargaTerbaru ? (
                        <span className="text-green-700 font-semibold">
                          Rp {hargaTerbaru.harga_per_satuan.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Belum ada harga</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{hargaTerbaru?.pasar_sumber || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {hargaTerbaru?.tanggal ? new Date(hargaTerbaru.tanggal).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Produksi Masuk */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            🌾 Produksi Terbaru Masuk
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Petani (ID)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komoditas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Panen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Panen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produksi.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">Belum ada data produksi</td>
                </tr>
              )}
              {produksi.map((p, index) => {
                const komoditasNama = komoditas.find((k) => k.id === p.id_komoditas)?.nama_komoditas || `ID: ${p.id_komoditas}`;
                return (
                  <tr key={p.id || index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-mono">#{p.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.id_petani}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{komoditasNama}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.jumlah_panen.toLocaleString('id-ID')} {komoditas.find((k) => k.id === p.id_komoditas)?.satuan || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(p.tanggal_panen).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{p.lokasi || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}