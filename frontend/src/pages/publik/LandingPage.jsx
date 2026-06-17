import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, Clock, ArrowRight, CalendarDays, Building2 } from 'lucide-react';

const LandingPage = () => {
  const [lowongan, setLowongan] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLowongan();
  }, []);

  const fetchLowongan = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/public/lowongan');
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
  const filters = ['Semua', 'Teknik', 'Bisnis', 'Riset'];

  const filteredLowongan = lowongan.filter(job => {
    if (activeFilter === 'Semua') return true;
    const div = (job.divisi || '').toLowerCase();
    if (activeFilter === 'Teknik') return div.includes('it') || div.includes('digital') || div.includes('data') || div.includes('software');
    if (activeFilter === 'Bisnis') return div.includes('keuangan') || div.includes('akuntansi') || div.includes('sdm') || div.includes('komunikasi') || div.includes('bisnis') || div.includes('pemasaran');
    if (activeFilter === 'Riset') return div.includes('riset') || div.includes('inovasi');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Building2 className="h-7 w-7 text-indigo-700" />
              <span className="font-bold text-xl text-gray-900">InternHub</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a href="#lowongan-section" className="text-gray-600 hover:text-gray-900 font-medium">Posisi tersedia</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Benefit</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Alur seleksi</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">FAQ</a>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block"
              >
                Masuk
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-white border border-gray-300 text-gray-900 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
              >
                Daftar sekarang
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <CalendarDays className="w-4 h-4" />
          Batch Juli 2025 · Pendaftaran dibuka
        </div>

        {/* Headlines */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
          Mulai karier impianmu lewat program magang kami
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Bergabunglah dengan ratusan mahasiswa terbaik yang mengembangkan diri bersama tim profesional PT Pandu Cipta Solusi.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm text-lg"
          >
            <ArrowRight className="w-5 h-5" />
            Daftar sekarang
          </button>
          <button 
            onClick={() => document.getElementById('lowongan-section').scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition shadow-sm text-lg"
          >
            Lihat posisi tersedia
          </button>
        </div>
      </div>

      {/* Lowongan Section */}
      <div id="lowongan-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-100">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">Posisi magang tersedia</h2>
        <p className="text-gray-600 text-center mb-6 text-lg max-w-2xl mx-auto">
          Pilih bidang yang sesuai minat dan jurusanmu. Semua posisi dibuka untuk Batch Juli 2025.
        </p>
        
        {/* Separator Line */}
        <div className="w-12 h-0.5 bg-indigo-600 mx-auto mb-8 rounded-full"></div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-lg font-medium border transition ${
                activeFilter === filter 
                  ? 'bg-gray-50 border-gray-300 text-gray-900' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredLowongan.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">Belum Ada Lowongan</h3>
            <p className="text-gray-500 mt-2">Saat ini belum ada posisi yang tersedia di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLowongan.map((job) => {
              const styles = getDivisiStyle(job.divisi);
              return (
                <div key={job.id} onClick={() => navigate(`/lowongan/${job.id}`)} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer group">
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${styles.iconBg}`}>
                      {styles.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{job.posisi}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {job.deskripsi}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-6 flex flex-wrap gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}>
                      {job.divisi}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                      {job.kuota} kuota
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
