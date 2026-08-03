import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function ManajemenProduksi() {
  const [produksi, setProduksi] = useState([]);
  const [komoditas, setKomoditas] = useState([]);
  const [users, setUsers] = useState([]); // 🌟 State baru untuk menyimpan data Petani
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
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

      // 🌟 Fetch Produksi, Komoditas, DAN Users secara bersamaan
      const [resProduksi, resKomoditas, resUsers] = await Promise.all([
        fetch(`${API_BASE}/api/produksi/`, fetchOptions),
        fetch(`${API_BASE}/api/komoditas/`, fetchOptions),
        fetch(`${API_BASE}/api/users/`, fetchOptions)
      ]);

      if (resProduksi.status === 401 || resKomoditas.status === 401 || resUsers.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }

      if (!resProduksi.ok || !resKomoditas.ok || !resUsers.ok) {
        throw new Error('Gagal memuat data dari database');
      }

      const dataProduksi = await resProduksi.json();
      const dataKomoditas = await resKomoditas.json();
      const dataUsers = await resUsers.json();
      
      // Urutkan dari yang terbaru
      setProduksi(dataProduksi.sort((a, b) => b.id - a.id));
      setKomoditas(dataKomoditas);
      setUsers(dataUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  // Fungsi untuk eksekusi Verifikasi (Setujui / Tolak)
  const handleVerifikasi = async (id, statusAksi) => {
    if (!window.confirm(`Yakin ingin mengubah status panen ini menjadi ${statusAksi.toUpperCase()}?`)) return;
    
    setActionLoading(id);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/produksi/${id}/verifikasi`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusAksi })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || `Gagal memproses verifikasi`);
      }

      fetchData(); // Refresh data setelah berhasil
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 🌟 Helper untuk mendapatkan NAMA PETANI dari array users
  const getNamaPetani = (idPetani) => {
    const user = users.find(u => u.id === idPetani);
    return user ? user.nama_lengkap : `ID: ${idPetani}`;
  };

  const getNamaKomoditas = (idKomoditas) => {
    const kmd = komoditas.find(k => k.id === idKomoditas);
    return kmd ? `${kmd.nama_komoditas} (${kmd.satuan})` : `ID: ${idKomoditas}`;
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'disetujui') return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">DISETUJUI</span>;
    if (s === 'ditolak') return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">DITOLAK</span>;
    return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">PENDING</span>;
  };

  // ================= 🌟 FITUR EXPORT LAPORAN =================
  const exportPDF = () => {
    const doc = new jsPDF('landscape'); // Menggunakan format landscape agar kolom cukup
    doc.text("Laporan Data Panen (Sumut Agri)", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableColumn = ["ID", "Nama Petani", "Komoditas", "Jumlah Panen", "Tgl Panen", "Lokasi", "Status"];
    const tableRows = produksi.map(p => [
      `#${p.id}`,
      getNamaPetani(p.id_petani),
      getNamaKomoditas(p.id_komoditas),
      `${p.jumlah_panen} (Luas: ${p.luas_lahan || '-'} Ha)`,
      new Date(p.tanggal_panen).toLocaleDateString('id-ID'),
      p.lokasi || '-',
      (p.status || 'pending').toUpperCase()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50] } // Hijau Tema
    });
    doc.save("Laporan_Data_Panen.pdf");
  };

  const exportExcel = () => {
    const excelData = produksi.map(p => ({
      "ID Panen": p.id,
      "Nama Petani": getNamaPetani(p.id_petani),
      "Komoditas": getNamaKomoditas(p.id_komoditas),
      "Jumlah Panen": p.jumlah_panen,
      "Luas Lahan (Ha)": p.luas_lahan || '-',
      "Tanggal Panen": new Date(p.tanggal_panen).toLocaleDateString('id-ID'),
      "Lokasi Wilayah": p.lokasi || '-',
      "Status Verifikasi": (p.status || 'pending').toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Panen");
    XLSX.writeFile(workbook, "Laporan_Data_Panen.xlsx");
  };

  if (loading) {
    return <div className="text-gray-500 animate-pulse text-center mt-10">Memuat data produksi...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 🌟 BARIS JUDUL & TOMBOL EXPORT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-green-800 tracking-tight">Verifikasi & Laporan Panen</h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={exportExcel} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition">
            📊 Export Excel
          </button>
          <button onClick={exportPDF} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition">
            📄 Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabel Produksi */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div className="overflow-x-auto subpixel-antialiased">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Komoditas & Jumlah</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Tanggal & Petani</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Lokasi / Wilayah</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500 uppercase tracking-wider">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {produksi.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">
                    Belum ada data pencatatan panen.
                  </td>
                </tr>
              ) : (
                produksi.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-500 font-mono text-xs">#{p.id}</td>
                    
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{getNamaKomoditas(p.id_komoditas)}</div>
                      <div className="text-gray-500 text-xs mt-0.5">Total: <span className="font-medium">{p.jumlah_panen}</span> | Luas: {p.luas_lahan || '-'} Ha</div>
                    </td>
                    
                    {/* 🌟 NAMA PETANI MUNCUL DI SINI */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-gray-900">{new Date(p.tanggal_panen).toLocaleDateString('id-ID')}</div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        Petani: <span className="font-semibold text-green-700">{getNamaPetani(p.id_petani)}</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3.5 text-gray-600 text-xs max-w-[200px] truncate" title={p.lokasi}>
                      {p.lokasi || '-'}
                    </td>
                    
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      {getStatusBadge(p.status)}
                    </td>
                    
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      {p.status?.toLowerCase() === 'pending' ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleVerifikasi(p.id, 'disetujui')}
                            disabled={actionLoading === p.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow-sm text-xs font-semibold disabled:opacity-50 transition"
                          >
                            {actionLoading === p.id ? '...' : 'Setujui'}
                          </button>
                          <button
                            onClick={() => handleVerifikasi(p.id, 'ditolak')}
                            disabled={actionLoading === p.id}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded shadow-sm text-xs font-semibold disabled:opacity-50 transition"
                          >
                            {actionLoading === p.id ? '...' : 'Tolak'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Selesai</span>
                      )}
                    </td>
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