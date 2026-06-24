import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Calendar, CheckCircle, Clock, Video, AlertCircle, ArrowRight, Zap, FileText, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const DashboardKandidat = () => {
  const { user, updateUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/kandidat/applications').catch(() => ({ data: { data: [] } }));
        setApplications(res.data?.data || []);

        const resOnb = await api.get('/onboarding/my').catch(() => ({ data: { data: null } }));
        setOnboarding(resOnb.data?.data || null);

        // Auto-update local role if backend upgraded them to MAGANG
        const currentDbRole = resOnb.data?.data?.pendaftaran?.user?.role;
        if (currentDbRole === 'MAGANG' && user?.role !== 'MAGANG') {
          updateUser({ role: 'MAGANG' });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'DRAFT': return { label: 'Draft', color: 'bg-slate-100 text-slate-800', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'SUBMITTED': return { label: 'Lamaran Terkirim', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'REVIEWED': return { label: 'Sedang Direview HR', color: 'bg-indigo-100 text-indigo-800', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'SHORTLISTED': return { label: 'Lolos Administrasi', color: 'bg-yellow-100 text-yellow-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      case 'INTERVIEW': return { label: 'Tahap Wawancara', color: 'bg-purple-100 text-purple-800', icon: <Calendar className="w-4 h-4 mr-1" /> };
      case 'ACCEPTED': return { label: 'Diterima Magang', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      case 'REJECTED': return { label: 'Tidak Lolos', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4 mr-1" /> };
      default: return { label: status, color: 'bg-slate-100 text-slate-800', icon: null };
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Glassmorphism Header */}
      <div className="bg-white/40 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Halo, {user?.nama}! 👋</h1>
          <p className="text-slate-600 text-lg">Pantau status lamaran magang Anda di sini.</p>
        </div>
        <div>
          <Link to="/#lowongan-section" className="bg-blue-600 text-white px-6 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 w-full justify-center md:w-auto">
            Eksplor Lowongan <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {onboarding && ['LOA_ISSUED', 'PLACEMENT_ASSIGNED', 'ACCOUNT_CREATED', 'CHECKLIST_IN_PROGRESS', 'ORIENTATION_SCHEDULED'].includes(onboarding.status) ? (
                <div className="bg-white/60 backdrop-blur-xl p-10 rounded-3xl shadow-sm border border-indigo-100 min-h-[300px]">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Status Onboarding Anda</h2>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                    <p className="text-gray-700 font-medium mb-2">Anda telah diterima di divisi <b>{onboarding.divisi || '-'}</b>.</p>
                    
                    {onboarding.status === 'ORIENTATION_SCHEDULED' ? (
                      <div className="mt-6 border-t border-indigo-200 pt-6">
                        <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2" /> Jadwal Orientasi Anda</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-indigo-700/70 mb-1">Tanggal & Waktu</p>
                            <p className="font-bold text-indigo-900">{new Date(onboarding.jadwal_orientasi).toLocaleString('id-ID')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-indigo-700/70 mb-1">Lokasi</p>
                            {onboarding.lokasi_orientasi ? (
                              <a href={onboarding.lokasi_orientasi} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Buka Peta Orientasi</a>
                            ) : (
                              <p className="font-bold text-indigo-900">-</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 bg-white p-4 rounded-lg border border-indigo-100">
                        <p className="text-indigo-800 text-sm flex items-center"><Clock className="w-4 h-4 mr-2" /> Saat ini Admin sedang memproses data magang Anda atau Anda sedang menunggu jadwal orientasi ditetapkan. Silakan cek halaman Onboarding secara berkala.</p>
                      </div>
                    )}
                    
                    <div className="mt-8">
                      <Link to="/kandidat/onboarding" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                        Buka Halaman Onboarding <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur-xl p-10 rounded-3xl shadow-sm border border-white/50 flex flex-col justify-center items-center text-center min-h-[300px]">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Briefcase className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Belum Ada Lamaran Aktif</h2>
                  <p className="text-slate-500 mb-8 max-w-md leading-relaxed text-lg">
                    Perjalanan magang impian Anda dimulai dari sini. Temukan posisi yang cocok dan jadilah bagian dari inovasi kami!
                  </p>
                  <Link to="/#lowongan-section" className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">
                    Cari Lowongan Magang
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Tips Box */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg text-white flex flex-col justify-center">
              <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2 tracking-tight">
                <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" /> Tips Cepat Lolos
              </h3>
              <ul className="space-y-5">
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-50 leading-relaxed font-medium">Lengkapi profil akun dan riwayat pendidikan Anda secara menyeluruh.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-50 leading-relaxed font-medium">Siapkan CV terbaru dan portofolio terbaik yang relevan dengan posisi.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-50 leading-relaxed font-medium">Perhatikan kualifikasi dan pastikan Anda memenuhi persyaratan dasar.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Alur Seleksi Timeline */}
          <div className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-sm">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-10 text-center tracking-tight">Bagaimana Alur Seleksinya?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
               
               {/* Step 1 */}
               <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 z-10 hover:-translate-y-1 transition-transform">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">1. Pendaftaran</h4>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Kirimkan lamaran dan dokumen pelengkap secara online.</p>
               </div>

               {/* Step 2 */}
               <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 z-10 hover:-translate-y-1 transition-transform">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold mb-4">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">2. Seleksi Berkas</h4>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Tim HR akan meninjau kualifikasi dan CV Anda.</p>
               </div>

               {/* Step 3 */}
               <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 z-10 hover:-translate-y-1 transition-transform">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">3. Wawancara</h4>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Sesi tatap muka online bersama User dan Tim HR.</p>
               </div>

               {/* Step 4 */}
               <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 z-10 hover:-translate-y-1 transition-transform">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold mb-4">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">4. Pengumuman</h4>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Penawaran posisi bagi kandidat yang dinyatakan lolos.</p>
               </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => {
            const statusDisplay = getStatusDisplay(app.status);
            return (
              <div key={app.id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-full flex items-center ${statusDisplay.color}`}>
                      {statusDisplay.icon} {statusDisplay.label}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-md">
                      {new Date(app.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-xl text-slate-900 mb-1 tracking-tight">{app.lowongan.posisi}</h3>
                  <p className="text-sm font-medium text-slate-500 mb-4">{app.lowongan.program.nama}</p>

                  {/* Info Wawancara atau Hasil */}
                  {app.status === 'ACCEPTED' ? (
                    <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-5 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3 shadow-sm">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-green-800 mb-1">Selamat! Anda Diterima</h4>
                      <p className="text-xs text-green-700 mb-4 font-medium">Silakan lanjutkan ke tahap Onboarding.</p>
                      <Link to="/kandidat/onboarding" className="inline-block w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
                        Mulai Onboarding
                      </Link>
                    </div>
                  ) : app.status === 'REJECTED' ? (
                    <div className="mt-6 p-4 bg-red-50 text-red-800 rounded-xl text-sm font-medium border border-red-100 flex items-center shadow-inner">
                       <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 text-red-500" /> 
                       <div>
                         <span className="block font-bold text-base mb-0.5">Tidak Lolos</span>
                         <span className="text-xs mt-1 block opacity-90">Maaf, Anda belum terpilih untuk posisi ini. Tetap semangat!</span>
                       </div>
                    </div>
                  ) : app.interview && (
                    <div className="mt-6 bg-indigo-50 rounded-xl p-5 border border-indigo-100 shadow-inner">
                      <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" /> Jadwal Wawancara
                      </h4>
                      <p className="text-base font-extrabold text-indigo-900 mb-1 leading-tight">
                        {new Date(app.interview.tanggal_waktu).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {app.interview.link_meeting && (
                        <a 
                          href={app.interview.link_meeting} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg transition-colors w-full justify-center shadow-sm"
                        >
                          <Video className="w-4 h-4 mr-2" /> Gabung Meeting Online
                        </a>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardKandidat;
