import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import ManajemenPengguna from './pages/ManajemenPengguna';
import ManajemenKomoditas from './pages/ManajemenKomoditas';
import Layout from './components/Layout';

// 1. Komponen Pelindung (ProtectedRoute)
// Berfungsi sebagai satpam jalur navigasi di level Frontend React
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
      <Routes>
        {/* Jalur Publik: Siapapun bisa mengakses halaman Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Jalur Terproteksi: Dibungkus ProtectedRoute untuk deteksi database lokal/cloud */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pengguna" element={<ManajemenPengguna />} />
            <Route path="/komoditas" element={<ManajemenKomoditas />} />
          </Route>
        </Route>
        
        {/* Jalur Fallback: Jika URL acak/tidak ditemukan, alihkan otomatis */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;