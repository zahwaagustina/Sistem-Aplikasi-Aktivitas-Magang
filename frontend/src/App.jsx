import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logbook from './pages/Logbook';
import Profile from './pages/Profile';

import UserManagement from './pages/admin/UserManagement';
import MonitorMagang from './pages/MonitorMagang';

// Placeholder Pages
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-[70vh] border-2 border-dashed border-gray-300 rounded-xl bg-white">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
      <p className="text-gray-500 mt-2">Halaman ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/settings" element={<PlaceholderPage title="Pengaturan Sistem" />} />
            </Route>

            {/* Pembimbing Routes */}
            <Route element={<ProtectedRoute allowedRoles={['PEMBIMBING']} />}>
              <Route path="/pembimbing/monitor" element={<MonitorMagang />} />
            </Route>

            {/* Magang Routes */}
            <Route element={<ProtectedRoute allowedRoles={['MAGANG']} />}>
              <Route path="/magang/logbook" element={<Logbook />} />
              <Route path="/magang/profil" element={<Profile />} />
            </Route>

            {/* Fallback */}
            <Route path="/unauthorized" element={
              <div className="flex flex-col items-center justify-center h-[70vh]">
                <h1 className="text-4xl font-bold text-red-500 mb-4">403 - Akses Ditolak</h1>
                <p className="text-gray-600">Anda tidak memiliki izin untuk melihat halaman ini.</p>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
