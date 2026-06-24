import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, BookOpen, Clock, Activity, FileText, CheckCircle, XCircle, Award, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FormEvaluasi from './FormEvaluasi';

const ProfilAnakMagang = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const userId = state?.userId || searchParams.get('userId');
  const initialTab = searchParams.get('tab') || 'logbook';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEvaluasiModalOpen, setIsEvaluasiModalOpen] = useState(false);
  const [isConfirmSelesaiOpen, setIsConfirmSelesaiOpen] = useState(false);
  
  const [isFormTugasOpen, setIsFormTugasOpen] = useState(false);
  const [formTugas, setFormTugas] = useState({
    judul: '', deskripsi: '', deadline: '', prioritas: 'MEDIUM'
  });

  const [isReviewTugasOpen, setIsReviewTugasOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [selectedTugasForReview, setSelectedTugasForReview] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [fileFeedback, setFileFeedback] = useState(null);

  const [activeTab, setActiveTab] = useState(initialTab); // 'logbook', 'tugas', 'evaluasi'

  useEffect(() => {
    if (!userId) {
      navigate('/mentor/monitor');
      return;
    }
    fetchDetail();
  }, [userId]);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/mentor/anak-magang/${userId}`, {
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

  const handleSelesaikan = () => {
    const hasFinalEval = data?.evaluasi?.some(ev => ev.tipe === 'FINAL');
    if (!hasFinalEval) {
      toast.error('Silahkan beri nilai evaluasi terlebih dahulu');
      return;
    }
    setIsConfirmSelesaiOpen(true);
  };

  const executeSelesaikan = async () => {
    setIsConfirmSelesaiOpen(false);
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`http://localhost:5000/api/mentor/generate-sertifikat/${userId}`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      alert('Sertifikat kelulusan otomatis berhasil diterbitkan dan program diselesaikan!');
      fetchDetail();
    } catch (error) {
      console.error('Error generate sertifikat:', error);
      alert(error.response?.data?.message || 'Gagal menerbitkan sertifikat.');
      setLoading(false);
    }
  };

  const handleCreateTugas = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/mentor/tugas', {
        peserta_id: userId,
        ...formTugas
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFormTugasOpen(false);
      setFormTugas({ judul: '', deskripsi: '', deadline: '', prioritas: 'MEDIUM' });
      fetchDetail();
    } catch (error) {
      console.error('Error create tugas:', error);
      alert('Gagal membuat tugas baru');
    }
  };

  const handleDeleteTugas = async (id) => {
    if(!window.confirm('Hapus tugas ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/mentor/tugas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDetail();
    } catch (error) {
      console.error('Error delete tugas:', error);
      alert('Gagal menghapus tugas');
    }
  };

  const executeReviewTugas = async (status) => {
    if (status === 'IN_PROGRESS' && !reviewFeedback.trim()) {
      toast.error('Keterangan revisi wajib diisi!');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('status', status);
      formData.append('feedback', reviewFeedback);
      if (fileFeedback) formData.append('file_feedback', fileFeedback);

      await axios.put(`http://localhost:5000/api/mentor/tugas/${selectedTugasForReview.id}/review`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsReviewTugasOpen(false);
      setIsRevisionModalOpen(false);
      setSelectedTugasForReview(null);
      setReviewFeedback('');
      setFileFeedback(null);
      fetchDetail();
    } catch (error) {
      console.error('Error review tugas:', error);
      alert('Gagal mengirim review tugas');
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileUrl, e) => {
    e.preventDefault();
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = fileUrl.split('/').pop() || 'hasil_tugas';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Gagal mengunduh file. Coba gunakan tombol Lihat Hasil lalu simpan secara manual.');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  if (!data) return null;

  const { profil, logbooks, tugas, evaluasi, absensi, laporan_akhir } = data;
  const hasFinalEval = evaluasi?.some(ev => ev.tipe === 'FINAL');
  const hasLaporan = !!laporan_akhir;

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tanggal,Check-In,Check-Out,Status/Keterangan\n";

    absensi.forEach(row => {
      const tanggal = new Date(row.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const checkIn = row.waktu_masuk ? new Date(row.waktu_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
      const checkOut = row.waktu_keluar ? new Date(row.waktu_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
      const statusKet = `${row.status} ${row.keterangan ? '- ' + row.keterangan : ''}`.replace(/,/g, '');

      csvContent += `${tanggal},${checkIn},${checkOut},${statusKet}\n`;
    });

    const hadir = absensi.filter(a => a.status === 'HADIR').length;
    const izin = absensi.filter(a => a.status === 'IZIN').length;
    const sakit = absensi.filter(a => a.status === 'SAKIT').length;
    const alpa = absensi.filter(a => a.status === 'ALPA' || a.status === 'TANPA KETERANGAN').length;

    csvContent += `\nRekapitulasi:\n`;
    csvContent += `Hadir,${hadir}\n`;
    csvContent += `Izin,${izin}\n`;
    csvContent += `Sakit,${sakit}\n`;
    csvContent += `Tanpa Keterangan,${alpa}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Absensi_${profil?.user?.nama || 'Peserta'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            {hasLaporan && (
              <a 
                href={`http://localhost:5000${laporan_akhir.file_path}`}
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                Lihat Laporan
              </a>
            )}
            <button 
              onClick={() => hasLaporan && !hasFinalEval && setIsEvaluasiModalOpen(true)}
              disabled={hasFinalEval || !hasLaporan}
              className={`${hasFinalEval ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : !hasLaporan ? 'bg-amber-100 text-amber-600 cursor-not-allowed border border-amber-200' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} px-5 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2`}
              title={!hasLaporan ? 'Peserta belum mengunggah laporan akhir' : ''}
            >
              <Award className="w-4 h-4" />
              {hasFinalEval ? 'Evaluasi Telah Dikirim' : !hasLaporan ? 'Menunggu Laporan' : 'Beri Evaluasi'}
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
        <button 
          onClick={() => setActiveTab('absensi')}
          className={`flex-1 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'absensi' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
        >
          <Clock className="w-4 h-4 inline mr-2" /> Absensi ({absensi.length})
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
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5" /> {log.waktu_mulai} - {log.waktu_selesai}
                        </p>
                        <p className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center font-medium">
                          Disubmit pada {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
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
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleApproveLogbook(log.id, 'DISETUJUI')}
                        className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Setujui
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
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setIsFormTugasOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                + Berikan Tugas Baru
              </button>
            </div>
            
            {tugas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada tugas yang diberikan.</p>
            ) : (
              tugas.map(t => (
                <div key={t.id} className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{t.judul}</h4>
                      <p className="text-sm text-gray-500">Deadline: {new Date(t.deadline).toLocaleDateString('id-ID')} • Prioritas: <span className="font-semibold">{t.prioritas}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'DONE' ? 'bg-green-100 text-green-700' : t.status === 'REVIEW' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                        {t.status}
                      </span>
                      {t.status === 'REVIEW' && (
                        <button 
                          onClick={() => {
                            setSelectedTugasForReview(t);
                            setReviewFeedback(t.feedback || '');
                            setIsReviewTugasOpen(true);
                          }}
                          className="px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs font-bold rounded-lg transition-colors"
                        >
                          Tinjau Hasil
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteTugas(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Tugas"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {t.feedback && (
                    <div className="mt-2 ml-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Feedback Anda:</p>
                      <p className="text-sm text-gray-700">{t.feedback}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'evaluasi' && (
          <div className="space-y-6">
            {evaluasi.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada evaluasi yang diberikan untuk peserta ini.</p>
            ) : (
              evaluasi.map(ev => {
                return (
                  <div key={ev.id} className="border border-gray-200 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div>
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">{ev.tipe}</span>
                        <p className="text-sm text-gray-500">Diberikan pada: {new Date(ev.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Skor Akhir</p>
                        <p className="text-3xl font-extrabold text-emerald-600">{ev.skor_akhir ? ev.skor_akhir.toFixed(1) : '-'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Sikap (30%)</p>
                        <p className="font-bold text-gray-800">{ev.skor_sikap ? ev.skor_sikap.toFixed(1) : '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Kinerja (40%)</p>
                        <p className="font-bold text-gray-800">{ev.skor_kinerja ? ev.skor_kinerja.toFixed(1) : '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Keterampilan (20%)</p>
                        <p className="font-bold text-gray-800">{ev.skor_keterampilan ? ev.skor_keterampilan.toFixed(1) : '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Administrasi (10%)</p>
                        <p className="font-bold text-gray-800">{ev.skor_administrasi ? ev.skor_administrasi.toFixed(1) : '-'}</p>
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

        {activeTab === 'absensi' && (
          <div className="space-y-6">
            {absensi.length > 0 && (
              <div className="flex flex-col gap-4 mb-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Ringkasan Kehadiran</h3>
                  <button onClick={handleDownloadCSV} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition-colors text-sm border border-indigo-100">
                    <Download className="w-4 h-4" /> Unduh Laporan (.csv)
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Hadir</p>
                  <p className="text-2xl font-black text-emerald-700">{absensi.filter(a => a.status === 'HADIR').length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Izin</p>
                  <p className="text-2xl font-black text-blue-700">{absensi.filter(a => a.status === 'IZIN').length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Sakit</p>
                  <p className="text-2xl font-black text-amber-700">{absensi.filter(a => a.status === 'SAKIT').length}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Tanpa Keterangan</p>
                  <p className="text-2xl font-black text-red-700">{absensi.filter(a => a.status === 'ALPA' || a.status === 'TANPA KETERANGAN').length}</p>
                </div>
                </div>
              </div>
            )}
            
            {absensi.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada riwayat absensi untuk peserta ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                      <th className="p-4 font-semibold rounded-tl-lg">Tanggal</th>
                      <th className="p-4 font-semibold">Check-In</th>
                      <th className="p-4 font-semibold">Check-Out</th>
                      <th className="p-4 font-semibold">Status / Keterangan</th>
                      <th className="p-4 font-semibold rounded-tr-lg">Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absensi.map((absen) => (
                      <tr key={absen.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm font-medium text-gray-800">
                          {new Date(absen.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {absen.waktu_masuk ? new Date(absen.waktu_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {absen.waktu_keluar ? new Date(absen.waktu_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              absen.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                              absen.status === 'IZIN' ? 'bg-amber-100 text-amber-800' :
                              absen.status === 'SAKIT' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {absen.status}
                            </span>
                            {absen.keterangan && <span className="text-xs text-gray-500 max-w-[200px] truncate" title={absen.keterangan}>{absen.keterangan}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          {absen.bukti_path ? (
                            <a href={`http://localhost:5000${absen.bukti_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">Lihat Bukti</a>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Selesai */}
      {isConfirmSelesaiOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Kelulusan</h3>
              <p className="text-gray-500 text-sm mb-4">
                Apakah Anda yakin ingin menyelesaikan program magang untuk peserta ini?
              </p>
              
              <div className="mt-2 p-4 bg-indigo-50 text-indigo-800 text-xs rounded-xl border border-indigo-100 text-left">
                <p className="font-semibold mb-1 flex items-center gap-1"><Award size={14}/> Sistem Otomasi Aktif</p>
                <p>Sistem akan secara otomatis membuatkan dan menerbitkan Sertifikat Kelulusan resmi menggunakan template perusahaan. Sertifikat akan langsung dapat diunduh oleh anak magang.</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmSelesaiOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={executeSelesaikan}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Terbitkan Sertifikat & Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Evaluasi */}
      {isEvaluasiModalOpen && (
        <FormEvaluasi 
          profilId={profil.id} 
          pesertaId={userId}
          onClose={() => setIsEvaluasiModalOpen(false)}
          onSuccess={() => {
            setIsEvaluasiModalOpen(false);
            fetchDetail();
          }}
        />
      )}

      {/* Modal Form Tugas */}
      {isFormTugasOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Berikan Tugas Baru</h3>
              <button onClick={() => setIsFormTugasOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTugas} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
                <input 
                  type="text" 
                  required
                  value={formTugas.judul}
                  onChange={(e) => setFormTugas({...formTugas, judul: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Misal: Buat Laporan Mingguan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea 
                  required
                  rows="3"
                  value={formTugas.deskripsi}
                  onChange={(e) => setFormTugas({...formTugas, deskripsi: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Penjelasan detail mengenai tugas..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={formTugas.deadline}
                    onChange={(e) => setFormTugas({...formTugas, deadline: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                  <select 
                    value={formTugas.prioritas}
                    onChange={(e) => setFormTugas({...formTugas, prioritas: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormTugasOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700">
                  Simpan & Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Review Tugas */}
      {isReviewTugasOpen && selectedTugasForReview && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Tinjau Hasil Tugas</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedTugasForReview.judul}</p>
              </div>
              <button onClick={() => setIsReviewTugasOpen(false)} className="text-gray-400 hover:text-gray-600 mt-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              
              {selectedTugasForReview.file_hasil ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">File Hasil Kerja</p>
                      <p className="text-xs text-indigo-700">Diunggah oleh anak magang</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={`http://localhost:5000${selectedTugasForReview.file_hasil}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50 transition"
                    >
                      Lihat Hasil
                    </a>
                    <button 
                      onClick={(e) => handleDownloadFile(`http://localhost:5000${selectedTugasForReview.file_hasil}`, e)}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                      Unduh File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 italic">Tidak ada file yang dilampirkan.</p>
                </div>
              )}

              {/* Kolom text area telah dihapus, pindah ke pop-up saat tombol diklik */}

            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsRevisionModalOpen(true)}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-bold transition-colors"
              >
                Minta Revisi
              </button>
              <button 
                onClick={() => executeReviewTugas('DONE')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Terima & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Revisi Custom */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Keterangan Revisi</h3>
              <button onClick={() => setIsRevisionModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Instruksi Revisi <span className="text-red-500">*</span></label>
              <textarea 
                rows="4"
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className={`w-full p-3 border-gray-300 rounded-xl shadow-sm focus:ring-red-500 ${!reviewFeedback.trim() ? 'focus:border-red-500' : 'focus:border-red-500'}`}
                placeholder="Jelaskan secara detail bagian mana yang harus diperbaiki oleh peserta..."
                autoFocus
              ></textarea>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lampiran (Opsional)</label>
                <input 
                  type="file" 
                  onChange={(e) => setFileFeedback(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 border border-gray-300 rounded-xl"
                  accept="image/png, image/jpeg, application/pdf"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => executeReviewTugas('IN_PROGRESS')}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                Kirim Revisi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilAnakMagang;
