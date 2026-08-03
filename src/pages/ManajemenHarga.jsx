import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function ManajemenHarga() {
  const [komoditasList, setKomoditasList] = useState([]);
  const [hargaList, setHargaList] = useState([]);
  
  // State Form
  const [idKomoditas, setIdKomoditas] = useState('');
  const [harga, setHarga] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [pasarSumber, setPasarSumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');

  const fetchData = async () => {
    if (!token) return;
    try {
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // Fetch Komoditas & Harga bersamaan
      const [resKomoditas, resHarga] = await Promise.all([
        fetch(`${API_BASE}/api/komoditas/`, fetchOptions),
        fetch(`${API_BASE}/api/harga/`, fetchOptions)
      ]);

      if (resKomoditas.status === 401 || resHarga.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }

      if (!resKomoditas.ok || !resHarga.ok) throw new Error('Gagal memuat data dari database');

      const dataKomoditas = await resKomoditas.json();
      const dataHarga = await resHarga.json();
      
      setKomoditasList(dataKomoditas);
      setHargaList(dataHarga);
      
      // Set default komoditas terpilih jika data ada
      if (dataKomoditas.length > 0 && !idKomoditas) {
        setIdKomoditas(dataKomoditas[0].id);
      }
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
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/harga/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id_komoditas: parseInt(idKomoditas), 
          harga_per_satuan: parseFloat(harga), 
          tanggal: tanggal,
          pasar_sumber: pasarSumber 
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Gagal menambahkan data harga');
      }

      setHarga('');
      setPasarSumber('');
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-green-800 tracking-tight">Manajemen Harga Harian Komoditas</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs sm:text-sm mt-4">
          {error}
        </div>
      )}

      {/* Form Tambah Harga */}
      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-5 rounded-xl shadow grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        <div className="sm:col-span-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Komoditas</label>
          <select
            required
            value={idKomoditas}
            onChange={e => setIdKomoditas(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm bg-gray-50/30"
          >
            <option value="" disabled>Pilih Komoditas</option>
            {komoditasList.map(k => (
              <option key={k.id} value={k.id}>{k.nama_komoditas} ({k.satuan})</option>
            ))}
          </select>
        </div>
        
        <div className="sm:col-span-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Harga (Rp)</label>
          <input
            required
            type="number"
            value={harga}
            onChange={e => setHarga(e.target.value)}
            placeholder="Misal: 15000"
            className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm bg-gray-50/30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal</label>
          <input
            required
            type="date"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm bg-gray-50/30"
          />
        </div>
        
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pasar / Sumber</label>
          <input
            type="text"
            value={pasarSumber}
            onChange={e => setPasarSumber(e.target.value)}
            placeholder="Misal: Pasar Induk"
            className="w-full border border-gray-300 px-3 py-2.5 sm:py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-base sm:text-sm bg-gray-50/30"
          />
        </div>
        
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-semibold py-2.5 sm:py-2 px-5 rounded-lg hover:bg-green-800 transition duration-200 disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? 'Menyimpan...' : 'Catat Harga'}
          </button>
        </div>
      </form>

      {/* Tabel Riwayat Harga */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto subpixel-antialiased">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Komoditas</th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-4 py-3 sm:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sumber/Pasar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hargaList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 sm:px-6 text-center text-gray-400 italic">
                    Belum ada data harga harian.
                  </td>
                </tr>
              ) : (
                hargaList.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)).map(h => {
                  const komoditas = komoditasList.find(k => k.id === h.id_komoditas);
                  return (
                    <tr key={h.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3.5 sm:px-6 whitespace-nowrap text-gray-600">
                        {new Date(h.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 sm:px-6 whitespace-nowrap font-medium text-gray-900">
                        {komoditas ? `${komoditas.nama_komoditas} (${komoditas.satuan})` : `ID: ${h.id_komoditas}`}
                      </td>
                      <td className="px-4 py-3.5 sm:px-6 whitespace-nowrap text-green-700 font-semibold">
                        Rp {h.harga_per_satuan.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 sm:px-6 text-gray-500">
                        {h.pasar_sumber || '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}