import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, CalendarCheck, CheckSquare, ClipboardList, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';

const DashboardMagang = () => {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [absensiToday, setAbsensiToday] = useState(null);
  const [logbookToday, setLogbookToday] = useState(null);

  React.useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        const res = await api.get('/onboarding/my');
        if (res.data?.data?.onboarding) {
          setOnboarding(res.data.data.onboarding);
        }
      } catch (err) {
        console.error('Failed to fetch onboarding:', err);
      }
    };

    const fetchStatusHariIni = async () => {
      try {
        const [absensiRes, logbookRes] = await Promise.all([
          api.get('/magang/absensi'),
          api.get('/magang/logbook')
        ]);
        
        const isToday = (dateString) => {
          if (!dateString) return false;
          const d = new Date(dateString);
          const today = new Date();
          return d.getDate() === today.getDate() &&
                 d.getMonth() === today.getMonth() &&
                 d.getFullYear() === today.getFullYear();
        };
        
        const absensi = absensiRes.data?.data?.find(a => isToday(a.tanggal));
        setAbsensiToday(absensi || null);
        
        const logbook = logbookRes.data?.data?.find(l => isToday(l.tanggal));
        setLogbookToday(logbook || null);
        
      } catch (err) {
        console.error('Failed to fetch status hari ini:', err);
      }
    };

    fetchOnboarding();
    fetchStatusHariIni();
  }, []);
  
  const sisaHari = () => {
    if (!user?.tanggal_selesai) return '?';
    const end = new Date(user.tanggal_selesai);
    const now = new Date();
    
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    if (end <= now) return 0;
    
    let count = 0;
    let cur = new Date(now);
    
    while (cur < end) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
    }
    return count;
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Glassmorphism Header */}
      <div className="bg-white/40 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Halo, {user?.nama}! 👋</h1>
          <p className="text-slate-600 text-lg">Selamat datang di Ruang Kerja Magang Anda.</p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          {(!absensiToday) && (
            <div className="px-5 py-3 bg-red-50/80 backdrop-blur-md rounded-2xl border border-red-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-900">Belum Check-In</p>
                <p className="text-xs font-medium text-red-700">Jangan lupa catat kehadiran hari ini.</p>
              </div>
            </div>
          )}
          
          {(absensiToday && !absensiToday.waktu_keluar) && (
            <div className="px-5 py-3 bg-amber-50/80 backdrop-blur-md rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Belum Check-Out</p>
                <p className="text-xs font-medium text-amber-700">Pastikan check-out sebelum pulang.</p>
              </div>
            </div>
          )}

          {(!logbookToday) && (
            <div className="px-5 py-3 bg-blue-50/80 backdrop-blur-md rounded-2xl border border-blue-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">Logbook Kosong</p>
                <p className="text-xs font-medium text-blue-700">Yuk isi aktivitas harianmu.</p>
              </div>
            </div>
          )}

          {(absensiToday && absensiToday.waktu_keluar && logbookToday) && (
            <div className="px-5 py-3 bg-emerald-50/80 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Semua Selesai!</p>
                <p className="text-xs font-medium text-emerald-700">Kerja bagus hari ini! ✨</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Absensi */}
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Absensi</h3>
            <div className="p-3.5 bg-blue-100 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-8 flex-1">Jangan lupa catat kehadiran Anda hari ini sebelum mulai bekerja.</p>
          <Link to="/magang/absensi" className="inline-flex items-center justify-between w-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl transition-colors shadow-sm">
            Check-In Sekarang <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Logbook */}
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Logbook</h3>
            <div className="p-3.5 bg-green-100 rounded-2xl group-hover:scale-110 transition-transform">
              <ClipboardList className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-8 flex-1">Tulis aktivitas harian dan pelajaran yang Anda dapatkan hari ini.</p>
          <Link to="/magang/logbook" className="inline-flex items-center justify-between w-full text-sm font-bold text-white bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl transition-colors shadow-sm">
            Isi Jurnal Harian <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Tugas */}
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Tugas</h3>
            <div className="p-3.5 bg-purple-100 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-8 flex-1">Lihat pekerjaan yang ditugaskan mentor dan perbarui progressnya.</p>
          <Link to="/magang/tugas" className="inline-flex items-center justify-between w-full text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl transition-colors shadow-sm">
            Buka Papan Kanban <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default DashboardMagang;
