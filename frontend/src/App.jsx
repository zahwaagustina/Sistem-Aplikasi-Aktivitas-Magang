import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/publik/LandingPage';
import RegisterKandidat from './pages/publik/RegisterKandidat';
import Login from './pages/Login';
import DetailLowongan from './pages/publik/DetailLowongan';

// Admin / HR Pages
import Dashboard from './pages/Dashboard';
import ManajemenLowongan from './pages/admin/ManajemenLowongan';
import ManajemenKandidat from './pages/admin/ManajemenKandidat';
import OnboardingDashboard from './pages/admin/OnboardingDashboard';
import ProfilPeserta from './pages/admin/ProfilPeserta';
import UserManagement from './pages/admin/UserManagement';

// Kandidat Pages
import DashboardKandidat from './pages/kandidat/DashboardKandidat';
import PilihPosisi from './pages/kandidat/PilihPosisi';
import ApplyLowongan from './pages/publik/ApplyLowongan';

// Magang Pages (Fase 4)
import DashboardMagang from './pages/magang/DashboardMagang';
import Absensi from './pages/magang/Absensi';
import Logbook from './pages/magang/Logbook';
import TaskBoard from './pages/magang/TaskBoard';
import PenyelesaianProgram from './pages/magang/PenyelesaianProgram';

// Other Pages
import Profile from './pages/Profile';
import MonitorMagang from './pages/mentor/MonitorMagang';
import ProfilAnakMagang from './pages/mentor/ProfilAnakMagang';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/lowongan/:id" element={<DetailLowongan />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterKandidat />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

        {/* Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* KANDIDAT Routes */}
            <Route element={<ProtectedRoute allowedRoles={['KANDIDAT']} />}>
              <Route path="/apply" element={<ApplyLowongan />} />
              <Route path="/kandidat/pilih-posisi" element={<PilihPosisi />} />
              <Route path="/kandidat/dashboard" element={<DashboardKandidat />} />
            </Route>

            {/* HR_ADMIN & SUPER_ADMIN Routes */}
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_ADMIN']} />}>
              <Route path="/hr/lowongan" element={<ManajemenLowongan />} />
              <Route path="/hr/kandidat" element={<ManajemenKandidat />} />
              <Route path="/hr/onboarding" element={<OnboardingDashboard />} />
              <Route path="/hr/peserta" element={<ProfilPeserta />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>

            {/* MENTOR / PEMBIMBING Routes */}
            <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'SUPER_ADMIN']} />}>
              <Route path="/mentor/monitor" element={<MonitorMagang />} />
              <Route path="/mentor/profil-magang" element={<ProfilAnakMagang />} />
            </Route>

            {/* MAGANG Routes */}
            <Route element={<ProtectedRoute allowedRoles={['MAGANG']} />}>
              <Route path="/magang/dashboard" element={<DashboardMagang />} />
              <Route path="/magang/absensi" element={<Absensi />} />
              <Route path="/magang/logbook" element={<Logbook />} />
              <Route path="/magang/tugas" element={<TaskBoard />} />
              <Route path="/magang/penyelesaian" element={<PenyelesaianProgram />} />
              <Route path="/magang/profil" element={<Profile />} />
            </Route>

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
