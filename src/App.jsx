import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import ManajemenPengguna from './pages/ManajemenPengguna';
import ManajemenKomoditas from './pages/ManajemenKomoditas';
import ManajemenHarga from './pages/ManajemenHarga';
import ManajemenProduksi from './pages/ManajemenProduksi';
import Layout from './components/Layout';


// Komponen Tambahan: Memaksa layar HP/Laptop otomatis scroll ke atas saat pindah halaman
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// 1. Komponen Pelindung (ProtectedRoute)
const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  
  // Jika tidak ada token, paksa user kembali ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Jika token ada, loloskan untuk merender komponen anak (Layout & isinya)
  return <Outlet />;
};

function App() {
  return (
    <Router>
      {/* Pasang ScrollToTop di dalam Router agar berjalan di setiap perpindahan halaman */}
      <ScrollToTop />
      
      <Routes>
        {/* Jalur Publik: Siapapun bisa mengakses halaman Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Jalur Terproteksi: Dibungkus ProtectedRoute untuk deteksi database lokal/cloud */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pengguna" element={<ManajemenPengguna />} />
            <Route path="/komoditas" element={<ManajemenKomoditas />} />
            <Route path="/harga" element={<ManajemenHarga />} /> {/* 🌟 INI TAMBAHAN BARU */}
            <Route path="/produksi" element={<ManajemenProduksi />} />  
          </Route>
        </Route>

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pengguna" element={<ManajemenPengguna />} />
          <Route path="/komoditas" element={<ManajemenKomoditas />} />
          <Route path="/harga" element={<ManajemenHarga />} /> {/* 🌟 INI TAMBAHAN BARU */}
          <Route path="/produksi" element={<ManajemenProduksi />} />
        </Route>
        
        {/* Jalur Fallback: Jika URL acak/tidak ditemukan, alihkan otomatis */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;