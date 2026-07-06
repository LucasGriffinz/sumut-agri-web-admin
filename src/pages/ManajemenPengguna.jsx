import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function ManajemenPengguna() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State Form Pendaftaran User Baru
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PETANI');
  const [kabupatenKota, setKabupatenKota] = useState('');

  // 🔑 STATE BARU UNTUK MODAL POP-UP RESET PASSWORD
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const token = localStorage.getItem('admin_token');

  const fetchUsers = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/`, {
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

      if (!res.ok) throw new Error('Gagal mengambil daftar pengguna dari database');

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [token, navigate]);

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.toLowerCase();

      const res = await fetch(`${API_BASE}/api/admin/users?role=${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
          nama_lengkap: namaLengkap,
          kabupaten_kota: kabupatenKota || null
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Gagal mendaftarkan pengguna baru');
      }

      setNamaLengkap('');
      setEmail('');
      setPassword('');
      setRole('PETANI');
      setKabupatenKota('');

      alert('Pengguna baru berhasil ditambahkan!');
      fetchUsers(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 FUNGSI BARU TEMPAT MELETAKKAN CODE FETCH RESET PASSWORD
  const handleExecuteResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setResetLoading(true);
    setError('');

    try {
      // CODE FETCH YANG ANDA MAKSUD DILETAKKAN DI SINI:
      const res = await fetch(`${API_BASE}/api/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Membawa token JWT Admin yang sedang login
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Gagal melakukan reset password');
      }

      alert(`Password untuk ${selectedUser.nama_lengkap} berhasil diubah!`);
      setShowModal(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-green-800">Manajemen Pengguna (Petani & Petugas)</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form Tambah Pengguna Baru oleh Admin */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">➕ Daftarkan Akun Pengguna Baru</h3>
        <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              required
              type="text"
              value={namaLengkap}
              onChange={e => setNamaLengkap(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="johndoe@sumutagri.id"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hak Akses (Role)</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
            >
              <option value="PETANI">PETANI</option>
              <option value="PETUGAS">PETUGAS</option>
              <option value="ADMIN">ADMIN (Urusan Internal)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten / Kota Operasional</label>
            <input
              type="text"
              value={kabupatenKota}
              onChange={e => setKabupatenKota(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Misal: Deli Serdang, Karo, Simalungun, dll. (Kosongkan jika Admin)"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2 rounded-lg transition duration-200 disabled:opacity-50 shadow"
            >
              {loading ? 'Mendaftarkan...' : 'Buat Akun'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Pengguna Terdaftar */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800">📋 Anggota & Staff Pengguna Terdaftar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kab/Kota</th>
                {/* 🔑 TAMBAHAN KOLOM AKSI PADA HEAD TABEL */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400 italic">
                    Belum ada data pengguna di database.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.nama_lengkap}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        u.role === 'PETUGAS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.kabupaten_kota || '-'}</td>
                    {/* 🔑 TAMBAHAN TOMBOL RESET DI SETIAP BARIS USER */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <button
                        onClick={() => { setSelectedUser(u); setShowModal(true); }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-3 py-1 rounded shadow-sm transition text-xs"
                      >
                        🔑 Reset Pwd
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔑 TAMBAHAN ELEMEN MODAL BOX POP-UP DI BAWAH HALAMAN */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🔄 Ubah Password Pengguna</h3>
            <p className="text-sm text-gray-500 mb-4">
              Anda akan mengganti password akun milik <strong className="text-green-700">{selectedUser.nama_lengkap}</strong> ({selectedUser.email}).
            </p>
            <form onSubmit={handleExecuteResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masukkan Password Baru</label>
                <input
                  required
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedUser(null); setNewPassword(''); }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg transition text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm"
                >
                  {resetLoading ? 'Menyimpan...' : 'Konfirmasi Ubah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}