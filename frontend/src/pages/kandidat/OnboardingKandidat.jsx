import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle, Clock, XCircle, ArrowRight, UploadCloud, Info } from 'lucide-react';
import api from '../../api';

const STEPS = [
  { id: 'WAITING_CONFIRMATION', title: 'Konfirmasi Tawaran', icon: Clock },
  { id: 'DOCUMENT_VERIFICATION', title: 'Verifikasi Dokumen', icon: FileText },
  { id: 'LOA_ISSUED', title: 'Letter of Acceptance', icon: CheckCircle },
  { id: 'CHECKLIST_IN_PROGRESS', title: 'Checklist Onboarding', icon: CheckCircle },
  { id: 'ORIENTATION_SCHEDULED', title: 'Orientasi', icon: Clock },
  { id: 'COMPLETED', title: 'Selesai', icon: CheckCircle },
];

const OnboardingKandidat = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ktpFile, setKtpFile] = useState(null);
  const [ndaFile, setNdaFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchOnboarding();
  }, []);

  const fetchOnboarding = async () => {
    try {
      const res = await api.get('/onboarding/my');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (accept) => {
    try {
      await api.put(`/onboarding/${data.onboarding.id}/respond`, { accept });
      fetchOnboarding();
    } catch (err) {
      alert('Gagal memproses respon');
    }
  };

  const handleChecklist = async (id, is_completed) => {
    try {
      await api.put(`/onboarding/checklist/${id}`, { is_completed });
      fetchOnboarding();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmOrientation = async () => {
    try {
      await api.put(`/onboarding/${data.onboarding.id}/confirm-orientation`);
      alert('Orientasi dikonfirmasi. Anda sekarang adalah Peserta Aktif Magang! Silakan Relogin jika role belum terupdate.');
      window.location.reload();
    } catch (err) {
      alert('Gagal konfirmasi');
    }
  };

  const handleUploadDocs = async () => {
    if (!ktpFile) return alert('Pilih dokumen KTP untuk diunggah');
    setUploading(true);
    const formData = new FormData();
    formData.append('ktp', ktpFile);

    try {
      await api.post(`/onboarding/${data.onboarding.id}/upload-docs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Dokumen KTP berhasil diunggah!');
      setKtpFile(null);
      fetchOnboarding();
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah dokumen: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;
  if (!data || !data.onboarding) return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold">Belum ada proses Onboarding</h2>
      <p className="text-gray-500">Anda belum mencapai tahap onboarding atau pendaftaran Anda belum diterima.</p>
    </div>
  );

  const { onboarding, pendaftaran, dokumen } = data;
  const currentStepIndex = STEPS.findIndex(s => s.id === onboarding.status);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Onboarding: {pendaftaran.lowongan.posisi}</h1>
        <p className="text-gray-500 mt-1">Selesaikan tahapan berikut untuk memulai magang Anda.</p>
        
        {/* Progress Stepper */}
        <div className="mt-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 -translate-y-1/2 transition-all" style={{ width: `${Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 100)}%` }}></div>
          
          <div className="flex justify-between">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = onboarding.status === step.id;
              const isPast = currentStepIndex > idx || onboarding.status === 'COMPLETED';
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${isPast ? 'bg-indigo-600 text-white' : isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-200 text-gray-500'}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${isActive || isPast ? 'text-indigo-800' : 'text-gray-500'}`}>{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Content based on status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {onboarding.status === 'WAITING_CONFIRMATION' && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Selamat! Anda Diterima</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">Kami dengan senang hati menawarkan Anda posisi magang sebagai <b>{pendaftaran.lowongan.posisi}</b>. Apakah Anda menerima tawaran ini?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleRespond(false)} className="px-6 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Tolak Tawaran</button>
              <button onClick={() => handleRespond(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Terima Tawaran</button>
            </div>
          </div>
        )}

        {onboarding.status === 'REJECTED_BY_CANDIDATE' && (
          <div className="text-center py-8 text-red-600">
            <XCircle size={48} className="mx-auto mb-4" />
            <h2 className="text-xl font-bold">Tawaran Ditolak</h2>
            <p>Anda telah menolak tawaran magang ini.</p>
          </div>
        )}

        {(onboarding.status === 'DOCUMENT_VERIFICATION' || onboarding.status === 'DOCUMENT_REVISION') && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <UploadCloud size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {onboarding.status === 'DOCUMENT_VERIFICATION' && dokumen.find(d => d.tipe === 'KTP') ? 'Dokumen Sedang Diverifikasi' : 'Unggah Dokumen Verifikasi'}
              </h2>
            </div>
            <p className="text-gray-500 mb-8 ml-11">
              {onboarding.status === 'DOCUMENT_VERIFICATION' && dokumen.find(d => d.tipe === 'KTP') 
                ? 'Tim kami sedang memeriksa dokumen KTP Anda sebelum menerbitkan Letter of Acceptance (LoA).'
                : 'Tim kami akan memeriksa dokumen Anda sebelum menerbitkan Letter of Acceptance (LoA).'}
            </p>
            
            {onboarding.status === 'DOCUMENT_REVISION' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-5 rounded-r-xl mb-8 flex items-start gap-3 shadow-sm ml-11">
                <Info className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold">Revisi Diperlukan</h4>
                  <p className="text-sm mt-1">Ada dokumen yang perlu direvisi. Silakan unggah ulang dokumen yang sesuai.</p>
                </div>
              </div>
            )}
            
            <div className="ml-11 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Dokumen Anda</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
                
                {/* 1. KTP */}
                {(onboarding.status === 'DOCUMENT_VERIFICATION' && dokumen.find(d => d.tipe === 'KTP')) ? (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-emerald-600">
                      <CheckCircle size={20} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Kartu Tanda Penduduk (KTP)</h4>
                    <p className="text-xs text-emerald-700 font-medium mb-3">Berhasil Diunggah</p>
                    <a href={`http://localhost:5000${dokumen.find(d => d.tipe === 'KTP').file_path}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold w-full transition-colors block">
                      Lihat Dokumen
                    </a>
                  </div>
                ) : (
                  <label className="cursor-pointer border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors group relative overflow-hidden flex flex-col items-center text-center">
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setKtpFile(e.target.files[0])} />
                    <div className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center mb-3 transition-transform ${ktpFile ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-500 group-hover:scale-110'}`}>
                      {ktpFile ? <CheckCircle size={16} /> : <UploadCloud size={16} />}
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Upload KTP</h4>
                    <p className="text-xs text-gray-500 mb-4">PDF/JPG (Max 2MB)</p>
                    {ktpFile ? (
                      <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold w-full truncate border border-emerald-100">
                        {ktpFile.name}
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold w-full">
                        Pilih File
                      </div>
                    )}
                  </label>
                )}

                {/* 2. CV */}
                {pendaftaran.user.profilKandidat?.cv_path && (
                  <div className="border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center bg-white shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-3 text-indigo-600">
                      <FileText size={20} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Curriculum Vitae (CV)</h4>
                    <p className="text-xs text-gray-500 mb-3">Dokumen Pendaftaran</p>
                    <a href={`http://localhost:5000${pendaftaran.user.profilKandidat.cv_path}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold w-full transition-colors block">
                      Lihat Dokumen
                    </a>
                  </div>
                )}

                {/* 3. Surat Pengantar */}
                {pendaftaran.surat_pengantar && (
                  <div className="border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center bg-white shadow-sm">
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-3 text-orange-600">
                      <FileText size={20} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Surat Pengantar</h4>
                    <p className="text-xs text-gray-500 mb-3">Dokumen Pendaftaran</p>
                    <a href={`http://localhost:5000${pendaftaran.surat_pengantar}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold w-full transition-colors block">
                      Lihat Dokumen
                    </a>
                  </div>
                )}

                {/* 4. Transkrip Nilai */}
                {pendaftaran.user.dokumen?.find(d => d.tipe === 'TRANSKRIP') && (
                  <div className="border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center bg-white shadow-sm">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-3 text-purple-600">
                      <FileText size={20} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Transkrip Nilai</h4>
                    <p className="text-xs text-gray-500 mb-3">Dokumen Pendaftaran</p>
                    <a href={`http://localhost:5000${pendaftaran.user.dokumen.find(d => d.tipe === 'TRANSKRIP').file_path}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold w-full transition-colors block">
                      Lihat Dokumen
                    </a>
                  </div>
                )}

                {/* 5. Portofolio */}
                {pendaftaran.user.profilKandidat?.portofolio_url && (
                  <div className="border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center bg-white shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3 text-blue-600">
                      <Info size={20} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">Link Portofolio</h4>
                    <p className="text-xs text-gray-500 mb-3">Tautan Terlampir</p>
                    <a href={pendaftaran.user.profilKandidat.portofolio_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold w-full transition-colors block">
                      Kunjungi URL
                    </a>
                  </div>
                )}
              </div>
            </div>

            {!((onboarding.status === 'DOCUMENT_VERIFICATION' && dokumen.find(d => d.tipe === 'KTP'))) && ktpFile && (
              <div className="mt-8 flex justify-end pr-4">
                <button
                  onClick={handleUploadDocs}
                  disabled={uploading}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
                >
                  <UploadCloud size={20} className="mr-2" />
                  {uploading ? 'Mengunggah...' : 'Kirim Dokumen Verifikasi'}
                </button>
              </div>
            )}
          </div>
        )}

        {onboarding.status === 'LOA_ISSUED' && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Letter of Acceptance Telah Terbit</h2>
            <p className="text-gray-600 mb-6">Silakan unduh dokumen LoA Anda dan tunggu admin menetapkan divisi serta mentor Anda.</p>
            {dokumen.find(d => d.tipe === 'LOA') ? (
              <a href={`http://localhost:5000${dokumen.find(d => d.tipe === 'LOA').file_path}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <FileText size={18} className="mr-2" /> Unduh LoA
              </a>
            ) : (
              <span className="text-gray-500 italic">Dokumen belum tersedia</span>
            )}
          </div>
        )}

        {onboarding.status === 'PLACEMENT_ASSIGNED' && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-4">Menunggu Pembuatan Akun</h2>
            <p className="text-gray-600">Admin sedang menyiapkan kredensial akun magang Anda. Anda telah ditempatkan di divisi <b>{onboarding.divisi}</b>.</p>
          </div>
        )}

        {onboarding.status === 'CHECKLIST_IN_PROGRESS' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Checklist Persiapan</h2>
            <p className="text-gray-600 mb-6">Silakan selesaikan tugas-tugas persiapan berikut sebelum hari pertama Anda.</p>
            <div className="space-y-3">
              {onboarding.checklist.map(task => (
                <label key={task.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${task.is_completed ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}`}>
                  <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-gray-300 mr-4" checked={task.is_completed} onChange={(e) => handleChecklist(task.id, e.target.checked)} />
                  <span className={`flex-1 ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.tugas}</span>
                </label>
              ))}
            </div>
            {onboarding.checklist.every(c => c.is_completed) && (
              <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-lg">
                Mantap! Anda telah menyelesaikan semua checklist. Tunggu jadwal orientasi dari Admin.
              </div>
            )}
          </div>
        )}

        {onboarding.status === 'ORIENTATION_SCHEDULED' && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-6">Jadwal Orientasi</h2>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 inline-block text-left mb-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal & Waktu</p>
                  <p className="font-semibold text-indigo-900">{new Date(onboarding.jadwal_orientasi).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Lokasi / Link</p>
                  <p className="font-semibold text-indigo-900">{onboarding.lokasi_orientasi || '-'}</p>
                  {onboarding.link_orientasi && <a href={onboarding.link_orientasi} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Buka Link Meeting</a>}
                </div>
              </div>
            </div>
            <div>
              <button onClick={handleConfirmOrientation} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center">
                Konfirmasi Kehadiran <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {onboarding.status === 'COMPLETED' && (
          <div className="text-center py-8">
            <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Onboarding Selesai!</h2>
            <p className="text-gray-600 mb-6">Selamat datang! Proses onboarding Anda telah selesai dan Anda sekarang resmi menjadi peserta aktif magang.</p>
            <button onClick={() => window.location.href = '/magang/dashboard'} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Masuk ke Dashboard Magang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingKandidat;
