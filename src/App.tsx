import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import POS from './pages/admin/POS';
import Kas from './pages/admin/Kas';
import Products from './pages/admin/Products';
import Settings from './pages/admin/Settings';
import { DataProvider } from './contexts/DataContext';

export default function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/pos" replace />} />
            <Route path="/admin/pos" element={<POS />} />
            <Route path="/admin/kas" element={<Kas />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}
