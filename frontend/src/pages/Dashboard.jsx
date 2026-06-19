import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Clock, FileText, CheckCircle, Download, Calendar, Users } from 'lucide-react';
import api from '../api';
import DashboardAnalitik from './admin/DashboardAnalitik';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [logs, setLogs] = useState([]);
  const [magangUsers, setMagangUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // Modals state
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleReviewLogbook = async (id, status) => {
    try {
      await api.patch(`/aktivitas/${id}/approve`, { status });
      setLogs(prevLogs => prevLogs.map(log => log.id === id ? { ...log, status } : log));
      setSelectedLogbook(null);
    } catch (err) {
      console.error('Failed to review log', err);
      alert('Gagal mereview logbook');
    }
  };

  useEffect(() => {
    if (user?.role === 'MAGANG' || user?.role === 'PEMBIMBING') {
      const fetchData = async () => {
        try {
          const resLogs = await api.get('/aktivitas');
          setLogs(resLogs.data.data || []);
          
          if (user?.role === 'PEMBIMBING' || user?.role === 'MENTOR') {
            const resUsers = await api.get('/users/magang');
            setMagangUsers(resUsers.data.data || []);
          }
        } catch (error) {
          console.error("Error fetching data for dashboard:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else if (user?.role === 'ADMIN') {
      const fetchAdminData = async () => {
        try {
          const resStats = await api.get('/admin/stats');
          setAdminStats(resStats.data.data);
        } catch (error) {
          console.error("Error fetching admin stats:", error);
          setAdminError(error.response?.data?.message || error.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAdminData();
    }
  }, [user]);

  // Different dashboard views based on roles
  if (user?.role?.toUpperCase() === 'KANDIDAT') {
    return <Navigate to="/kandidat/dashboard" replace />;
  }

  if (user?.role === 'ADMIN') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
          <Link to="/admin/users" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Manajemen Pengguna
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
        ) : adminError ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
            Error loading stats: {adminError}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Magang" value={adminStats?.totalMagang || 0} icon={Users} color="bg-blue-500" />
              <StatCard title="Pembimbing" value={adminStats?.totalPembimbing || 0} icon={CheckCircle} color="bg-emerald-500" />
              <StatCard title="Aktivitas Hari Ini" value={adminStats?.aktivitasHariIni || 0} icon={FileText} color="bg-indigo-500" />
              <StatCard title="Pending Review" value={adminStats?.pendingReview || 0} icon={Clock} color="bg-amber-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Activity className="mr-2 text-indigo-500" size={20} />
                  Daftar Aktivitas Terbaru
                </h2>
              </div>
              
              {adminStats?.recentAktivitas && adminStats.recentAktivitas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500 text-sm">
                        <th className="pb-3 font-medium">Anak Magang</th>
                        <th className="pb-3 font-medium">Tanggal</th>
                        <th className="pb-3 font-medium">Judul Logbook</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {adminStats.recentAktivitas.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4">
                            <p className="font-semibold text-gray-800 text-sm">{log.user?.nama}</p>
                            <p className="text-xs text-gray-500">{log.user?.universitas}</p>
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="py-4 text-sm text-gray-800 font-medium">
                            {log.judul}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                              ${log.status === 'DISETUJUI' ? 'bg-green-100 text-green-700' : 
                                log.status === 'TERKIRIM' ? 'bg-blue-100 text-blue-700' : 
                                log.status === 'REVISI' ? 'bg-orange-100 text-orange-700' : 
                                log.status === 'TELAT_MENGISI' ? 'bg-red-100 text-red-700' : 
                                'bg-gray-100 text-gray-700'}`}>
                              {log.status === 'TERKIRIM' ? 'Menunggu Penilaian' : log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  Belum ada aktivitas yang masuk ke sistem.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN') {
    return <DashboardAnalitik />;
  }

  if (user?.role === 'PEMBIMBING' || user?.role === 'MENTOR') {
    const anakBimbinganCount = magangUsers.length;
    const perluDinilai = logs.filter(log => log.status === 'TERKIRIM');
    const totalDisetujui = logs.filter(log => log.status === 'DISETUJUI').length;
    const telatAtauDitolak = logs.filter(log => log.status === 'TELAT_MENGISI');

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Pembimbing</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Anak Bimbingan" value={anakBimbinganCount} icon={Activity} color="bg-indigo-500" />
          <StatCard title="Logbook Perlu Dinilai" value={perluDinilai.length} icon={FileText} color="bg-amber-500" />
          <StatCard title="Total Disetujui" value={totalDisetujui} icon={CheckCircle} color="bg-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Menunggu Evaluasi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="mr-2 text-amber-500" size={20} />
              Menunggu Evaluasi
            </h2>
            {isLoading ? (
              <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
            ) : perluDinilai.length > 0 ? (
              <div className="space-y-3">
                {perluDinilai.slice(0, 5).map(log => (
                  <div key={log.id} className="p-3 border border-gray-100 rounded-lg bg-amber-50/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{log.user?.nama}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(log.tanggal).toLocaleDateString('id-ID')}</p>
                      </div>
                      <button onClick={() => setSelectedLogbook(log)} className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded font-medium hover:bg-amber-200 transition-colors">
                        Tinjau
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">Tidak ada logbook yang perlu dinilai.</div>
            )}
          </div>

          {/* Telat Mengisi / Ditolak */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="mr-2 text-red-500" size={20} />
              Aktivitas Telat / Ditolak
            </h2>
            {isLoading ? (
              <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div></div>
            ) : telatAtauDitolak.length > 0 ? (
              <div className="space-y-3">
                {telatAtauDitolak.slice(0, 5).map(log => (
                  <div key={log.id} className="p-3 border border-red-100 rounded-lg bg-red-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{log.user?.nama}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(log.tanggal).toLocaleDateString('id-ID')}</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                        Telat Mengisi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">Tidak ada aktivitas telat.</div>
            )}
          </div>
        </div>

        {/* Daftar Anak Bimbingan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="mr-2 text-indigo-500" size={20} />
            Daftar Anak Bimbingan
          </h2>
          {isLoading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
          ) : magangUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 text-sm">
                    <th className="pb-3 font-medium">Nama / Universitas</th>
                    <th className="pb-3 font-medium text-center">Absensi (Bulan Ini)</th>
                    <th className="pb-3 font-medium text-center">Total Logbook</th>
                    <th className="pb-3 font-medium text-center">Sisa Magang</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {magangUsers.map(magang => {
                    // Kalkulasi absensi bulan berjalan
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    const userLogs = logs.filter(l => l.user_id === magang.id && l.status !== 'DRAFT');
                    
                    const absensiBulanIni = userLogs.filter(l => {
                      const d = new Date(l.tanggal);
                      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    }).length;

                    // Kalkulasi sisa hari magang (Senin - Jumat)
                    let sisaHari = '-';
                    if (magang.tanggal_selesai) {
                      const end = new Date(magang.tanggal_selesai);
                      const now = new Date();
                      end.setHours(0, 0, 0, 0);
                      now.setHours(0, 0, 0, 0);
                      
                      if (end <= now) {
                        sisaHari = 'Selesai';
                      } else {
                        let count = 0;
                        let cur = new Date(now);
                        while (cur < end) {
                          cur.setDate(cur.getDate() + 1);
                          const day = cur.getDay();
                          if (day !== 0 && day !== 6) count++;
                        }
                        sisaHari = count > 0 ? `${count} Hari` : 'Selesai';
                      }
                    }

                    return (
                      <tr key={magang.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              {magang.nama.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{magang.nama}</p>
                              <p className="text-xs text-gray-500">{magang.universitas || 'Universitas -'} • {magang.jurusan || 'Jurusan -'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {absensiBulanIni} Hari
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="font-semibold text-gray-700">{userLogs.length}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${sisaHari === 'Selesai' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                            {sisaHari}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button onClick={() => setSelectedProfile(magang)} className="inline-flex items-center px-3 py-1.5 border border-indigo-100 text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg text-xs font-medium transition-colors">
                            Profil
                          </button>
                          <Link to={`/pembimbing/monitor?user=${magang.id}`} className="inline-flex items-center px-3 py-1.5 border border-indigo-100 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium transition-colors">
                            Aktivitas
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">Belum ada data anak bimbingan.</div>
          )}
        </div>

        {/* MODAL REVIEW LOGBOOK */}
      {selectedLogbook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Tinjau Logbook</h3>
              <button onClick={() => setSelectedLogbook(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                  {selectedLogbook.user?.nama?.charAt(0) || '?'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{selectedLogbook.user?.nama}</h4>
                  <p className="text-sm text-gray-500">{new Date(selectedLogbook.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {selectedLogbook.waktu_mulai} - {selectedLogbook.waktu_selesai}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Deskripsi Kegiatan</h5>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 whitespace-pre-wrap">{selectedLogbook.deskripsi_kegiatan}</div>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Hasil / Output</h5>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 whitespace-pre-wrap">{selectedLogbook.hasil_kegiatan}</div>
                </div>
                {selectedLogbook.kendala && (
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Kendala yang Dihadapi</h5>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-700 whitespace-pre-wrap">{selectedLogbook.kendala}</div>
                  </div>
                )}
                {selectedLogbook.lampiran && selectedLogbook.lampiran.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-700 mb-2">Lampiran Foto</h5>
                    <div className="flex flex-wrap gap-4">
                      {selectedLogbook.lampiran.map(lamp => (
                        <a key={lamp.id} href={`http://localhost:5000${lamp.file_path}`} target="_blank" rel="noopener noreferrer" className="block group">
                          <img src={`http://localhost:5000${lamp.file_path}`} alt={lamp.nama_file} className="w-32 h-32 object-cover rounded-xl border border-gray-200 group-hover:shadow-md transition-shadow" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/80 flex justify-end space-x-3 rounded-b-2xl">
              <button onClick={() => handleReviewLogbook(selectedLogbook.id, 'TELAT_MENGISI')} className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors shadow-sm">
                Tolak / Revisi
              </button>
              <button onClick={() => handleReviewLogbook(selectedLogbook.id, 'DISETUJUI')} className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center">
                <CheckCircle size={18} className="mr-2" />
                Setujui Logbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROFIL ANAK MAGANG */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-6 pb-6 relative">
              <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              <div className="-mt-16 mb-4 flex justify-center">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                  <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                    {selectedProfile.nama.charAt(0)}
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{selectedProfile.nama}</h3>
                <p className="text-indigo-600 font-medium">{selectedProfile.nickname ? `"${selectedProfile.nickname}"` : ''}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span className="truncate">{selectedProfile.email || 'Belum diisi'}</span>
                </div>
                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  <span className="truncate">{selectedProfile.universitas || 'Universitas belum diisi'}</span>
                </div>
                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  <span className="truncate">{selectedProfile.jurusan || 'Jurusan belum diisi'} {selectedProfile.semester ? `(Smstr ${selectedProfile.semester})` : ''}</span>
                </div>
                <div className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span className="truncate">Tgl Selesai: {selectedProfile.tanggal_selesai ? new Date(selectedProfile.tanggal_selesai).toLocaleDateString('id-ID') : 'Belum diisi'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  // Calculate stats untuk magang
  // Hanya hitung jam dari logbook yang sudah disetujui atau dikirim
  const validLogs = logs.filter(log => log.status !== 'DRAFT');
  
  const hitungMingguKe = () => {
    if (logs.length === 0) return 1;
    const sortedDates = [...logs].map(l => new Date(l.tanggal)).sort((a, b) => a - b);
    const firstDate = sortedDates[0];
    
    // Dapatkan hari Senin dari minggu pertama magang
    const firstMonday = new Date(firstDate);
    const day1 = firstMonday.getDay() || 7; // Convert Minggu(0) ke 7
    firstMonday.setDate(firstMonday.getDate() - day1 + 1);
    firstMonday.setHours(0, 0, 0, 0);
    
    // Dapatkan hari Senin dari minggu ini
    const today = new Date();
    const dayToday = today.getDay() || 7;
    const currentMonday = new Date(today);
    currentMonday.setDate(currentMonday.getDate() - dayToday + 1);
    currentMonday.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(currentMonday - firstMonday);
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return diffWeeks + 1;
  };

  const mingguKe = hitungMingguKe();

  const totalHari = validLogs.length;

  let statusEvaluasi = "Belum Ada Data";
  if (validLogs.length > 0) {
    const adaTelat = validLogs.some(log => log.status === 'TELAT_MENGISI');
    const semuaDisetujui = validLogs.every(log => log.status === 'DISETUJUI');
    
    if (adaTelat) statusEvaluasi = "Perlu Ditingkatkan";
    else if (semuaDisetujui) statusEvaluasi = "Sangat Baik";
    else statusEvaluasi = "Baik";
  }

  // Define Handlers for Magang Dashboard
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/aktivitas');
      setLogs(res.data.data || []);
    } catch (error) {
      console.error("Error fetching logs for dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (log) => {
    navigate('/magang/logbook', { state: { editLog: log } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus laporan ini?')) {
      try {
        await api.delete(`/aktivitas/${id}`);
        fetchLogs();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Gagal menghapus logbook');
      }
    }
  };

  const handleKirimDraft = async (id) => {
    try {
      await api.patch(`/aktivitas/${id}/kirim`);
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim logbook');
    }
  };

  const handleExportExcel = async (monthStr) => {
    try {
      const response = await api.get(`/aktivitas/export?monthStr=${encodeURIComponent(monthStr)}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Magang_${monthStr.replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal export excel:", err);
      alert('Gagal mengunduh laporan bulanan');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'TERKIRIM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DISETUJUI': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'TELAT_MENGISI': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'TERKIRIM': return 'Menunggu Review';
      case 'DISETUJUI': return 'Disetujui';
      case 'TELAT_MENGISI': return 'Telat Mengisi (Ditolak)';
      default: return status;
    }
  };

  // Group logs by month
  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.tanggal);
    const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(log);
    return acc;
  }, {});

  // Dapatkan nama hari besok
  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  const namaHariBesok = besok.toLocaleDateString('id-ID', { weekday: 'long' });

  // Kalkulasi sisa hari magang (Senin - Jumat)
  const sisaHari = () => {
    if (!user?.tanggal_selesai) return '-';
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
      if (day !== 0 && day !== 6) { // Bukan Minggu (0) dan bukan Sabtu (6)
        count++;
      }
    }
    
    return count;
  };

  // Default to magang
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Selamat datang kembali, {user?.nickname || user?.nama} <span className="inline-block origin-bottom-right hover:rotate-12 transition-transform">👋</span></h1>
          <p className="text-gray-600 mt-1.5 font-medium">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Minggu ke-{mingguKe} magang
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/magang/logbook" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center">
            + Isi Logbook Baru
          </Link>
        </div>
      </div>

      <div className="bg-emerald-50/80 text-emerald-800 px-5 py-3.5 rounded-xl border border-emerald-100 flex items-center shadow-sm">
        <p className="text-sm">
          <span className="font-bold mr-1.5">Pengingat:</span>
          Laporan Aktivitas wajib dikirim sebelum {namaHariBesok} pukul 17.00
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Minggu Masuk" value={`Minggu ke-${mingguKe}`} icon={Clock} color="bg-blue-500" />
        <StatCard title="Logbook Terisi" value={`${totalHari} Hari`} icon={FileText} color="bg-indigo-500" />
        <StatCard title="Sisa Magang" value={`${sisaHari()} Hari`} icon={Calendar} color="bg-amber-500" />
        <StatCard title="Status Evaluasi" value={statusEvaluasi} icon={CheckCircle} color={statusEvaluasi === 'Perlu Ditingkatkan' ? 'bg-red-500' : 'bg-emerald-500'} />
      </div>



      {/* Riwayat Logbook Dipindahkan dari Logbook.jsx */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-800">Riwayat Aktivitas Anda</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada aktivitas</h3>
            <p className="text-gray-500">Anda belum membuat catatan logbook. Klik tombol "Isi Logbook Baru" untuk memulai.</p>
          </div>
        ) : (
            <div className="divide-y divide-gray-100">
            {Object.entries(groupedLogs).map(([month, monthLogs]) => {
              const terkirimCount = monthLogs.filter(l => l.status !== 'DRAFT').length;

              return (
                <div key={month} className="mb-8">
                  {/* Month Header */}
                  <div className="flex items-center space-x-4 mb-4 px-6 pt-4">
                    <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center shadow-sm">
                      <span className="font-bold text-indigo-800">{month}</span>
                      <span className="mx-2 text-indigo-300">|</span>
                      <span className="text-indigo-600 text-sm font-medium">
                        {terkirimCount} Laporan Terkirim
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <button 
                      onClick={() => handleExportExcel(month)}
                      className="flex items-center space-x-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
                    >
                      <Download size={16} />
                      <span>Unduh Laporan</span>
                    </button>
                  </div>

                  {/* Logs in this month */}
                  <div className="divide-y divide-gray-100 px-6">
                    {monthLogs.map((log) => {
                      const createdDate = new Date(log.created_at || new Date());
                      createdDate.setHours(0, 0, 0, 0);
                      const activityDate = new Date(log.tanggal);
                      activityDate.setHours(0, 0, 0, 0);
                      const isLate = (createdDate - activityDate) / (1000 * 60 * 60 * 24) > 1;

                      return (
                        <div key={log.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg text-gray-800">Laporan Aktivitas</h3>
                            <div className="flex space-x-2">
                              {isLate && (
                                <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-red-50 text-red-700 border-red-200">
                                  Terlambat
                                </span>
                              )}
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(log.status)}`}>
                                {getStatusText(log.status)}
                              </span>
                            </div>
                          </div>
                        
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <Activity size={14} className="mr-1.5" />
                              {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="flex items-center" title="Waktu Aktivitas">
                              <Clock size={14} className="mr-1.5" />
                              {log.waktu_mulai} - {log.waktu_selesai}
                            </div>
                            <div className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-xs font-medium" title="Waktu Ditambahkan">
                              Ditambahkan: {new Date(log.created_at || new Date()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Deskripsi: </span>
                              <span className="text-gray-600 leading-relaxed block mt-0.5 whitespace-pre-wrap">{log.deskripsi_kegiatan}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Hasil: </span>
                              <span className="text-gray-600 leading-relaxed block mt-0.5 whitespace-pre-wrap">{log.hasil_kegiatan}</span>
                            </div>
                            {log.kendala && (
                              <div>
                                <span className="font-medium text-gray-700">Kendala: </span>
                                <span className="text-gray-600 leading-relaxed block mt-0.5 whitespace-pre-wrap">{log.kendala}</span>
                              </div>
                            )}

                            {log.lampiran && log.lampiran.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="font-medium text-gray-700 text-sm mb-2 block">Lampiran Foto:</span>
                                <div className="flex flex-wrap gap-3">
                                  {log.lampiran.map(lamp => (
                                    <a key={lamp.id} href={`http://localhost:5000${lamp.file_path}`} target="_blank" rel="noopener noreferrer" className="block group">
                                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                        <img 
                                          src={`http://localhost:5000${lamp.file_path}`} 
                                          alt={lamp.nama_file}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(log.status === 'DRAFT' || log.status === 'TERKIRIM') && (
                              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                                <button
                                  onClick={() => handleDelete(log.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                                >
                                  Hapus
                                </button>
                                <button
                                  onClick={() => handleEdit(log)}
                                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                                >
                                  Edit
                                </button>
                                {log.status === 'DRAFT' && (
                                  <button
                                    onClick={() => handleKirimDraft(log.id)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-sm transition-colors"
                                  >
                                    Kirim Sekarang
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

export default Dashboard;
