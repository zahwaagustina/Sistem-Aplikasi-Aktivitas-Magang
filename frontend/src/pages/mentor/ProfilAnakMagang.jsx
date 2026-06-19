import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, BookOpen, Clock, Activity, FileText, CheckCircle, XCircle, Award } from 'lucide-react';
import FormEvaluasi from './FormEvaluasi';

const ProfilAnakMagang = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEvaluasiModalOpen, setIsEvaluasiModalOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('logbook'); // 'logbook', 'tugas', 'evaluasi'

  useEffect(() => {
    if (!state?.userId) {
      navigate('/mentor/monitor');
      return;
    }
    fetchDetail();
  }, [state?.userId]);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/mentor/anak-magang/${state.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
    } catch (error) {
      console.error('Error fetching detail:', error);
      alert('Gagal mengambil data detail');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLogbook = async (logbookId, status, komentar = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/mentor/logbook/${logbookId}/approve`, 
        { status, komentar_mentor: komentar },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Refresh data
      fetchDetail();
    } catch (error) {
      console.error('Error approving logbook:', error);
      alert('Gagal mengupdate logbook');
    }
  };

  const handleSelesaikan = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menyelesaikan program untuk anak magang ini dan menerbitkan sertifikat?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/mentor/generate-sertifikat/${state.userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Program berhasil diselesaikan dan sertifikat telah diterbitkan!');
      fetchDetail();
    } catch (error) {
      console.error('Error generate sertifikat:', error);
      alert(error.response?.data?.message || 'Gagal menerbitkan sertifikat. Pastikan laporan akhir sudah diunggah.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  if (!data) return null;

  const { profil, logbooks, tugas, evaluasi, absensi } = data;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Back Button */}
      <button 
        onClick={() => navigate('/mentor/monitor')}
        className="flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Daftar
      </button>

      {/* Profil Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 relative">
        {/* Cover Background (Indigo Theme with Stripes) */}
        <div className="h-32 bg-indigo-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="diagonalStripes" width="40" height="40" patternTransform="rotate(45)">
                  <rect width="20" height="40" fill="#4f46e5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#diagonalStripes)" />
            </svg>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 md:px-10 pb-8 relative">
          
          {/* Avatar (Overlapping cover) */}
          <div className="absolute -top-16 border-4 border-white rounded-full bg-indigo-50 h-32 w-32 flex items-center justify-center shadow-md">
            <User className="w-16 h-16 text-indigo-400" />
            <div className="absolute bottom-2 right-2 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Action Buttons (Right Aligned) */}
          <div className="flex justify-end pt-4 space-x-3 mb-6">
            <button 
              onClick={() => setIsEvaluasiModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Beri Evaluasi
            </button>
            {profil.status !== 'SELESAI' && (
              <button 
                onClick={handleSelesaikan}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Luluskan Program
              </button>
            )}
          </div>

          {/* User Name & Info */}
          <div className="mt-2 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{profil.user?.nama}</h1>
            <p className="text-gray-500 font-medium mt-1">{profil.universitas} • {profil.jurusan}</p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 pt-6 border-t border-gray-100 bg-gray-50/50 -mx-6 md:-mx-10 px-6 md:px-10 pb-4">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">ID Magang</p>
              <p className="font-semibold text-gray-900">{profil.id_magang || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Divisi</p>
              <p className="font-semibold text-gray-900">{profil.divisi || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email</p>
              <p className="font-semibold text-gray-900">{profil.user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">No. Telepon</p>
              <p className="font-semibold text-gray-900">{profil.user?.no_telepon || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex">
        <button 
          onClick={() => setActiveTab('logbook')}
          className={`flex-1 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'logbook' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" /> Logbook ({logbooks.length})
        </button>
        <button 
          onClick={() => setActiveTab('tugas')}
          className={`flex-1 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'tugas' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
        >
          <FileText className="w-4 h-4 inline mr-2" /> Tugas / Task ({tugas.length})
        </button>
        <button 
          onClick={() => setActiveTab('evaluasi')}
          className={`flex-1 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'evaluasi' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
        >
          <Activity className="w-4 h-4 inline mr-2" /> Evaluasi ({evaluasi.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {activeTab === 'logbook' && (
          <div className="space-y-6">
            {logbooks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada logbook yang dikirim.</p>
            ) : (
              logbooks.map(log => (
                <div key={log.id} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h4>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1.5" /> {log.waktu_mulai} - {log.waktu_selesai}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${log.status === 'DISETUJUI' ? 'bg-green-100 text-green-700' : 
                          log.status === 'TERKIRIM' ? 'bg-amber-100 text-amber-700' : 
                          log.status === 'REVISI' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Deskripsi Kegiatan</p>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{log.deskripsi_kegiatan}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hasil & Kendala</p>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap"><span className="font-semibold text-gray-800">Hasil:</span> {log.hasil_kegiatan}</p>
                      {log.kendala && <p className="text-red-600 text-sm whitespace-pre-wrap mt-1"><span className="font-semibold">Kendala:</span> {log.kendala}</p>}
                    </div>

                    {/* Lampiran */}
                    {log.lampiran && log.lampiran.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lampiran Foto</p>
                        <div className="flex gap-2">
                          {log.lampiran.map(lamp => (
                            <a key={lamp.id} href={`http://localhost:5000${lamp.file_path}`} target="_blank" rel="noreferrer" className="w-16 h-16 rounded overflow-hidden border border-gray-200">
                              <img src={`http://localhost:5000${lamp.file_path}`} className="w-full h-full object-cover" alt="Lampiran" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {log.status === 'TERKIRIM' && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                      <button 
                        onClick={() => handleApproveLogbook(log.id, 'DISETUJUI')}
                        className="flex-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Setujui
                      </button>
                      <button 
                        onClick={() => {
                          const catatan = prompt('Masukkan alasan revisi / ditolak:');
                          if(catatan) handleApproveLogbook(log.id, 'REVISI', catatan);
                        }}
                        className="flex-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Minta Revisi
                      </button>
                    </div>
                  )}
                  {log.komentar_mentor && (
                    <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                      <p className="text-xs font-bold text-indigo-800 uppercase mb-1">Komentar Anda:</p>
                      <p className="text-sm text-indigo-900">{log.komentar_mentor}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tugas' && (
          <div className="space-y-4">
            {tugas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada tugas yang diberikan.</p>
            ) : (
              tugas.map(t => (
                <div key={t.id} className="border border-gray-100 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800">{t.judul}</h4>
                    <p className="text-sm text-gray-500">Deadline: {new Date(t.deadline).toLocaleDateString('id-ID')} • Prioritas: <span className="font-semibold">{t.prioritas}</span></p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {t.status}
                  </span>
                </div>
              ))
            )}
            <p className="text-sm text-center text-gray-400 italic mt-6">Manajemen tugas selengkapnya dapat diakses dari menu Task Board (mendatang).</p>
          </div>
        )}

        {activeTab === 'evaluasi' && (
          <div className="space-y-6">
            {evaluasi.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada evaluasi yang diberikan untuk peserta ini.</p>
            ) : (
              evaluasi.map(ev => {
                const totalScore = ((ev.skor_teknis + ev.skor_komunikasi + ev.skor_disiplin + ev.skor_inisiatif + ev.skor_teamwork) / 5).toFixed(1);
                return (
                  <div key={ev.id} className="border border-gray-200 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div>
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">{ev.tipe}</span>
                        <p className="text-sm text-gray-500">Diberikan pada: {new Date(ev.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Skor Rata-Rata</p>
                        <p className="text-3xl font-extrabold text-emerald-600">{totalScore}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Teknis</p>
                        <p className="font-bold text-gray-800">{ev.skor_teknis}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Komunikasi</p>
                        <p className="font-bold text-gray-800">{ev.skor_komunikasi}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Disiplin</p>
                        <p className="font-bold text-gray-800">{ev.skor_disiplin}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Inisiatif</p>
                        <p className="font-bold text-gray-800">{ev.skor_inisiatif}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Teamwork</p>
                        <p className="font-bold text-gray-800">{ev.skor_teamwork}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-2">Feedback Mentor:</p>
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                        {ev.feedback}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal Evaluasi */}
      {isEvaluasiModalOpen && (
        <FormEvaluasi 
          pesertaId={state.userId} 
          onClose={() => setIsEvaluasiModalOpen(false)}
          onSuccess={() => {
            setIsEvaluasiModalOpen(false);
            fetchDetail();
          }}
        />
      )}
    </div>
  );
};

export default ProfilAnakMagang;
