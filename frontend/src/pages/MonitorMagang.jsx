import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Users, FileText, CheckCircle, Clock, AlertCircle, Calendar, Check, Filter, ArrowLeft } from 'lucide-react';
import api from '../api';

const MonitorMagang = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialUserFilter = searchParams.get('user') || 'ALL';

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterUser, setFilterUser] = useState(initialUserFilter);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/aktivitas');
      setLogs(res.data.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
      setError('Gagal memuat data logbook.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleReview = async (id, status) => {
    try {
      await api.patch(`/aktivitas/${id}/approve`, { status });
      // Update local state to reflect the change
      setLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === id ? { ...log, status } : log
        )
      );
    } catch (err) {
      console.error('Failed to review log', err);
      alert('Gagal mereview logbook');
    }
  };

  // Unique interns for dropdown
  const uniqueUsers = Array.from(new Set(logs.map(log => log.user_id)))
    .map(id => {
      const user = logs.find(log => log.user_id === id)?.user;
      return { id, nama: user?.nama };
    })
    .filter(u => u.nama);

  // Apply filters
  const filteredLogs = logs.filter(log => {
    const matchStatus = filterStatus === 'ALL' || log.status === filterStatus;
    const matchUser = filterUser === 'ALL' || log.user_id.toString() === filterUser.toString();
    return matchStatus && matchUser;
  });

  // Calculate stats based on current filter
  const totalLogs = filteredLogs.length;
  const pendingLogs = filteredLogs.filter(log => log.status === 'TERKIRIM').length;
  const approvedLogs = filteredLogs.filter(log => log.status === 'DISETUJUI').length;
  const lateLogs = filteredLogs.filter(log => log.status === 'TELAT_MENGISI').length;

  const groupedLogs = React.useMemo(() => {
    const groups = {};
    const sorted = [...filteredLogs].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    sorted.forEach(log => {
      const date = new Date(log.tanggal);
      const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(log);
    });
    
    return groups;
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="p-2 bg-white text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 rounded-xl transition-colors shadow-sm" title="Kembali ke Dashboard">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Monitor Aktivitas Magang</h1>
            <p className="text-gray-500 mt-1">Pantau dan setujui laporan harian (logbook) dari anak magang.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-3 border border-red-100">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Laporan</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalLogs}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Menunggu Review</p>
            <h3 className="text-2xl font-bold text-gray-800">{pendingLogs}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Telah Disetujui</p>
            <h3 className="text-2xl font-bold text-gray-800">{approvedLogs}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Telat / Ditolak</p>
            <h3 className="text-2xl font-bold text-gray-800">{lateLogs}</h3>
          </div>
        </div>
      </div>

      {/* Logbook List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-800">Daftar Laporan Masuk</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada data</h3>
            <p className="text-gray-500">Tidak ada logbook yang sesuai dengan filter saat ini.</p>
          </div>
        ) : (
          <div className="space-y-8 pb-8">
            {Object.entries(groupedLogs).map(([monthYear, monthLogs]) => (
              <div key={monthYear}>
                {/* Pembatas Bulan */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center shadow-sm">
                    <span className="font-bold text-indigo-800">{monthYear}</span>
                    <span className="mx-2 text-indigo-300">|</span>
                    <span className="text-indigo-600 text-sm font-medium">
                      {monthLogs.length} Laporan 
                      {monthLogs.filter(l => l.status === 'TERKIRIM').length > 0 && 
                        <span className="ml-1 text-amber-600">({monthLogs.filter(l => l.status === 'TERKIRIM').length} Menunggu)</span>
                      }
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Daftar Logbook */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                  {monthLogs.map((log) => {
                    // Cek status real dari logbook (TELAT_MENGISI langsung dari DB)
                    const isLate = log.status === 'TELAT_MENGISI';

                    return (
                <div key={log.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-800">{log.user?.nama || 'Unknown User'}</h3>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1.5" />
                          {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1.5" />
                          {log.waktu_mulai} - {log.waktu_selesai}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm border-l-2 border-indigo-100 pl-4 ml-1">
                        <div>
                          <span className="font-medium text-gray-700">Deskripsi Kegiatan: </span>
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
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3 shrink-0">
                      <div className="flex items-center space-x-2">
                        {isLate && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-red-50 text-red-700 border-red-200">
                            Terlambat
                          </span>
                        )}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center ${
                          log.status === 'DISETUJUI' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : log.status === 'TELAT_MENGISI'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {log.status === 'DISETUJUI' ? 'Disetujui' : log.status === 'TELAT_MENGISI' ? 'Telat Mengisi' : 'Menunggu Review'}
                        </span>
                      </div>

                      {log.status === 'TERKIRIM' && (
                        <div className="flex flex-col space-y-2 mt-2">
                          <button
                            onClick={() => handleReview(log.id, 'DISETUJUI')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1.5 shadow-sm w-full"
                          >
                            <Check size={16} />
                            <span>Setujui Laporan</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorMagang;
