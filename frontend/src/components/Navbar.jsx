import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, UserCircle, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const res = await api.get('/notifikasi');
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error("Gagal memuat notifikasi", err);
      }
    };
    if (user) {
      fetchNotif();
      const interval = setInterval(fetchNotif, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const executeLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const handleRead = async (id, link) => {
    try {
      await api.put(`/notifikasi/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setIsDropdownOpen(false);
      if (link) navigate(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      await api.put('/notifikasi/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationLink = (n) => {
    if (n.link) return n.link;
    const j = n.judul.toLowerCase();
    const userRole = user?.role?.toUpperCase() || '';

    // Rute untuk Admin / HR
    if (userRole === 'SUPER_ADMIN') {
      if (j.includes('onboarding') || j.includes('dokumen')) return '/hr/onboarding';
      if (j.includes('pelamar') || j.includes('kandidat')) return '/hr/kandidat';
      return null;
    }

    // Rute untuk Mentor
    if (userRole === 'MENTOR') {
      if (j.includes('tugas') || j.includes('logbook') || j.includes('laporan') || j.includes('evaluasi')) return '/mentor/monitor';
      return null;
    }

    // Rute untuk Peserta Magang
    if (userRole === 'MAGANG') {
      if (j.includes('tugas') || j.includes('hasil review tugas')) return '/magang/tugas';
      if (j.includes('logbook')) return '/magang/logbook';
      if (j.includes('evaluasi') || j.includes('sertifikat') || j.includes('laporan akhir')) return '/magang/penyelesaian';
      if (j.includes('absensi')) return '/magang/absensi';
      return null;
    }

    // Rute untuk Kandidat
    if (userRole === 'KANDIDAT') {
      if (j.includes('interview')) return '/kandidat/interview';
      if (j.includes('onboarding') || j.includes('diterima') || j.includes('revisi')) return '/kandidat/onboarding';
      return null;
    }

    return null;
  };

  return (
    <>
    <header className="h-16 bg-white/40 backdrop-blur-xl border-b border-white/50 shadow-sm flex items-center justify-between px-4 lg:px-8 z-50 relative">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center text-sm font-medium text-gray-600 bg-gray-50/80 px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
          {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-indigo-600 font-bold font-mono">{currentTime.toLocaleTimeString('id-ID')}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-2 rounded-xl transition-all ${isDropdownOpen ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white min-w-[18px] text-center shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button onClick={handleReadAll} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                    <CheckCircle2 size={14} className="mr-1" /> Tandai semua dibaca
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                    <Bell size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm">Belum ada notifikasi</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleRead(n.id, getNotificationLink(n))}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-indigo-50/50 transition-colors flex items-start gap-3 ${n.is_read ? 'opacity-70' : 'bg-blue-50/30'}`}
                    >
                      <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.is_read ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                      <div>
                        <h4 className={`text-sm ${n.is_read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{n.judul}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.pesan}</p>
                        <p className="text-[10px] text-gray-400 mt-2">
                          {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700">{user?.role === 'SUPER_ADMIN' ? 'Admin' : (user?.nama || user?.username?.replace(/\.(magang|pembimbing|admin)$/i, '') || 'User')}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role === 'SUPER_ADMIN' ? 'Administrator' : user?.role?.replace('_', ' ')}</p>
          </div>
          <UserCircle size={32} className="text-indigo-600" />
        </div>

        <button 
          onClick={handleLogoutClick}
          className="ml-2 sm:ml-4 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center space-x-1"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline text-sm font-bold">Logout</span>
        </button>
      </div>
    </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="w-8 h-8 text-red-600 ml-1" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Keluar</h3>
              <p className="text-gray-500 text-sm">
                Apakah Anda yakin ingin keluar dari aplikasi? Anda harus login kembali untuk masuk.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2 rounded-xl font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 transition-colors w-full"
              >
                Batal
              </button>
              <button
                onClick={executeLogout}
                className="px-5 py-2 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm w-full"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
