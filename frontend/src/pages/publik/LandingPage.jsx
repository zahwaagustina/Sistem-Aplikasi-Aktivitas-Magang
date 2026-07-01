import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, Clock, ArrowRight, CalendarDays, Building2, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const [lowongan, setLowongan] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    fetchLowongan();
  }, []);

  useEffect(() => {
    if (!loading && hash === '#lowongan-section') {
      const element = document.getElementById('lowongan-section');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash, loading]);

  useEffect(() => {
    if (user && user.role === 'KANDIDAT') {
      const pendingLowonganId = localStorage.getItem('pendingApplyLowonganId');
      if (pendingLowonganId) {
        localStorage.removeItem('pendingApplyLowonganId');
        navigate('/apply', { state: { lowonganId: parseInt(pendingLowonganId, 10) } });
      }
    }
  }, [user, navigate]);

  const fetchLowongan = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/public/lowongan`);
      setLowongan(response.data.data);
    } catch (error) {
      console.error('Error fetching lowongan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi helper untuk menentukan warna dan ikon berdasarkan divisi
  const getDivisiStyle = (divisi) => {
    const div = (divisi || '').toLowerCase();
    if (div.includes('it') || div.includes('digital') || div.includes('software')) {
      return { bg: 'bg-purple-100', text: 'text-purple-700', iconBg: 'bg-purple-50', icon: <div className="w-5 h-5 font-bold flex items-center justify-center text-purple-700">&lt;/&gt;</div> };
    }
    if (div.includes('data') || div.includes('analyst')) {
      return { bg: 'bg-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-50', icon: <div className="w-5 h-5 flex items-center justify-center text-blue-700">☍</div> }; // Placeholder icon
    }
    if (div.includes('keuangan') || div.includes('akuntansi') || div.includes('finance')) {
      return { bg: 'bg-orange-100', text: 'text-orange-700', iconBg: 'bg-orange-50', icon: <Briefcase className="w-5 h-5 text-orange-700" /> };
    }
    if (div.includes('sdm') || div.includes('hr') || div.includes('rekrutmen')) {
      return { bg: 'bg-pink-100', text: 'text-pink-700', iconBg: 'bg-pink-50', icon: <div className="w-5 h-5 flex items-center justify-center text-pink-700">👥</div> };
    }
    if (div.includes('riset') || div.includes('inovasi') || div.includes('research')) {
      return { bg: 'bg-green-100', text: 'text-green-700', iconBg: 'bg-green-50', icon: <div className="w-5 h-5 flex items-center justify-center text-green-700">🔬</div> };
    }
    if (div.includes('komunikasi') || div.includes('pemasaran') || div.includes('marketing')) {
      return { bg: 'bg-red-100', text: 'text-red-700', iconBg: 'bg-red-50', icon: <div className="w-5 h-5 flex items-center justify-center text-red-700">📢</div> };
    }
    return { bg: 'bg-indigo-100', text: 'text-indigo-700', iconBg: 'bg-indigo-50', icon: <Briefcase className="w-5 h-5 text-indigo-700" /> };
  };

  const [activeFilter, setActiveFilter] = useState('Semua');

  // Generate dynamic filters based on available divisi
  const availableDivisi = [...new Set(lowongan.map(job => job.divisi))].slice(0, 5); // Limit to 5 filters max for UI
  const filters = ['Semua', ...availableDivisi];

  const filteredLowongan = lowongan.filter(job => {
    if (activeFilter === 'Semua') return true;
    return job.divisi === activeFilter;
  });

  // Get active program name
  const activeProgramName = lowongan.length > 0 ? lowongan[0].program?.nama : 'Program Magang Terkini';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 font-sans">
      {/* Background Glows (Synthesia style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>
        
      {/* Animated Bubbles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
        <div className="bubble bubble-6"></div>
        <div className="bubble bubble-7"></div>
        <div className="bubble bubble-8"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/40 backdrop-blur-lg border-b border-white/30 py-2 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo pcs.png.png" alt="Logo PCS" className="h-8 w-auto object-contain" />
              <span className="font-extrabold text-xl tracking-tight text-slate-900">PCS Internship Portal</span>
            </div>

            {/* Desktop Menu removed as per user request */}

            {/* CTA Button */}
            <div className="flex items-center gap-6">
              {user ? (
                <div 
                  onClick={() => navigate(user.role === 'KANDIDAT' ? '/kandidat/dashboard' : '/dashboard')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 px-4 py-2 rounded-full transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-tight">{user?.role === 'SUPER_ADMIN' ? 'Admin' : (user?.nama || user?.username?.replace(/\.(magang|pembimbing|admin)$/i, '') || 'User')}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role === 'SUPER_ADMIN' ? 'Administrator' : user?.role?.replace('_', ' ')}</p>
                  </div>
                  <UserCircle className="w-8 h-8 text-blue-600" />
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:block transition-colors"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:from-blue-700 hover:to-cyan-500 transition shadow-sm flex items-center gap-2"
                  >
                    Get started <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 flex flex-col xl:flex-row items-center justify-between min-h-[60vh]">
        
        {/* Left Content (Text & Buttons) */}
        <div className="relative z-10 max-w-2xl text-left px-4 sm:px-8 lg:px-12 xl:pl-16 xl:pr-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white shadow-md text-slate-900 px-5 py-2 rounded-full text-sm font-medium mb-10">
            <CalendarDays className="w-4 h-4" />
            {lowongan && lowongan.length > 0 ? "Pendaftaran dibuka" : "Lowongan belum tersedia"}
          </div>

          {/* Headlines */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
            Selamat datang di<br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">PCS Internship Portal</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mb-12 leading-relaxed">
            Bangun pengalaman kerja profesional bersama tim terbaik kami di <span className="whitespace-nowrap">PT Pandu Cipta Solusi</span>.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-start gap-4 mb-4">
            {user ? (
              <button 
                onClick={() => navigate(user.role === 'KANDIDAT' ? '/kandidat/dashboard' : '/dashboard')}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white px-6 py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-cyan-500 transition shadow-sm text-lg"
              >
                <ArrowRight className="w-5 h-5" />
                Ke Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-800 px-6 py-3.5 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition shadow-sm text-lg"
              >
                <ArrowRight className="w-5 h-5" />
                Daftar sekarang
              </button>
            )}
            <button 
              onClick={() => document.getElementById('lowongan-section').scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-800 px-6 py-3.5 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition shadow-sm text-lg"
            >
              Lihat posisi tersedia
            </button>
          </div>
        </div>

        {/* Right Image (Hidden on mobile, now part of flex layout) */}
        <div className="hidden xl:block w-[400px] opacity-90 hover:opacity-100 transition-opacity duration-300">
          <img src="/hero-right.png.png" alt="Illustration" className="w-full object-contain drop-shadow-2xl hover:-translate-y-2 transition-transform duration-300" />
        </div>
      </div>

      {/* Lowongan Section */}
      <div id="lowongan-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Posisi magang tersedia</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Pilih bidang yang sesuai minat dan jurusanmu. Semua posisi dibuka untuk {activeProgramName}.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                activeFilter === filter 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLowongan.length === 0 ? (
          <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Belum Ada Lowongan</h3>
            <p className="text-slate-500 mt-2">Saat ini belum ada posisi yang tersedia di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLowongan.map((job) => {
              const styles = getDivisiStyle(job.divisi);
              return (
                <div key={job.id} onClick={() => navigate(`/lowongan/${job.id}`)} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group">
                  <div className="mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${styles.iconBg} group-hover:scale-110 transition-transform`}>
                      {styles.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight">{job.posisi}</h3>
                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                      {job.deskripsi}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-6 flex flex-wrap gap-2 border-t border-slate-50">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${styles.bg} ${styles.text}`}>
                      {job.divisi.toUpperCase()}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-600">
                      {job.kuota} KUOTA
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
