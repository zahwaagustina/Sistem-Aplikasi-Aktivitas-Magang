import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, Clock, ArrowLeft, Building2, CalendarDays, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DetailLowongan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lowongan, setLowongan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/public/lowongan/${id}`);
        setLowongan(response.data.data);
      } catch (error) {
        console.error('Error fetching lowongan details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!lowongan) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lowongan tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Kembali ke Beranda</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      {/* Navigation Bar (Sederhana) */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Building2 className="h-7 w-7 text-indigo-700" />
              <span className="font-bold text-xl text-gray-900">InternHub</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-indigo-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Daftar Posisi
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-4">
                {lowongan.divisi}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{lowongan.posisi}</h1>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-gray-400" /> {lowongan.lokasi}</span>
                <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5 text-gray-400" /> Mode: {lowongan.mode_kerja}</span>
                <span className="flex items-center"><CalendarDays className="w-4 h-4 mr-1.5 text-gray-400" /> Kuota: {lowongan.kuota} Orang</span>
              </div>
            </div>
            <div>
              <button 
                onClick={() => {
                  if (user) {
                    navigate('/apply', { state: { lowonganId: lowongan.id } });
                  } else {
                    navigate('/register', { state: { lowonganId: lowongan.id } });
                  }
                }}
                className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 space-y-10">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Deskripsi Pekerjaan</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
              {lowongan.deskripsi}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Kualifikasi Kandidat</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
              {lowongan.kualifikasi}
            </p>
          </section>

          {lowongan.benefit && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Benefit Program</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {lowongan.benefit}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Informasi Program</h2>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Nama Batch</h4>
                  <p className="text-lg font-medium text-gray-900">{lowongan.program?.nama || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</h4>
                  <p className="text-lg font-medium text-green-600 flex items-center"><CheckCircle className="w-5 h-5 mr-1.5" /> Penerimaan Terbuka</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Tanggal Mulai Magang</h4>
                  <p className="text-lg font-medium text-gray-900">
                    {lowongan.program?.tanggal_mulai ? new Date(lowongan.program.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Tanggal Berakhir Magang</h4>
                  <p className="text-lg font-medium text-gray-900">
                    {lowongan.program?.tanggal_selesai ? new Date(lowongan.program.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DetailLowongan;
