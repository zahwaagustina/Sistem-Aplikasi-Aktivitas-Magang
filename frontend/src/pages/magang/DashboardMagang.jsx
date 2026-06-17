import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, CalendarCheck, CheckSquare, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardMagang = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Halo, {user?.nama}! 👋</h1>
          <p className="text-gray-500 mt-1">Selamat datang di Dashboard Operasional Magang Anda.</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
          <p className="text-sm font-semibold text-indigo-800">Posisi: IT Development</p>
          <p className="text-xs text-indigo-600">Mentor: Budi (Mentor IT)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Absensi Hari Ini</h3>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <Link to="/magang/absensi" className="text-sm font-bold text-blue-600 hover:text-blue-800">
            Check-In Sekarang &rarr;
          </Link>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Logbook Harian</h3>
            <div className="p-3 bg-green-50 rounded-lg">
              <ClipboardList className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <Link to="/magang/logbook" className="text-sm font-bold text-green-600 hover:text-green-800">
            Isi Kegiatan Hari Ini &rarr;
          </Link>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Tugas Baru</h3>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CheckSquare className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <Link to="/magang/tugas" className="text-sm font-bold text-purple-600 hover:text-purple-800">
            Cek Papan Kanban &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pengumuman */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <CalendarCheck className="w-5 h-5 mr-2 text-indigo-500" />
            Pengumuman & Agenda
          </h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">Evaluasi Tengah Magang</p>
              <p className="text-xs text-gray-500 mt-1">Dijadwalkan pada 15 Juli 2026 bersama Mentor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMagang;
